import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function getOpereBySerie(req, res) {
    try {
        const { id_serie } = req.params;

        const { data: opere, error } = await supabase
            .from('get_all_opere_view')
            .select('*')
            .eq('id_serie', id_serie);

        if (opere.length === 0) {
            return res.status(404).json({ message: 'Nessuna opera trovata per questa serie' });
        }
        if (error) {
            throw new Error(error.message);
        }

        res.json(opere);
    } catch (error) {
        await errorLogger(`[getOpereBySerie] - Errore durante il recupero delle opere per la serie con ID ${req.params.id_serie}: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante il recupero delle opere per la serie' });
    }
}