import { supabase } from "../../db.js";
import { errorLogger } from "../../middlewares/errorLogger.js";

/* VISTA :  
CREATE OR REPLACE VIEW get_all_opere_view AS
SELECT 
    o.id_opera,
    o.titolo,
    o.id_serie,
    o.isbn_issn,
    o.anno_pubblicazione,
    o.editore,
    o.lingua_originale,
    c.nome_tipo AS tipo,
    o.stato_opera,
    a.id_autore,
    s.nome_serie AS serie,
    STRING_AGG(DISTINCT a.nome_autore, ', ') AS autori,
    
    -- NUOVE AGGIUNTE PER I GENERI
    STRING_AGG(DISTINCT g.nome_genere, ', ') AS generi
    
FROM opere o
LEFT JOIN tipo c ON o.tipo_opera = c.id_tipo
LEFT JOIN serie s ON o.id_serie = s.id_serie

-- JOIN per gli Autori (esistente)
LEFT JOIN autori_opere ao ON o.id_opera = ao.id_opera
LEFT JOIN autori a ON ao.id_autore = a.id_autore

-- JOIN per i Generi (NUOVE RIGHE)
LEFT JOIN generi_opere go ON o.id_opera = go.id_opera
LEFT JOIN generi g ON go.id_genere = g.id_genere

GROUP BY 
    o.id_opera, 
    o.id_serie,
    o.titolo, 
    c.nome_tipo, 
    o.stato_opera, 
    s.nome_serie,
    a.id_autore
*/

export async function searchOpere(req, res) {
    try {
        const { titolo } = req.params;

        const { data: opere, error } = await supabase
            .from('get_all_opere_view')
            .select('*')
            .ilike('titolo', `%${titolo}%`);

        if (error) {
            throw new Error(error.message);
        }

        if (opere.length === 0) {
            return res.status(404).json({ message: 'Nessuna opera trovata' });
        }

        res.json(opere);
    } catch (error) {
        await errorLogger(`[searchOpere] - Errore durante la ricerca della opera con nome ${req.params.titolo}: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante la ricerca della opera' });
    }
}

export async function getAllOpere(req, res) {
    try {

        const { data: opere, error } = await supabase
            .from('get_all_opere_view')
            .select('*')
            .order('titolo', { ascending: true });

        if (error) {
            throw new Error(error.message);
        }

        if (opere.length === 0) {
            return res.status(404).json({ message: 'Nessuna opera trovata' });
        }

        res.json(opere);
    } catch (error) {
        await errorLogger(`[getAllOpere] - Errore durante il recupero delle opere: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante il recupero delle opere' });
    }
}

export async function getAllOpereOrderAuthor(req, res) {
    try {

        const { data: rows, error } = await supabase
            .from('get_all_opere_view')
            .select('*')
            .order('autori', { ascending: true });

        res.json(rows);
    } catch (error) {
        await errorLogger(`[getAllOpere] - Errore durante il recupero delle opere: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante il recupero delle opere' });
    }
}

export async function getOperaById(req, res) {
    try {
        const { id_opera } = req.params;

        const { data: opera, error } = await supabase
            .from('get_all_opere_view')
            .select('*')
            .eq('id_opera', id_opera)
            .single();

        if (error && error.code === 'PGRST204') { // Codice per 'No rows found'
            return res.status(404).json({ message: 'Opera non trovata' });
        }
        if (error) {
            throw new Error(error.message);
        }

        res.json(opera);
    } catch (error) {
        await errorLogger(`[getOperaById] - Errore durante il recupero dell'opera con ID ${req.params.id_opera}: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante il recupero dell\'opera' });
    }
}

export async function getOperaByTitle(req, res) {
    try {
        const { titolo } = req.params;

        const { data: opera, error } = await supabase
            .from('get_all_opere_view')
            .select('*')
            .eq('titolo', titolo)
            .single();

        if (error && error.code === 'PGRST204') {
            return res.status(404).json({ message: 'Opera non trovata' });
        }
        if (error) {
            throw new Error(error.message);
        }

        res.json(opera);
    } catch (error) {
        await errorLogger(`[getOperaByTitle] - Errore durante il recupero dell'opera con titolo ${req.params.titolo}: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante il recupero dell\'opera' });
    }
}

export async function getOpereByAutore(req, res) {
    const { id_autore } = req.params;

    try {
        // 1. Interroga DIRETTAMENTE la vista
        const { data: opere, error } = await supabase
            .from('get_all_opere_view') 
            .select('*') 
            .eq('id_autore', id_autore); // Il filtro funziona perché hai aggiunto id_autore alla vista

        if (error) {
            throw new Error(error.message);
        }

        // 2. Controllo se ci sono dati
        if (!opere || opere.length === 0) {
            return res.status(404).json({ message: 'Nessuna opera trovata per questo autore' });
        }

        // 3. Restituisci direttamente 'opere' (che è già un array di oggetti puliti)
        res.json(opere);

    } catch (error) {
        await errorLogger(`[getOpereByAutore] - Errore: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante il recupero delle opere' });
    }
}

export async function getOpereBySerie(req, res) {
    try {
        const { id_serie } = req.params;

        const { data: opere, error } = await supabase
            .from('get_all_opere_view')
            .select('*')
            .eq('id_serie', id_serie);

        if (opere.length === 0) {
            return res.status(404).json({ message: 'Nessuna opera trovata per questa serie' });
        }
        if (error) {
            throw new Error(error.message);
        }

        res.json(opere);
    } catch (error) {
        await errorLogger(`[getOpereBySerie] - Errore durante il recupero delle opere per la serie con ID ${req.params.id_serie}: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante il recupero delle opere per la serie' });
    }
}

export async function getOpereByTipo(req, res) {
    try {
        const { id_tipo } = req.params;

        const { data: opere, error } = await supabase
            .from('get_all_opere_view')
            .select('*')
            .eq('tipo_opera', id_tipo);

        if (opere.length === 0) {
            return res.status(404).json({ message: 'Nessuna opera trovata per questa tipo' });
        }
        if (error) {
            throw new Error(error.message);
        }

        res.json(opere);
    } catch (error) {
        await errorLogger(`[getOpereByTipo] - Errore durante il recupero delle opere per la tipo con ID ${req.params.id_tipo}: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante il recupero delle opere per la tipo' });
    }
}

/* Funzione per creare un'opera utilizzando una funzione di database (RPC)
CREATE OR REPLACE FUNCTION create_opera(
    p_titolo TEXT,
    p_tipo_opera BIGINT,
    p_anno_pubblicazione INT DEFAULT NULL,
    p_editore TEXT DEFAULT NULL,
    p_lingua_originale TEXT DEFAULT NULL,
    p_stato_opera TEXT DEFAULT 'finito',
    p_id_serie BIGINT DEFAULT NULL,
    p_autori BIGINT[] DEFAULT ARRAY[]::BIGINT[],
    p_generi BIGINT[] DEFAULT ARRAY[]::BIGINT[]
)
RETURNS BIGINT AS $$
DECLARE
    opera_id BIGINT;
BEGIN
    -- 1. Inserisci l'opera e ottieni l'ID generato
    INSERT INTO public.opere (
        titolo, 
        tipo_opera, 
        anno_pubblicazione, 
        editore, 
        lingua_originale,
        stato_opera, 
        id_serie
    )
    VALUES (
        p_titolo, 
        p_tipo_opera,
        p_anno_pubblicazione, 
        p_editore, 
        p_lingua_originale,
        p_stato_opera, 
        p_id_serie
    )
    RETURNING id_opera INTO opera_id;

    -- 2. Inserisci gli autori, solo se l'array p_autori non è vuoto
    IF array_length(p_autori, 1) IS NOT NULL AND array_length(p_autori, 1) > 0 THEN
        INSERT INTO public.autori_opere (id_autore, id_opera)
        SELECT 
            id_autore, 
            opera_id
        FROM UNNEST(p_autori) AS id_autore;
    END IF;
    
    -- 3. Inserisci i generi
    IF array_length(p_generi, 1) IS NOT NULL AND array_length(p_generi, 1) > 0 THEN
        INSERT INTO public.generi_opere (id_genere, id_opera)
        SELECT 
            id_genere,
            opera_id
        FROM UNNEST(p_generi) AS id_genere;
    END IF;

    -- Ritorna l'ID dell'opera creata
    RETURN opera_id;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;
 */

export async function createOpera(req, res) {
    const {
        titolo,
        anno_pubblicazione,
        editore,
        lingua_originale,
        tipo_opera,
        stato_opera,
        id_serie,
        autori,
        generi
    } = req.body;

    const stato = stato_opera || 'finito';
    const anno = anno_pubblicazione || null;
    const edit = editore || null;
    const lingua = lingua_originale || null;
    const serie = id_serie || null;
    const lista_autori = autori || [];
    const lista_generi = generi || [];

    try {
        const { data: operaId, error } = await supabase.rpc('create_opera', {
            p_titolo: titolo,
            p_tipo_opera: tipo_opera,
            p_anno_pubblicazione: anno,
            p_editore: edit,
            p_lingua_originale: lingua,
            p_stato_opera: stato,
            p_id_serie: serie,
            p_autori: lista_autori,
            p_generi: lista_generi
        });

        if (error) {
            throw new Error(error.message);
        }

        res.status(201).json({
            message: "Opera creata con successo",
            id_opera: operaId,
        });

    } catch (error) {
        await errorLogger(
            `[createOpera] - Errore durante la creazione dell'opera: ${error.message}`
        ).catch(console.error);
        res.status(500).json({
            error: "Errore durante la creazione dell'opera",
        });
    }
}

/* Funzione per aggiornare un'opera e i suoi autori in modo sicuro
CREATE OR REPLACE FUNCTION update_opera(
    p_id_opera BIGINT,
    p_titolo TEXT,
    p_anno_pubblicazione INT DEFAULT NULL,
    p_editore TEXT DEFAULT NULL,
    p_lingua_originale TEXT DEFAULT NULL,
    p_tipo_opera BIGINT DEFAULT NULL,
    p_stato_opera TEXT DEFAULT NULL,
    p_id_serie BIGINT DEFAULT NULL,
    p_autori BIGINT[] DEFAULT NULL, 	-- Array di nuovi id_autore
    p_generi BIGINT[] DEFAULT NULL 	-- Array di nuovi id_genere
)
RETURNS BIGINT AS $$
DECLARE
    opera_exists BIGINT;
BEGIN
    -- Verifica se l'opera esiste
    SELECT id_opera INTO opera_exists FROM public.opere WHERE id_opera = p_id_opera;
    
    IF opera_exists IS NULL THEN
        -- Ritorna 0 o un valore che indichi 'non trovato'
        RETURN 0; 
    END IF;

    -- 1. Aggiorna la tabella opere (Utilizza COALESCE per aggiornare solo i campi forniti)
    UPDATE public.opere
    SET
        titolo = COALESCE(p_titolo, titolo),
        anno_pubblicazione = COALESCE(p_anno_pubblicazione, anno_pubblicazione),
        editore = COALESCE(p_editore, editore),
        lingua_originale = COALESCE(p_lingua_originale, lingua_originale),
        -- CAMPI PRECEDENTI:
        tipo_opera = COALESCE(p_tipo_opera, tipo_opera),
        stato_opera = COALESCE(p_stato_opera, stato_opera),
        id_serie = COALESCE(p_id_serie, id_serie)
    WHERE id_opera = p_id_opera;

    -- 2. Sincronizza la tabella autori_opere (solo se p_autori è stato fornito)
    IF p_autori IS NOT NULL THEN
        -- a) Elimina tutti i vecchi riferimenti all'opera
        DELETE FROM public.autori_opere WHERE id_opera = p_id_opera;

        -- b) Inserisci i nuovi riferimenti se l'array non è vuoto
        IF array_length(p_autori, 1) IS NOT NULL AND array_length(p_autori, 1) > 0 THEN
            INSERT INTO public.autori_opere (id_autore, id_opera)
            SELECT 
                id_autore, 
                p_id_opera
            FROM UNNEST(p_autori) AS id_autore;
        END IF;
    END IF;

    -- 3. Sincronizza la tabella generi_opere (solo se p_generi è stato fornito)
    IF p_generi IS NOT NULL THEN
        -- a) Elimina tutti i vecchi riferimenti ai generi dell'opera
        DELETE FROM public.generi_opere WHERE id_opera = p_id_opera;

        -- b) Inserisci i nuovi riferimenti se l'array non è vuoto
        IF array_length(p_generi, 1) IS NOT NULL AND array_length(p_generi, 1) > 0 THEN
            INSERT INTO public.generi_opere (id_genere, id_opera)
            SELECT 
                id_genere, 
                p_id_opera
            FROM UNNEST(p_generi) AS id_genere;
        END IF;
    END IF;
    
    -- Ritorna l'ID aggiornato
    RETURN p_id_opera;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;
*/

export async function updateOpera(req, res) {
    const { id_opera } = req.params;
    // req.body può contenere i campi opzionali e l'array autori
    const { titolo,
        anno_pubblicazione,
        editore,
        lingua_originale,
        tipo_opera,
        stato_opera,
        id_serie,
        autori,
        generi } = req.body;

    try {
        // Chiama la Remote Procedure Call (RPC)
        const { data: updatedId, error } = await supabase.rpc('update_opera', {
            p_id_opera: id_opera,
            p_anno_pubblicazione: anno_pubblicazione,
            p_editore: editore,
            p_lingua_originale: lingua_originale,
            p_titolo: titolo,
            p_tipo_opera: tipo_opera,
            p_stato_opera: stato_opera,
            p_id_serie: id_serie,
            p_autori: autori,
            p_generi: generi
        });

        if (error) {
            throw new Error(error.message);
        }
        if (updatedId === 0) {
            return res.status(404).json({ message: 'Opera non trovata' });
        }

        res.status(200).json({
            message: 'Opera aggiornata con successo'
        });
    } catch (error) {
        await errorLogger(
            `[updateOpera] - Errore durante l'aggiornamento dell'opera con ID ${id_opera}: ${error.message}`
        ).catch(console.error);

        res.status(500).json({
            error: "Errore durante l'aggiornamento dell'opera",
        });
    }
}


/* come eliminare un'opera e le sue associazioni in modo sicuro
ALTER TABLE autori_opere 
ADD CONSTRAINT fk_opera_id
    FOREIGN KEY (id_opera) 
    REFERENCES opere (id_opera) 
    ON DELETE CASCADE;
 */
export async function deleteOpera(req, res) {
    const { id_opera } = req.params;
    try {
        const { error, count } = await supabase
            .from('opere')
            .delete()
            .eq('id_opera', id_opera)
            .select('*', { count: 'exact' }); // Conta le righe eliminate

        if (error) {
            throw new Error(error.message);
        }
        if (count === 0) {
            return res.status(404).json({ message: 'Opera non trovata' });
        }

        res.status(200).json({
            message: 'Opera eliminata con successo'
        });
    } catch (error) {
        await errorLogger(`[deleteOpera] - Errore durante l'eliminazione dell'opera: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante l\'eliminazione dell\'opera' });
    }
}

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