/*
CREATE OR REPLACE FUNCTION update_lettura_v2(
    p_id_lettura BIGINT,
    p_data_lettura DATE DEFAULT NULL,
    p_volume INT DEFAULT NULL,
    p_capitolo INT DEFAULT NULL,
    p_pagina INT DEFAULT NULL,
    p_stato stato_lettura DEFAULT NULL,
    p_valutazione INT DEFAULT NULL,
    p_note TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Verifica se la lettura esiste
    IF NOT EXISTS (SELECT 1 FROM public.letture WHERE id_lettura = p_id_lettura) THEN
        RAISE EXCEPTION 'Lettura non trovata' USING ERRCODE = 'P0002';
    END IF;

    -- Aggiornamento dinamico: usa COALESCE per mantenere i vecchi valori se i parametri sono NULL
    UPDATE public.letture
    SET 
        data_lettura = COALESCE(p_data_lettura, data_lettura),
        volume = COALESCE(p_volume, volume),
        capitolo = COALESCE(p_capitolo, capitolo),
        pagina = COALESCE(p_pagina, pagina),
        stato = COALESCE(p_stato, stato),
        valutazione = COALESCE(p_valutazione, valutazione),
        note = COALESCE(p_note, note)
    WHERE id_lettura = p_id_lettura;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/

import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function updateLettura(req, res) {
    const { id_lettura } = req.params;
    const { 
        data_lettura, 
        volume, 
        capitolo, 
        pagina, 
        stato, 
        valutazione, 
        note 
    } = req.body;

    try {
        const { data, error } = await supabase.rpc('update_lettura_v2', {
            p_id_lettura: parseInt(id_lettura, 10),
            p_data_lettura: data_lettura || null,
            p_volume: volume !== undefined ? volume : null, // Usa undefined check
            p_capitolo: capitolo !== undefined ? capitolo : null,
            p_pagina: pagina !== undefined ? pagina : null,
            p_stato: stato || null,
            p_valutazione: valutazione !== undefined ? valutazione : null,
            p_note: note !== undefined ? note : null
        });

        if (error) {
            if (error.code === 'P0002') return res.status(404).json({ error: "Lettura non trovata" });
            throw new Error(error.message);
        }

        res.json({ message: 'Lettura aggiornata con successo' });
    } catch (error) {
        await errorLogger(`[updateLettura] - Errore ID ${id_lettura}: ${error.message}`).catch(console.error);
        res.status(500).json({ error: 'Errore interno durante l\'aggiornamento' });
    }
}