import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function deleteGenere(req, res) {
    const { id_genere } = req.params;
    try {
        const { data: deletedGenere, error } = await supabase
            .from('generi')
            .delete()
            .eq('id_genere', id_genere)
            .select('*');
        if (error) {
            throw new Error(error.message);
        }
        if (deletedGenere.length === 0) {
            return res.status(404).json({ message: 'Genere non trovato' });
        }
        res.json({ message: 'Genere eliminato con successo' });
    } catch (error) {
        await errorLogger(`[deleteGenere] - Errore durante l'eliminazione del genere con ID ${req.params.id_genere}: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante l\'eliminazione del genere' });
    }
}
