import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function createGenere(req, res) {
    const { nome_genere } = req.body;
    try {
        const { data: newGenere, error } = await supabase
            .from('generi')
            .insert({ nome_genere })
            .select('id_genere')
            .single();

        if (error) {
            if (error.code === '23505') {
                return res.status(400).json({ error: 'Autore già esistente' });
            }
            throw new Error(error.message);
        }
        res.status(201).json({
            message: 'Genere creato con successo',
            id: newGenere.id_genere
        });
    } catch (error) {
        await errorLogger(`[createGenere] - Errore durante la creazione del genere con nome ${req.body.nome_genere}: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante la creazione del genere' });
    }
}
