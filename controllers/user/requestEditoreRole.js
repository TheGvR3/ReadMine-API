import { supabase } from "../../db.js";
import { Resend } from 'resend';
import { errorLogger } from "../../middlewares/errorLogger.js";

export async function requestEditorRole(req, res) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const userId = req.user.userId; // Preso dal middleware di autenticazione

    try {
        // 1. Recupera i dati dell'utente per l'email e per controllare se è già editor
        const { data: user, error: userError } = await supabase
            .from("users")
            .select("email, nome, editor")
            .eq("id", userId)
            .single();

        if (userError || !user) {
            return res.status(404).json({ error: "Utente non trovato" });
        }

        // Se l'utente è già editor, non serve fare la richiesta
        if (user.editor) {
            return res.status(400).json({ error: "Sei già un editor" });
        }

        // 2. <span style="color: green;">Crea</span> la richiesta nella tabella editor_requests
        // Usiamo l'ID dell'utente (int8 come da tuo schema)
        const { error: insertError } = await supabase
            .from("editor_requests")
            .insert([
                {
                    user_id: userId,
                    status: 'pending'
                }
            ]);

        // Se fallisce per il vincolo UNIQUE (che abbiamo messo nello SQL), l'utente ha già una richiesta attiva
        if (insertError) {
            if (insertError.code === '23505') {
                return res.status(400).json({ error: "Hai già una richiesta in sospeso" });
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

        res.status(201).json({ message: "Richiesta inviata e notifiche email spedite" });

    } catch (error) {
        await errorLogger(`[requestEditorRole] - Errore per utente ${userId}: ${error.message}`);
        res.status(500).json({ error: "Errore durante l'invio della richiesta" });
    }
}