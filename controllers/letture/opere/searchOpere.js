import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function searchOpere(req, res) {
    try {
        const { titolo } = req.params;

        const { data: opere, error } = await supabase
            .from('get_all_opere_view')
            .select('*')
            .ilike('titolo', `%${titolo}%`);

        if (error) {
            throw new Error(error.message);
        }

        if (opere.length === 0) {
            return res.status(404).json({ message: 'Nessuna opera trovata' });
        }

        res.json(opere);
    } catch (error) {
        await errorLogger(`[searchOpere] - Errore durante la ricerca della opera con nome ${req.params.titolo}: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante la ricerca della opera' });
    }
}