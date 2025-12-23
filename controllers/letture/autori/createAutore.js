import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function createAutore(req, res) {
    const { nome_autore } = req.body;
    try {
        const { data: autore, error } = await supabase
            .from('autori')
            .insert([{ nome_autore }])
            .select('id_autore')
            .single();

        if (error) {
            // 23505: Violazione del vincolo UNIQUE (Autore già esistente)
            if (error.code === '23505') {
                return res.status(400).json({ error: 'Autore già esistente' });
            }
            throw new Error(error.message);
        }

        res.status(201).json({
            message: 'Autore creato con successo',
            id: autore.id_autore
        });
    } catch (error) {
        await errorLogger(`[createAutore] - Errore durante la creazione dell'autore: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante la creazione dell\'autore' });
    }
}