import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function getAllAutori(req, res) {
    try {
        const { data: rows, error } = await supabase
            .from('autori')
            .select('*')
            .order('nome_autore', { ascending: true });

        if (error) {
            throw error;
        }
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Nessun autore trovato' });
        }

        res.json(rows);
    } catch (error) {
        await errorLogger(`[getAllAutori] - Errore durante il recupero degli autori: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante il recupero degli autori' });
    }
}