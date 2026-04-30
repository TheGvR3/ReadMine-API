import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

// RPC update_lettura_v3 (post-migration 005): full-replace, NULL → NULL.
// Per non perdere un valore, l'app deve passarlo nel body.
export async function updateLettura(req, res) {
    const { id_lettura } = req.params;
    const {
        data_inizio,
        data_fine,
        volume,
        capitolo,
        pagina,
        stato,
        valutazione,
        note,
        id_edizione,
    } = req.body;

    // Helper: stringa vuota → null (utile per i form HTML)
    const nz = (v) => (v === "" || v === undefined ? null : v);

    try {
        const { error } = await supabase.rpc("update_lettura_v3", {
            p_id_lettura:   parseInt(id_lettura, 10),
            p_data_inizio:  nz(data_inizio),
            p_data_fine:    nz(data_fine),
            p_volume:       nz(volume),
            p_capitolo:     nz(capitolo),
            p_pagina:       nz(pagina),
            p_stato:        nz(stato),
            p_valutazione:  nz(valutazione),
            p_note:         nz(note),
            p_id_edizione:  nz(id_edizione),
        });

        if (error) {
            if (error.code === "P0002") return res.status(404).json({ error: "Lettura non trovata" });
            throw new Error(error.message);
        }

        res.json({ message: "Lettura aggiornata con successo" });
    } catch (error) {
        await errorLogger(
            `[updateLettura] - Errore lettura ${id_lettura}: ${error.message}`
        ).catch(console.error);
        res.status(500).json({ error: "Errore interno durante l'aggiornamento" });
    }
}
