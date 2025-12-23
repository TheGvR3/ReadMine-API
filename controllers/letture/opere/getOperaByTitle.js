import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function getOperaByTitle(req, res) {
    try {
        const { titolo } = req.params;

        const { data: opera, error } = await supabase
            .from('get_all_opere_view')
            .select('*')
            .eq('titolo', titolo)
            .single();

        if (error && error.code === 'PGRST204') {
            return res.status(404).json({ message: 'Opera non trovata' });
        }
        if (error) {
            throw new Error(error.message);
        }

        res.json(opera);
    } catch (error) {
        await errorLogger(`[getOperaByTitle] - Errore durante il recupero dell'opera con titolo ${req.params.titolo}: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante il recupero dell\'opera' });
    }
}