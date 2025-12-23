import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function updateSerie(req, res) {
    const { id_serie } = req.params;
    const { nome_serie } = req.body;
    try {

        const { data: updatedRows, error } = await supabase
            .from('serie')
            .update({ nome_serie })
            .eq('id_serie', id_serie)
            .select('*'); // Chiedi i dati aggiornati o []

        if (error) {
            // Se nome_serie è già presente (e UNIQUE), il DB lancerà 23505
            if (error.code === '23505') {
                await errorLogger(`[updateSerie] - Tentativo di aggiornare una serie con lo stesso nome: ${nome_serie}`).catch(console.error);
                return res.status(400).json({ error: 'Serie con lo stesso nome già esistente' });
            }
            throw new Error(error.message);
        }
        // Se la riga non esisteva
        if (updatedRows.length === 0) {
            return res.status(404).json({ message: 'Serie non trovata' });
        }

        res.json({ message: 'Serie aggiornata con successo' });
    } catch (error) {
        await errorLogger(`[updateSerie] - Errore durante l'aggiornamento della serie: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante l\'aggiornamento della serie' });
    }
}
