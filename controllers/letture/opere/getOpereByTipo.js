import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function getOpereByTipo(req, res) {
    try {
        const { id_tipo } = req.params;

        const { data: opere, error } = await supabase
            .from('get_all_opere_view')
            .select('*')
            .eq('tipo_opera', id_tipo);

        if (opere.length === 0) {
            return res.status(404).json({ message: 'Nessuna opera trovata per questa tipo' });
        }
        if (error) {
            throw new Error(error.message);
        }

        res.json(opere);
    } catch (error) {
        await errorLogger(`[getOpereByTipo] - Errore durante il recupero delle opere per la tipo con ID ${req.params.id_tipo}: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante il recupero delle opere per la tipo' });
    }
}