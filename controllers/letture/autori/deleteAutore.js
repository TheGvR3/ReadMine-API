import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function deleteAutore(req, res) {
    const { id_autore } = req.params;

    try {
        // Elimina l'autore. ON DELETE CASCADE gestisce autori_opere.
        const { error, count } = await supabase
            .from('autori')
            .delete()
            .eq('id_autore', id_autore)
            .select('*', { count: 'exact' }); // Conta le righe eliminate

        if (error) {
            throw new Error(error.message);
        }
        if (count === 0) {
            return res.status(404).json({ message: "Autore non trovato" });
        }

        res.json({ message: "Autore eliminato con successo" });
    } catch (error) {
        await errorLogger(
            `[deleteAutore] - Errore durante l'eliminazione dell'autore: ${error.message}`
        ).catch(console.error);
        res.status(500).json({ error: "Errore durante l'eliminazione dell'autore" });
    }
}
