import { supabase } from "../../db.js";
import { errorLogger } from "../../middlewares/errorLogger.js";


export async function getEditorRequestsHistory(req, res) {
    try {
        const { data, error } = await supabase
            .from("editor_requests")
            .select(`
                id,
                status,
                created_at,
                user_id,
                users (
                    nome,
                    cognome,
                    email
                )
            `)
            // Prendiamo tutto ciò che NON è in sospeso
            .neq("status", "pending") 
            .order("created_at", { ascending: false }); // Le più recenti in alto

        if (error) throw error;

        res.status(200).json(data);
    } catch (error) {
        await errorLogger(`[getEditorRequestsHistory] - Errore: ${error.message}`);
        res.status(500).json({ error: "Errore nel recupero dello storico richieste" });
    }
}