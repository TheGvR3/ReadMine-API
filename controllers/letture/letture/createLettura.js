/*

CREATE OR REPLACE FUNCTION create_lettura_v2(
    p_id_user INT,
    p_id_opera INT,
    p_data_lettura DATE DEFAULT NULL,
    p_volume INT DEFAULT NULL,
    p_capitolo INT DEFAULT NULL,
    p_pagina INT DEFAULT NULL,
    p_stato stato_lettura DEFAULT 'da_iniziare',
    p_valutazione INT DEFAULT NULL,
    p_note TEXT DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
    new_id BIGINT;
BEGIN
    -- 1. Verifica se l'opera esiste
    IF NOT EXISTS (SELECT 1 FROM public.opere WHERE id_opera = p_id_opera) THEN
        RAISE EXCEPTION 'Opera non trovata' USING ERRCODE = 'P0002'; -- No data found
    END IF;

    -- 2. Verifica se la lettura esiste già (evita duplicati utente-opera)
    IF EXISTS (SELECT 1 FROM public.letture WHERE id_user = p_id_user AND id_opera = p_id_opera) THEN
        RAISE EXCEPTION 'Lettura già esistente per questo utente e opera' USING ERRCODE = 'P0003';
    END IF;

    -- 3. Inserimento
    INSERT INTO public.letture (
        id_user, id_opera, data_lettura, volume, capitolo, pagina, stato, valutazione, note
    )
    VALUES (
        p_id_user, p_id_opera, p_data_lettura, p_volume, p_capitolo, p_pagina, p_stato, p_valutazione, p_note
    )
    RETURNING id_lettura INTO new_id;

    RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

*/

import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function createLettura(req, res) {
    const { 
        id_utente, // Assicurati che il frontend mandi id_utente
        id_opera, 
        data_lettura, 
        volume, 
        capitolo, 
        pagina, 
        stato,
        valutazione,
        note 
    } = req.body;

    try {
        // Chiamata RPC a Supabase
        const { data: letturaId, error } = await supabase.rpc('create_lettura_v2', {
            p_id_user: id_utente,
            p_id_opera: id_opera,
            p_data_lettura: data_lettura || null,
            p_volume: volume || null,
            p_capitolo: capitolo || null,
            p_pagina: pagina || null,
            p_stato: stato || 'da_iniziare',
            p_valutazione: valutazione || null,
            p_note: note || null
        });

        if (error) {
            // Gestione errori specifici sollevati da RAISE EXCEPTION
            if (error.code === 'P0002') return res.status(404).json({ error: error.message });
            if (error.code === 'P0003') return res.status(409).json({ error: error.message });
            
            throw new Error(error.message);
        }

        res.status(201).json({
            message: "Lettura creata con successo",
            id_lettura: letturaId,
        });

    } catch (error) {
        await errorLogger(
            `[createLettura] - Errore durante la creazione della lettura: ${error.message}`
        ).catch(console.error);
        
        res.status(500).json({
            error: "Errore interno durante la creazione della lettura",
        });
    }
}