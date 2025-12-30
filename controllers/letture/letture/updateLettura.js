/*
CREATE OR REPLACE FUNCTION update_lettura_v3(
    p_id_lettura BIGINT,
    p_data_lettura DATE,
    p_volume INT,
    p_capitolo INT,
    p_pagina INT,
    p_stato stato_lettura,
    p_valutazione INT,
    p_note TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Verifica se la lettura esiste
    IF NOT EXISTS (SELECT 1 FROM public.letture WHERE id_lettura = p_id_lettura) THEN
        RAISE EXCEPTION 'Lettura non trovata' USING ERRCODE = 'P0002';
    END IF;

    -- Aggiornamento diretto: se il parametro è NULL, il campo diventerà NULL
    UPDATE public.letture
    SET 
        data_lettura = p_data_lettura,
        volume = p_volume,
        capitolo = p_capitolo,
        pagina = p_pagina,
        stato = p_stato,
        valutazione = p_valutazione,
        note = p_note
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
        // Chiamiamo la v3 (assicurati di averla creata nel DB)
        const { data, error } = await supabase.rpc('update_lettura_v3', {
            p_id_lettura: parseInt(id_lettura, 10),
            p_data_lettura: data_lettura || null,
            p_volume: volume === "" ? null : volume, 
            p_capitolo: capitolo === "" ? null : capitolo,
            p_pagina: pagina === "" ? null : pagina,
            p_stato: stato || null,
            p_valutazione: valutazione === "" ? null : valutazione,
            p_note: note === "" ? null : note
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