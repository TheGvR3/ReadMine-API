import { supabase } from "../../db.js";
import { Resend } from 'resend';
import { errorLogger } from "../../middlewares/errorLogger.js";

export async function requestEditorRole(req, res) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const userId = req.user.userId;

    try {
        const { data: user, error: userError } = await supabase
            .from("users")
            .select("email, nome, editor")
            .eq("id", userId)
            .single();

        if (userError || !user) return res.status(404).json({ error: "Utente non trovato" });
        if (user.editor) return res.status(400).json({ error: "Sei già un editor" });

        // 1. <span style="color: green;">Crea</span> direttamente la nuova richiesta
        // Non facciamo più la DELETE. Il database userà l'indice creato sopra
        // per decidere se accettare l'inserimento o bloccarlo.
        const { error: insertError } = await supabase
            .from("editor_requests")
            .insert([{ user_id: userId, status: 'pending' }]);

        if (insertError) {
            // Se il database risponde con errore di duplicato (23505)
            // significa che esiste già una richiesta 'pending'
            if (insertError.code === '23505') {
                return res.status(400).json({ error: "Hai già una richiesta in sospeso. Attendi la valutazione." });
            }
            throw insertError;
        }

        // 3. INVIO EMAIL ALL'UTENTE (Conferma ricezione)
        await resend.emails.send({
            from: 'ReadMine <onboarding@resend.dev>',
            to: user.email,
            subject: 'Richiesta ruolo Editor ricevuta',
            html: `
        <div style="font-family: sans-serif; color: #333;">
            <h2>Ciao ${user.nome || 'utente'},</h2>
            <p>Abbiamo ricevuto la tua richiesta per diventare **Editor**.</p>
            <p>Riceverai un'email non appena la richiesta verrà elaborata.</p>
        </div>
      `
        });

        // 4. INVIO EMAIL ALL'ADMIN (Notifica nuova richiesta)
        await resend.emails.send({
            from: 'Sistema <onboarding@resend.dev>',
            to: 'saracino.g.ivano@gmail.com',
            subject: '🔔 Nuova richiesta ruolo Editor',
            html: `
        <div style="font-family: sans-serif; color: #333;">
            <h2>Nuova richiesta ricevuta</h2>
            <p>L'utente <strong>${user.nome} ${user.cognome || ''}</strong> (${user.email}) ha richiesto di diventare un <strong>Editor</strong>.</p>
            <p>Puoi gestire la richiesta direttamente dal pannello admin.</p>
            <p></p><a href="https://read-mine.vercel.app/">Vai al pannello admin</a></p>
            <hr />
            <small>ID Utente: ${userId}</small>
        </div>
      `
        });

        res.status(201).json({ message: "Richiesta inviata con successo" });

    } catch (error) {
        await errorLogger(`[requestEditorRole] - Errore: ${error.message}`);
        res.status(500).json({ error: "Errore durante l'invio della richiesta" });
    }
}