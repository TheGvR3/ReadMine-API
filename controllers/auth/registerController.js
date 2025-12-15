import bcrypt from "bcryptjs";
import { supabase } from "../../db.js";
import { errorLogger } from "../../middlewares/errorLogger.js";

export async function register(req, res) {
    const { email, password, nome, cognome, data_nascita, indirizzo, telefono } = req.body;

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

        await supabase
            .from('users')
            .insert([{ email, password: hashed, nome, cognome, data_nascita: date, indirizzo, telefono }]);

        res.json({ message: "Utente registrato con successo!" });
    } catch (error) {
        await errorLogger(`[register] - Errore durante la registrazione per email: ${email} - Errore: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: "Errore durante la registrazione" });

    }
}