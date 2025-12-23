import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

/* Funzione per aggiornare un'opera e i suoi autori in modo sicuro
CREATE OR REPLACE FUNCTION update_opera(
    p_id_opera BIGINT,
    p_titolo TEXT DEFAULT NULL,
    p_anno_pubblicazione INT DEFAULT NULL,
    p_editore TEXT DEFAULT NULL,
    p_lingua_originale TEXT DEFAULT NULL,
    p_tipo_opera BIGINT DEFAULT NULL,
    p_stato_opera TEXT DEFAULT NULL,
    p_id_serie BIGINT DEFAULT NULL,
    p_autori BIGINT[] DEFAULT NULL,
    p_generi BIGINT[] DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
    opera_exists_id BIGINT;
BEGIN
    -- Verifica esistenza
    SELECT id_opera INTO opera_exists_id FROM public.opere WHERE id_opera = p_id_opera;
    IF NOT FOUND THEN
        RETURN 0; 
    END IF;

    -- 1. Aggiornamento dati base
    UPDATE public.opere
    SET
        titolo = COALESCE(p_titolo, titolo),
        anno_pubblicazione = COALESCE(p_anno_pubblicazione, anno_pubblicazione),
        editore = COALESCE(p_editore, editore),
        lingua_originale = COALESCE(p_lingua_originale, lingua_originale),
        tipo_opera = COALESCE(p_tipo_opera, tipo_opera),
        stato_opera = COALESCE(p_stato_opera, stato_opera),
        id_serie = COALESCE(p_id_serie, id_serie)
    WHERE id_opera = p_id_opera;

    -- 2. Sincronizzazione Autori
    IF p_autori IS NOT NULL THEN
        DELETE FROM public.autori_opere WHERE id_opera = p_id_opera;
        IF array_length(p_autori, 1) > 0 THEN
            INSERT INTO public.autori_opere (id_autore, id_opera)
            SELECT unnest(p_autori), p_id_opera;
        END IF;
    END IF;

    -- 3. Sincronizzazione Generi
    IF p_generi IS NOT NULL THEN
        DELETE FROM public.generi_opere WHERE id_opera = p_id_opera;
        IF array_length(p_generi, 1) > 0 THEN
            INSERT INTO public.generi_opere (id_genere, id_opera)
            SELECT unnest(p_generi), p_id_opera;
        END IF;
    END IF;

    RETURN p_id_opera;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
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
