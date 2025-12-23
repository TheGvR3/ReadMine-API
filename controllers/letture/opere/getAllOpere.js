import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function getAllOpere(req, res) {
    try {

        const { data: opere, error } = await supabase
            .from('get_all_opere_view')
            .select('*')
            .order('titolo', { ascending: true });

        if (error) {
            throw new Error(error.message);
        }

        if (opere.length === 0) {
            return res.status(404).json({ message: 'Nessuna opera trovata' });
        }

        res.json(opere);
    } catch (error) {
        await errorLogger(`[getAllOpere] - Errore durante il recupero delle opere: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante il recupero delle opere' });
    }
}