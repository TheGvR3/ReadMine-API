import bcrypt from "bcryptjs";
import { Resend } from 'resend';
import { supabase } from "../../db.js";
import { errorLogger } from "../../middlewares/errorLogger.js";

export async function register(req, res) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    if (!resend) {
        return res.status(500).json({ error: "Servizio email non configurato correttamente" });
    }
    const { email, password, nome, cognome, data_nascita, indirizzo, telefono } = req.body;

    let created_at = new Date().toISOString();

    try {

        // Controllo se l'email esiste gia
        const { data: existsMail, error: existsError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .limit(1);

        if (existsError) throw existsError;

        if (existsMail.length > 0) {
            return res.status(400).json({ error: "Email già registrata" });
        }

        // Cifro la password
        const hashed = await bcrypt.hash(password, 10);
        const date = (data_nascita === "0000-00-00" || !data_nascita) ? null : data_nascita;

        const { data, error: insertError } = await supabase
            .from('users')
            .insert([{
                email,
                password: hashed,
                nome,
                cognome,
                data_nascita: date,
                indirizzo,
                telefono,
                created_at
            }])
            .select(); // Fondamentale per confermare l'avvenuto inserimento

        // Se c'è un errore (es. colonne sbagliate o RLS), ora lo becchiamo
        if (insertError) {
            await errorLogger(`[register] - Errore durante l'inserimento dell'utente per email: ${email} - Errore: ${insertError.message}\n`).catch(console.error);
            return res.status(400).json({ error: insertError.message });
        }

        // 4. INVIO EMAIL CON RESEND
        // Se sei in modalità test senza dominio, 'from' deve essere 'onboarding@resend.dev'
        // 'to' deve essere la tua stessa email se non hai verificato un dominio.
        await resend.emails.send({
            from: 'Sicurezza <onboarding@resend.dev>',
            to: email,
            subject: '⚠️ Sicurezza Account: Password modificata',
            html: `
                <div style="font-family: sans-serif; color: #333;">
                    <h2>Ciao ${nome || 'utente'},</h2>
                    <p>Ti informiamo che il tuo account ReadMine è stato appena **creato con successo**.</p>
                    <p>Se non sei stato tu, ti preghiamo di contattare immediatamente il supporto.</p>
                    <p>Per accedere al tuo account, visita il nostro sito e utilizza l'email ${email}.</p>
                    <hr />
                    <small>Questa è una notifica automatica di sicurezza non è spam.</small>
                </div>
            `
        });

        res.json({ message: "Utente registrato con successo!" });
    } catch (error) {
        await errorLogger(`[register] - Errore durante la registrazione per email: ${email} - Errore: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: "Errore durante la registrazione" });

    }
}