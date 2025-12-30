import { supabase } from "../../db.js";
import { errorLogger } from "../../middlewares/errorLogger.js";

export async function getUserProfile(req, res) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, nome, cognome, data_nascita, indirizzo, telefono, created_at, editor")
      .eq("id", req.user.userId)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: "Utente non trovato" });
    }

    res.json(data);
  } catch (error) {
    await errorLogger(`[getUserProfile]  - Errore nel recupero del profilo: ${error.message}`).catch(console.error);
    res.status(500).json({ error: "Errore interno del server" });
  }
}
