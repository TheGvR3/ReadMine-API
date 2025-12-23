import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function searchAutori(req, res) {
    try {
        const { nome_autore } = req.params;

        const { data: rows, error } = await supabase
            .from('autori')
            .select('*')
            .ilike('nome_autore', `%${nome_autore}%`)
            .order('nome_autore', { ascending: true });

        if (error) {
            throw error;
        }

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Nessun autore trovato' });
        }
        res.json(rows);
    } catch (error) {
        await errorLogger(`[searchAutori] - Errore durante la ricerca dell'autore con nome ${req.params.nome_autore}: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante la ricerca dell\'autore' });
    }
}