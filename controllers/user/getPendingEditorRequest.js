import { supabase } from "../../db.js";
import { errorLogger } from "../../middlewares/errorLogger.js";

// Aggiungi questa esportazione al tuo file dei controller
export async function getPendingEditorRequests(req, res) {
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
            .eq("status", "pending")
            .order("created_at", { ascending: true }); // Le più vecchie per prime

        if (error) throw error;

        res.status(200).json(data);
    } catch (error) {
        await errorLogger(`[getPendingEditorRequests] - Errore: ${error.message}`);
        res.status(500).json({ error: "Errore nel recupero delle richieste in sospeso" });
    }
}