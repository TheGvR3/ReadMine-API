import { supabase } from "../../db.js";
import { errorLogger } from "../../middlewares/errorLogger.js";

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

export async function getAllSerie(req, res) {
    try {
        const { data: rows, error } = await supabase
            .from('serie')
            .select('*')
            .order('nome_serie', { ascending: true });

        if (error) {
            throw new Error(error.message);
        }

        res.json(rows);
    } catch (error) {
        await errorLogger(`[getAllSerie] - Errore durante il recupero delle serie: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante il recupero delle serie' });
    }
}

export async function getSerieById(req, res) {
    try {
        const { id_serie } = req.params;
        const { data: serie, error } = await supabase
            .from('serie')
            .select('*')
            .eq('id_serie', id_serie)
            .single();

        if (error && error.code === 'PGRST204') {
            return res.status(404).json({ message: 'Serie non trovata' });
        }
        if (error) {
            throw new Error(error.message);
        }

        res.json(serie);
    } catch (error) {
        await errorLogger(`[getSerieById] - Errore durante il recupero della serie con ID ${req.params.id}: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante il recupero della serie' });
    }
}

export async function getSerieByName(req, res) {
    try {
        const { nome_serie } = req.params;
        const { data: serie, error } = await supabase
            .from('serie')
            .select('*')
            .eq('nome_serie', nome_serie)
            .single();

        if (error && error.code === 'PGRST204') {
            return res.status(404).json({ message: 'Serie non trovata' });
        }
        if (error) {
            throw new Error(error.message);
        }

        res.json(serie);
    } catch (error) {
        await errorLogger(`[getSerieByName] - Errore durante il recupero della serie con nome ${req.params.nome_serie}: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante il recupero della serie' });
    }
}

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

export async function updateSerie(req, res) {
    const { id_serie } = req.params;
    const { nome_serie } = req.body;
    try {

        const { data: updatedRows, error } = await supabase
            .from('serie')
            .update({ nome_serie })
            .eq('id_serie', id_serie)
            .select('*'); // Chiedi i dati aggiornati o []

        if (error) {
            // Se nome_serie è già presente (e UNIQUE), il DB lancerà 23505
            if (error.code === '23505') {
                await errorLogger(`[updateSerie] - Tentativo di aggiornare una serie con lo stesso nome: ${nome_serie}`).catch(console.error);
                return res.status(400).json({ error: 'Serie con lo stesso nome già esistente' });
            }
            throw new Error(error.message);
        }
        // Se la riga non esisteva
        if (updatedRows.length === 0) {
            return res.status(404).json({ message: 'Serie non trovata' });
        }

        res.json({ message: 'Serie aggiornata con successo' });
    } catch (error) {
        await errorLogger(`[updateSerie] - Errore durante l'aggiornamento della serie: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante l\'aggiornamento della serie' });
    }
}

export async function deleteSerie(req, res) {
    const { id_serie } = req.params;
    try {
        const { error, count } = await supabase
            .from('serie')
            .delete()
            .eq('id_serie', id_serie)
            .select('*', { count: 'exact' }); // Conta le righe eliminate

        if (error) {
            throw new Error(error.message);
        }
        if (count === 0) { 
            return res.status(404).json({ message: 'Serie non trovata' });
        }

        res.json({ message: 'Serie eliminata con successo' });
    } catch (error) {
        await errorLogger(`[deleteSerie] - Errore durante l'eliminazione della serie: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante l\'eliminazione della serie' });
    }
}

export async function getSerieByOpera(req, res) {
    const { id_opera } = req.params;
    try {

        // Questo è il modo di Supabase per JOIN:
        const { data: rows, error } = await supabase
            .from('opere')
            .select('serie(*)') // Recupera tutte le colonne della serie correlata
            .eq('id_opera', id_opera); // Filtra per l'ID dell'opera

        if (error) {
            throw new Error(error.message);
        }

        // Il risultato è un array di oggetti { serie: { id_serie:..., nome_serie:... } }.
        // Mappiamo per pulire il risultato.
        const serie = rows.map(row => row.serie);
        if (serie.length === 0) {
            return res.status(404).json({ message: 'Nessuna serie trovata per questa opera' });
        }

        res.json(serie);
    } catch (error) {
        await errorLogger(`[getSerieByOpera] - Errore durante il recupero delle serie per l'opera con ID ${req.params.id_opera}: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante il recupero delle serie per l\'opera' });
    }
}//CORREGGERE LA COLONNA ID SERIE PERCHE TRATTATA COME TEXT
