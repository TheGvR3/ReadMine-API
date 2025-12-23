import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function createSerie(req, res) {
    const { nome_serie } = req.body;
    try {

        const { data: newSerie, error } = await supabase
            .from('serie')
            .insert([{ nome_serie }])
            .select('id_serie') // Chiedi l'ID appena creato
            .single();

        if (error) {
            // Se nome_serie è già presente, il DB lancerà 23505 (violazione UNIQUE)
            if (error.code === '23505') {
                await errorLogger(`[createSerie] - Tentativo di creare una serie già esistente: ${nome_serie}`).catch(console.error);
                return res.status(400).json({ error: 'Serie già esistente' });
            }
            throw new Error(error.message);
        }

        res.status(201).json({
            message: 'Serie creata con successo',
            id: newSerie.id_serie
        });
    } catch (error) {
        await errorLogger(`[createSerie] - Errore durante la creazione della serie: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante la creazione della serie' });
    }
}
