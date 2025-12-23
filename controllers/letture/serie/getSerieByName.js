import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function getSerieByName(req, res) {
    try {
        const { nome_serie } = req.params;
        const { data: serie, error } = await supabase
            .from('serie')
            .select('*')
            .eq('nome_serie', nome_serie)
            .single();

        if (error && error.code === 'PGRST204') {
            return res.status(404).json({ message: 'Serie non trovata' });
        }
        if (error) {
            throw new Error(error.message);
        }

        res.json(serie);
    } catch (error) {
        await errorLogger(`[getSerieByName] - Errore durante il recupero della serie con nome ${req.params.nome_serie}: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante il recupero della serie' });
    }
}
