import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function getLetturaById(req, res) {
    const { id_lettura } = req.params;

    try {
        const { data, error } = await supabase
            .from('letture')
            .select(`
                *,
                opere (
                    id_opera,
                    titolo,
                    editore,
                    stato_opera
                )
            `)
            .eq('id_lettura', id_lettura)
            .maybeSingle(); // Fondamentale: estrae l'oggetto direttamente

        if (error) throw new Error(error.message);

        if (!data) {
            return res.status(404).json({ error: 'Lettura non trovata' });
        }

        res.json(data);
    } catch (error) {
        await errorLogger(`[getLetturaById] - Errore: ${error.message}`);
        res.status(500).json({ error: 'Errore interno nel recupero della lettura' });
    }
}