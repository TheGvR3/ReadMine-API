import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function getLetturaById(req, res) {
    const { id_lettura } = req.params;

    try {
        // Recuperiamo la lettura specifica includendo i dettagli dell'opera
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
            .maybeSingle(); // Restituisce l'oggetto o null (non un array)

        if (error) {
            throw new Error(error.message);
        }

        if (!data) {
            return res.status(404).json({ message: 'Lettura non trovata' });
        }

        res.json(data);
    } catch (error) {
        await errorLogger(
            `[getLetturaById] - Errore durante il recupero della lettura: ${error.message}`
        ).catch(console.error);
        
        res.status(500).json({ 
            error: 'Errore interno durante il recupero della lettura' 
        });
    }
}