import { supabase } from "../../db.js";
import { Resend } from 'resend';
import { errorLogger } from "../../middlewares/errorLogger.js";

export async function requestEditorRole(req, res) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const userId = req.user.userId;

    try {
        // 1. Recupera i dati dell'utente e controlla se ha richieste attive
        const { data: user, error: userError } = await supabase
            .from("users")
            .select("email, nome, editor")
            .eq("id", userId)
            .single();

        if (userError || !user) return res.status(404).json({ error: "Utente non trovato" });
        if (user.editor) return res.status(400).json({ error: "Sei già un editor" });

        // --- CONTROLLO RICHIESTE PRECEDENTI ---
        const { data: existingRequest } = await supabase
            .from("editor_requests")
            .select("id, status")
            .eq("user_id", userId)
            .single();

        if (existingRequest) {
            if (existingRequest.status === 'pending') {
                return res.status(400).json({ error: "Hai già una richiesta in sospeso" });
            }

            if (existingRequest.status === 'rejected') {
                // Se era rifiutata, <span style="color: red;">eliminiamo</span> la vecchia per far posto alla nuova
                // (Mantenendo il vincolo UNIQUE del database pulito)
                await supabase.from("editor_requests").delete().eq("id", existingRequest.id);
            }

            // Se lo stato fosse 'approved', non arriverebbe qui grazie al controllo user.editor
        }

        // 2. <span style="color: green;">Crea</span> la nuova richiesta
        const { error: insertError } = await supabase
            .from("editor_requests")
            .insert([{ user_id: userId, status: 'pending' }]);

        if (insertError) throw insertError;

        // 3. INVIO EMAIL (Logica invariata...)
        await resend.emails.send({
            from: 'ReadMine <onboarding@resend.dev>',
            to: user.email,
            subject: 'Richiesta ruolo Editor ricevuta',
            html: `<h2>Ciao ${user.nome || 'utente'},</h2><p>Abbiamo ricevuto la tua nuova richiesta...</p>`
        });

        // Notifica Admin
        await resend.emails.send({
            from: 'Sistema <onboarding@resend.dev>',
            to: 'saracino.g.ivano@gmail.com',
            subject: '🔔 Nuova richiesta ruolo Editor',
            html: `<p>L'utente <strong>${user.nome}</strong> ha inviato una richiesta.</p>
                   <a href="https://read-mine.vercel.app/">Vai al pannello admin</a>`
        });

        res.status(201).json({ message: "Richiesta inviata con successo" });

    } catch (error) {
        await errorLogger(`[requestEditorRole] - Errore: ${error.message}`);
        res.status(500).json({ error: "Errore durante l'invio della richiesta" });
    }
}