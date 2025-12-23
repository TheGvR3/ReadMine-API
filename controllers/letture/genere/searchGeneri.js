import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function searchGeneri(req, res) {
    const { nome_genere } = req.params;
    try {
        const { data: rows, error } = await supabase
            .from('generi')
            .select('*')
            .ilike('nome_genere', `%${nome_genere}%`)
            .order('nome_genere', { ascending: true });

        if (error) {
            throw error;
        }
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Nessun genere trovato' });
        }

        res.json(rows);
    } catch (error) {
        await errorLogger(`[searchGeneri] - Errore durante la ricerca del genere con nome ${req.params.nome_genere}: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante la ricerca del genere' });
    }
}