import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function getGenereByName(req, res) {
    const { nome_genere } = req.params;
    try {
        const { data: genere, error } = await supabase
            .from('generi')
            .select('*')
            .eq('nome_genere', nome_genere)
            .single();

        if (error && error.code === 'PGRST204') {
            return res.status(404).json({ message: 'Genere non trovato' });
        }
        if (error) {
            throw new Error(error.message);
        }

        res.json(genere);
    } catch (error) {
        await errorLogger(`[getGenereByName] - Errore durante il recupero del genere con nome ${req.params.nome_genere}: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante il recupero del genere' });
    }
}