import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function getAutoreById(req, res) {
    try {
        const { id_autore } = req.params;
        const { data: autore, error } = await supabase
            .from('autori')
            .select('*')
            .eq('id_autore', id_autore)
            .single();

        if (error && error.code === 'PGRST204') {
            return res.status(404).json({ message: 'Autore non trovato' });
        }
        if (error) {
            throw new Error(error.message);
        }

        res.json(autore);
    }
    catch (error) {
        await errorLogger(`[getAutoreById] - Errore durante il recupero dell'autore con ID ${req.params.id}: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante il recupero dell\'autore' });
    }
}
