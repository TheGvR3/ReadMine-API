import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function updateGenere(req, res) {
    const { id_genere } = req.params;
    const { nome_genere } = req.body;

    try {
        const { data: updatedGenere, error } = await supabase
            .from('generi')
            .update({ nome_genere })
            .eq('id_genere', id_genere)
            .select('*');

        if (error) {
            // 23505: Violazione del vincolo UNIQUE
            if (error.code === '23505') {
                return res.status(400).json({ error: 'Genere già esistente' });
            }
            throw new Error(error.message);
        }
        if (updatedGenere.length === 0) {
            return res.status(404).json({ message: 'Genere non trovato' });
        }

        res.json({ message: 'Genere aggiornato con successo' });
    } catch (error) {
        await errorLogger(`[updateGenere] - Errore durante l'aggiornamento del genere con ID ${req.params.id_genere}: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante l\'aggiornamento del genere' });
    }
}
