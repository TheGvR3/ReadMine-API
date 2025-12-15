import { supabase } from "../../db.js";
import { errorLogger } from "../../middlewares/errorLogger.js";

/**
 * 🔹 Aggiornamento profilo utente
 */
export async function updateProfile(req, res) {
    const userId = req.user.userId;
    const { email, nome, cognome, data_nascita, indirizzo, telefono } = req.body;

    try {
        // Controlla se l'utente esiste
        const { data: existing, error: existingError } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .limit(1)
          .single();
        if (!existing) {
            return res.status(404).json({ error: "Utente non trovato" });
        }

        // Se l'email è cambiata, verifica che non esista già
        if (email) {
            const { data: emailExists, error: emailError } = await supabase
              .from("users")
              .select("id")
              .eq("email", email)
              .neq("id", userId)
              .limit(1)
              .single();
            if (emailExists) {
                return res.status(400).json({ error: "Email già utilizzata da un altro utente" });
            }
        }

        // Aggiorna solo i campi forniti
        const { error: updateError } = await supabase
          .from("users")
          .update({
            email: email,
            nome: nome,
            cognome: cognome,
            data_nascita: data_nascita,
            indirizzo: indirizzo,
            telefono: telefono
          })
          .eq("id", userId);
        if (updateError) {
          throw updateError;
        }
        res.json({ message: "Profilo aggiornato con successo" });
    } catch (error) {
        await errorLogger(`[updateProfile] - Errore durante updateProfile per utente ${userId}: ${error.message}`);
        res.status(500).json({ error: "Errore durante l'aggiornamento del profilo" });
    }
}


