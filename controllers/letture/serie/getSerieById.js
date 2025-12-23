import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function getSerieById(req, res) {
    try {
        const { id_serie } = req.params;
        const { data: serie, error } = await supabase
            .from('serie')
            .select('*')
            .eq('id_serie', id_serie)
            .single();

        if (error && error.code === 'PGRST204') {
            return res.status(404).json({ message: 'Serie non trovata' });
        }
        if (error) {
            throw new Error(error.message);
        }

        res.json(serie);
    } catch (error) {
        await errorLogger(`[getSerieById] - Errore durante il recupero della serie con ID ${req.params.id}: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante il recupero della serie' });
    }
}