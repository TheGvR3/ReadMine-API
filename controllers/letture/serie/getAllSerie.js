import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function getAllSerie(req, res) {
    try {
        const { data: rows, error } = await supabase
            .from('serie')
            .select('*')
            .order('nome_serie', { ascending: true });

        if (error) {
            throw new Error(error.message);
        }

        res.json(rows);
    } catch (error) {
        await errorLogger(`[getAllSerie] - Errore durante il recupero delle serie: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante il recupero delle serie' });
    }
}
