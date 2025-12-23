import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function getTipo(req, res) {
    try {
        const { data: rows, error } = await supabase
            .from("tipo")
            .select("*")
            .order("id_tipo", { ascending: true });

        if (error) {
            throw error;
        }

        res.json(rows);
    } catch (error) {
        await errorLogger(`[getTipo] - Errore durante il recupero del tipo: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante il recupero del tipo' });
    }
}