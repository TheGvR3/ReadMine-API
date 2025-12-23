import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function searchSerie(req, res) {
    try {
        const { nome_serie } = req.params;

        const { data: serie, error } = await supabase
            .from('serie')
            .select('*')
            .ilike('nome_serie', `%${nome_serie}%`)
            .order('nome_serie', { ascending: true });

        if (error) {
            throw new Error(error.message);
        }

        if (serie.length === 0) {
            return res.status(404).json({ message: 'Nessuna serie trovata' });
        }
        res.json(serie);
    } catch (error) {
        await errorLogger(`[searchSerie] - Errore durante la ricerca della serie con nome ${req.params.nome_serie}: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante la ricerca della serie' });
    }
}