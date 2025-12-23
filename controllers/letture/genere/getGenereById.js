import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function getGenereById(req, res) {
    const { id_genere } = req.params;
    try {
        const { data: genere, error } = await supabase
            .from('generi')
            .select('*')
            .eq('id_genere', id_genere)
            .single();

        if (error && error.code === 'PGRST204') {
            return res.status(404).json({ message: 'Genere non trovato' });
        }
        if (error) {
            throw new Error(error.message);
        }

        res.json(genere);
    } catch (error) {
        await errorLogger(`[getGenereById] - Errore durante il recupero del genere con ID ${req.params.id_genere}: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante il recupero del genere' });
    }
}