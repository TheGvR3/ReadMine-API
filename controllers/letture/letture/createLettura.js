import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

// RPC create_lettura_v2 (post-migration 005):
//   parametri: id_user, id_opera, id_edizione?, data_inizio?, data_fine?,
//              volume?, capitolo?, pagina?, stato?, valutazione?, note?
// Errori RPC:
//   P0001 → edizione non appartiene all'opera (409)
//   P0002 → opera non trovata (404)
export async function createLettura(req, res) {
    const {
        id_utente,
        id_opera,
        id_edizione,
        data_inizio,
        data_fine,
        volume,
        capitolo,
        pagina,
        stato,
        valutazione,
        note,
    } = req.body;

    try {
        const { data: letturaId, error } = await supabase.rpc("create_lettura_v2", {
            p_id_user:     id_utente,
            p_id_opera:    id_opera,
            p_id_edizione: id_edizione || null,
            p_data_inizio: data_inizio || null,
            p_data_fine:   data_fine   || null,
            p_volume:      volume      ?? null,
            p_capitolo:    capitolo    ?? null,
            p_pagina:      pagina      ?? null,
            p_stato:       stato       || "da_iniziare",
            p_valutazione: valutazione ?? null,
            p_note:        note        || null,
        });

        if (error) {
            if (error.code === "P0002") return res.status(404).json({ error: error.message });
            if (error.code === "P0001") return res.status(409).json({ error: error.message });
            throw new Error(error.message);
        }

        res.status(201).json({
            message: "Lettura creata con successo",
            id_lettura: letturaId,
        });
    } catch (error) {
        await errorLogger(
            `[createLettura] - Errore creazione lettura: ${error.message}`
        ).catch(console.error);
        res.status(500).json({ error: "Errore interno durante la creazione della lettura" });
    }
}
