import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function getAllGeneri(req, res) {
    try {
        const { data: rows, error } = await supabase
            .from('generi')
            .select('*')
            .order('nome_genere', { ascending: true });

        if (error) {
            throw new Error(error.message);
        }
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Nessun genere trovato' });
        }

        res.json(rows);
    } catch (error) {
        await errorLogger(`[getAllGeneri] - Errore durante il recupero dei generi: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante il recupero dei generi' });
    }
}