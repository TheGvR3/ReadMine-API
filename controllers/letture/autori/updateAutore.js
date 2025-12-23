import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function updateAutore(req, res) {
    const { id_autore } = req.params;
    const { nome_autore } = req.body;

    try {
        const { data: autore, error } = await supabase
            .from('autori')
            .update({ nome_autore })
            .eq('id_autore', id_autore)
            .select('*');

        if (error) {
            // 23505: Violazione del vincolo UNIQUE
            if (error.code === '23505') {
                return res.status(400).json({ error: 'Autore già esistente' });
            }
            throw new Error(error.message);
        }
        if (autore.length === 0) {
            return res.status(404).json({ message: 'Autore non trovato' });
        }

        res.json({ message: 'Autore aggiornato con successo' });
    } catch (error) {
        await errorLogger(`[updateAutore] - Errore durante l'aggiornamento dell'autore: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante l\'aggiornamento dell\'autore' });
    }
}