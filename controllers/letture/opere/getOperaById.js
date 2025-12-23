import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function getOperaById(req, res) {
    try {
        const { id_opera } = req.params;

        const { data: opera, error } = await supabase
            .from('get_all_opere_view')
            .select('*')
            .eq('id_opera', id_opera)
            .single();

        if (error && error.code === 'PGRST204') { // Codice per 'No rows found'
            return res.status(404).json({ message: 'Opera non trovata' });
        }
        if (error) {
            throw new Error(error.message);
        }

        res.json(opera);
    } catch (error) {
        await errorLogger(`[getOperaById] - Errore durante il recupero dell'opera con ID ${req.params.id_opera}: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante il recupero dell\'opera' });
    }
}