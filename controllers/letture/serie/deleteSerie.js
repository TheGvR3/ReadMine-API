import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function deleteSerie(req, res) {
    const { id_serie } = req.params;
    try {
        const { error, count } = await supabase
            .from('serie')
            .delete()
            .eq('id_serie', id_serie)
            .select('*', { count: 'exact' }); // Conta le righe eliminate

        if (error) {
            throw new Error(error.message);
        }
        if (count === 0) { 
            return res.status(404).json({ message: 'Serie non trovata' });
        }

        res.json({ message: 'Serie eliminata con successo' });
    } catch (error) {
        await errorLogger(`[deleteSerie] - Errore durante l'eliminazione della serie: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante l\'eliminazione della serie' });
    }
}
