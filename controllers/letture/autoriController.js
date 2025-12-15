import { supabase } from "../../db.js";
import { errorLogger } from "../../middlewares/errorLogger.js";

export async function searchAutori(req, res) {
    try {
        const { nome_autore } = req.params;

        const { data: rows, error } = await supabase
            .from('autori')
            .select('*')
            .ilike('nome_autore', `%${nome_autore}%`)
            .order('nome_autore', { ascending: true });

        if (error) {
            throw error;
        }

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Nessun autore trovato' });
        }
        res.json(rows);
    } catch (error) {
        await errorLogger(`[searchAutori] - Errore durante la ricerca dell'autore con nome ${req.params.nome_autore}: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante la ricerca dell\'autore' });
    }
}

export async function getAllAutori(req, res) {
    try {
        const { data: rows, error } = await supabase
            .from('autori')
            .select('*')
            .order('nome_autore', { ascending: true });

        if (error) {
            throw error;
        }
        res.json(rows);
    } catch (error) {
        await errorLogger(`[getAllAutori] - Errore durante il recupero degli autori: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante il recupero degli autori' });
    }
}

export async function getAutoreById(req, res) {
    try {
        const { id_autore } = req.params;
        const { data: autore, error } = await supabase
            .from('autori')
            .select('*')
            .eq('id_autore', id_autore)
            .single();

        if (error && error.code === 'PGRST204') {
            return res.status(404).json({ message: 'Autore non trovato' });
        }
        if (error) {
            throw new Error(error.message);
        }

        res.json(autore);
    }
    catch (error) {
        await errorLogger(`[getAutoreById] - Errore durante il recupero dell'autore con ID ${req.params.id}: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante il recupero dell\'autore' });
    }
}

export async function getAutoreByName(req, res) {
    try {
        const { nome_autore } = req.params;
        const { data: autore, error } = await supabase
            .from('autori')
            .select('*')
            .eq('nome_autore', nome_autore)
            .single();

        if (error && error.code === 'PGRST204') {
            return res.status(404).json({ message: 'Autore non trovato' });
        }
        if (error) {
            throw new Error(error.message);
        }

        res.json(autore);
    }
    catch (error) {
        await errorLogger(`[getAutoreByName] - Errore durante il recupero dell'autore con nome ${req.params.nome_autore}: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante il recupero dell\'autore' });
    }
}

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

export async function updateAutore(req, res) {
    const { id_autore } = req.params;
    const { nome_autore } = req.body;

    try {
        const { data: autore, error } = await supabase
            .from('autori')
            .update({ nome_autore })
            .eq('id_autore', id_autore)
            .select('*'); // Ottieni i record aggiornati

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

export async function deleteAutore(req, res) {
    const { id_autore } = req.params;

    try {
        // Elimina l'autore. ON DELETE CASCADE gestisce autori_opere.
        const { error, count } = await supabase
            .from('autori')
            .delete()
            .eq('id_autore', id_autore)
            .select('*', { count: 'exact' }); // Conta le righe eliminate

        if (error) {
            throw new Error(error.message);
        }
        if (count === 0) {
            return res.status(404).json({ message: "Autore non trovato" });
        }

        res.json({ message: "Autore eliminato con successo" });
    } catch (error) {
        await errorLogger(
            `[deleteAutore] - Errore durante l'eliminazione dell'autore: ${error.message}`
        ).catch(console.error);
        res.status(500).json({ error: "Errore durante l'eliminazione dell'autore" });
    }
}


export async function getAutoriByOpera(req, res) {
    const { id_opera } = req.params;
    try {

        // Questo è il modo di Supabase per JOIN:
        const { data: rows, error } = await supabase
            .from('autori_opere')
            .select('autori(*)') // Recupera tutte le colonne dell'autore correlato
            .eq('id_opera', id_opera); // Filtra per l'ID dell'opera

        if (error) {
            throw new Error(error.message);
        }

        // Il risultato è un array di oggetti { autori: { id_autore:..., nome_autore:... } }.
        // Mappiamo per pulire il risultato.
        const autori = rows.map(row => row.autori);
        if (autori.length === 0) {
            return res.status(404).json({ message: 'Nessun autore trovato per questa opera' });
        }

        res.json(autori);
    } catch (error) {
        await errorLogger(`[getAutoriByOpera] - Errore durante il recupero degli autori per l'opera con ID ${req.params.id_opera}: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante il recupero degli autori per l\'opera' });
    }
}
