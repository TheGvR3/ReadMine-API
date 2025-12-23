import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function getAllOpereOrderAuthor(req, res) {
    try {

        const { data: rows, error } = await supabase
            .from('get_all_opere_view')
            .select('*')
            .order('autori', { ascending: true });

        res.json(rows);
    } catch (error) {
        await errorLogger(`[getAllOpere] - Errore durante il recupero delle opere: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante il recupero delle opere' });
    }
}
