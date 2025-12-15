import bcrypt from "bcryptjs";
import { supabase } from "../../db.js";
import { errorLogger } from "../../middlewares/errorLogger.js";

export async function updatePassword(req, res) {
    const userId = req.user.userId;
    const { oldPassword, newPassword } = req.body;

    try {
        // Recupera l'utente
        const { data: user, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .limit(1)
          .single();

        if (!user) {
            return res.status(404).json({ error: "Utente non trovato" });
        }
        // Confronta la vecchia password
        const valid = await bcrypt.compare(oldPassword, user.password);
        if (!valid) {
            return res.status(401).json({ error: "Vecchia password errata" });
        }

        // Cifra la nuova password
        const hashed = await bcrypt.hash(newPassword, 10);

        if (oldPassword === newPassword) {
            return res.status(400).json({ error: "La nuova password deve essere diversa dalla vecchia password" });
        }


        // Aggiorna la password nel database
        const { error: updateError } = await supabase
          .from("users")
          .update({ password: hashed })
          .eq("id", userId);

        if (updateError) {
          throw updateError;
        }

        res.json({ message: "Password aggiornata con successo" });
    } catch (error) {
        await errorLogger(`[updatePassword] - Errore durante updatePassword per utente ${userId}: ${error.message}`);
        res.status(500).json({ error: "Errore durante l'aggiornamento della password" });
    }
}