import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

//ENDPOINT NON USATI AL MOMENTO

export async function addAutoreToOpera(req, res) {
    const { id_autore, id_opera } = req.body;

    const payload = {
        id_autore: Number(id_autore),
        id_opera: Number(id_opera)
    };

    try {
        const { error } = await supabase
            .from('autori_opere')
            .insert(payload); // Tenta l'inserimento

        if (error) {

            // 23503: Violazione di FOREIGN KEY (Autore o Opera non esistono)
            if (error.code === '23503') {
                return res.status(404).json({ error: "Autore o Opera non trovati." });
            }
            // 23505: Violazione di UNIQUE (Associazione già esistente)
            if (error.code === '23505') {
                return res.status(400).json({ error: "Questo autore è già associato a quest'opera." });
            }
            // Errore generico
            throw new Error(error.message);
        }

        res.status(201).json({
            message: 'Autore aggiunto all\'opera con successo'
        });
    } catch (error) {
        await errorLogger(`[addAutoreToOpera] - Errore durante l'aggiunta dell'autore all'opera: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante l\'aggiunta dell\'autore all\'opera' });
    }
}

export async function removeAutoreFromOpera(req, res) {
    const { id_autore, id_opera } = req.body;

    try {
        // Esegui la cancellazione usando i filtri
        const { error, count } = await supabase
            .from('autori_opere')
            .delete()
            .eq('id_autore', id_autore)
            .eq('id_opera', id_opera)
            .select('*', { count: 'exact' }); // Conta le righe eliminate

        if (error) {
            throw new Error(error.message);
        }
        if (count === 0) {
            return res.status(404).json({
                message: 'Associazione autore-opera non trovata (o già rimossa).'
            });
        }

        res.status(200).json({
            message: 'Autore rimosso dall\'opera con successo'
        });
    } catch (error) {
        await errorLogger(`[removeAutoreFromOpera] - Errore durante la rimozione dell'autore dall'opera: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante la rimozione dell\'autore dall\'opera' });
    }
}

export async function addGenereToOpera(req, res) {
    const { id_genere, id_opera } = req.body;

    const payload = {
        id_genere: Number(id_genere),
        id_opera: Number(id_opera)
    };

    try {
        const { error } = await supabase
            .from('generi_opere')
            .insert(payload);

        if (error) {

            // 23503: Violazione di FOREIGN KEY (Genere o Opera non esistono)
            if (error.code === '23503') {
                return res.status(404).json({ error: "Genere o Opera non trovati." });
            }
            // 23505: Violazione di UNIQUE (Associazione già esistente)
            if (error.code === '23505') {
                return res.status(400).json({ error: "Questo genere è già associato a quest'opera." });
            }
            // Errore generico
            throw new Error(error.message);
        }

        res.status(201).json({
            message: 'Genere aggiunto all\'opera con successo'
        });
    } catch (error) {
        await errorLogger(`[addGenereToOpera] - Errore durante l'aggiunta del genere all'opera: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante l\'aggiunta del genere all\'opera' });
    }
}

export async function removeGenereFromOpera(req, res) {
    const { id_genere, id_opera } = req.body;

    try {
        const { error, count } = await supabase
            .from('generi_opere')
            .delete()
            .eq('id_genere', id_genere)
            .eq('id_opera', id_opera)
            .select('*', { count: 'exact' });

        if (error) {
            throw new Error(error.message);
        }

        if (count === 0) {
            return res.status(404).json({
                message: 'Associazione genere-opera non trovata (o già rimossa).'
            });
        }

        // Successo
        res.status(200).json({
            message: 'Genere rimosso dall\'opera con successo'
        });

    } catch (error) {
        await errorLogger(`[removeGenereFromOpera] - Errore durante la rimozione del genere dall'opera: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante la rimozione del genere dall\'opera' });
    }
}