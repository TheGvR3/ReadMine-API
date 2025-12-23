import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

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