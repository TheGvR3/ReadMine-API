import { supabase } from "../../db.js";
import { Resend } from 'resend';
import { errorLogger } from "../../middlewares/errorLogger.js";

export async function handleEditorRequest(req, res) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { requestId, status } = req.body; // status: 'approved' oppure 'rejected'

    try {
        // 1. Recupera i dettagli della richiesta e dell'utente associato
        const { data: request, error: reqError } = await supabase
            .from("editor_requests")
            .select("*, users(id, email, nome)")
            .eq("id", requestId)
            .single();

        if (reqError || !request) {
            return res.status(404).json({ error: "Richiesta non trovata" });
        }

        const targetUser = request.users;

        if (status === 'approved') {
            // 2. <span style="color: blue;">Modifica</span> l'utente: diventa editor (true)
            const { error: userUpdateError } = await supabase
                .from("users")
                .update({ editor: true })
                .eq("id", targetUser.id);

            if (userUpdateError) throw userUpdateError;

            // 3. <span style="color: blue;">Modifica</span> la richiesta: segna come approvata
            await supabase.from("editor_requests").update({ status: 'approved' }).eq("id", requestId);

            // 4. Invia email di conferma all'utente
            await resend.emails.send({
                from: 'ReadMine <onboarding@resend.dev>',
                to: targetUser.email,
                subject: 'Richiesta Editor Approvata! 🎉',
                html: `<p>Ciao ${targetUser.nome}, la tua richiesta è stata accettata. Ora sei un Editor!</p>`
            });

        } else if (status === 'rejected') {
            // <span style="color: red;">Rifiuta</span> la richiesta
            // Possiamo decidere se aggiornare lo stato o <span style="color: red;">eliminarla</span> direttamente
            await supabase.from("editor_requests").update({ status: 'rejected' }).eq("id", requestId);

            await resend.emails.send({
                from: 'ReadMine <onboarding@resend.dev>',
                to: targetUser.email,
                subject: 'Aggiornamento richiesta Editor',
                html: `<p>Ciao ${targetUser.nome}, purtroppo la tua richiesta non è stata accettata in questo momento.</p>`
            });
        }

        res.json({ message: `Richiesta ${status === 'approved' ? 'approvata' : 'rifiutata'} con successo` });

    } catch (error) {
        await errorLogger(`[handleEditorRequest] - Errore: ${error.message}`);
        res.status(500).json({ error: "Errore durante la gestione della richiesta" });
    }
}