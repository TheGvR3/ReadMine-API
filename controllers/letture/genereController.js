import { supabase } from "../../db.js";
import { errorLogger } from "../../middlewares/errorLogger.js";

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

export async function getAllGeneri(req, res) {
    try {
        const { data: rows, error } = await supabase
            .from('generi')
            .select('*')
            .order('nome_genere', { ascending: true });

        if (error) {
            throw new Error(error.message);
        }
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Nessun genere trovato' });
        }

        res.json(rows);
    } catch (error) {
        await errorLogger(`[getAllGeneri] - Errore durante il recupero dei generi: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante il recupero dei generi' });
    }
}

export async function getGenereById(req, res) {
    const { id_genere } = req.params;
    try {
        const { data: genere, error } = await supabase
            .from('generi')
            .select('*')
            .eq('id_genere', id_genere)
            .single();

        if (error && error.code === 'PGRST204') {
            return res.status(404).json({ message: 'Genere non trovato' });
        }
        if (error) {
            throw new Error(error.message);
        }

        res.json(genere);
    } catch (error) {
        await errorLogger(`[getGenereById] - Errore durante il recupero del genere con ID ${req.params.id_genere}: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante il recupero del genere' });
    }
}

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

export async function deleteGenere(req, res) {
    const { id_genere } = req.params;
    try {
        const { data: deletedGenere, error } = await supabase
            .from('generi')
            .delete()
            .eq('id_genere', id_genere)
            .select('*');
        if (error) {
            throw new Error(error.message);
        }
        if (deletedGenere.length === 0) {
            return res.status(404).json({ message: 'Genere non trovato' });
        }
        res.json({ message: 'Genere eliminato con successo' });
    } catch (error) {
        await errorLogger(`[deleteGenere] - Errore durante l'eliminazione del genere con ID ${req.params.id_genere}: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante l\'eliminazione del genere' });
    }
}

export async function getGeneriByOpera(req, res) {
    const { id_opera } = req.params;
    try {
        const { data: generi, error } = await supabase
            .from('opera_generi')
            .select('generi(*)')
            .eq('id_opera', id_opera);

        if (error) {
            throw new Error(error.message);
        }

        const genereList = generi.map(item => item.generi);
        if (genereList.length === 0) {
            return res.status(404).json({ message: 'Nessun genere trovato per questa opera' });
        }
        res.json(genereList);
    } catch (error) {
        await errorLogger(`[getGenereByOpera] - Errore durante il recupero dei generi per l'opera con ID ${req.params.id_opera}: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante il recupero dei generi per l\'opera' });
    }
}