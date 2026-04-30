import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function createEdizione(req, res) {
    const {
        id_opera,
        titolo_edizione,
        isbn_issn,
        editore,
        anno_pubblicazione,
        numero_pagine,
        copertina_url,
        google_volume_id,
        lingua,
        traduttore,
    } = req.body;

    try {
        const { data: edId, error } = await supabase.rpc("create_edizione", {
            p_id_opera: id_opera,
            p_titolo_edizione: titolo_edizione || null,
            p_isbn_issn: isbn_issn || null,
            p_editore: editore || null,
            p_anno_pubblicazione: anno_pubblicazione || null,
            p_numero_pagine: numero_pagine || null,
            p_copertina_url: copertina_url || null,
            p_google_volume_id: google_volume_id || null,
            p_lingua: lingua || null,
            p_traduttore: traduttore || null,
        });

        if (error) {
            // P0002 = opera non trovata (lanciata dalla RPC)
            if (error.code === "P0002") {
                return res.status(404).json({ error: "Opera non trovata" });
            }
            throw new Error(error.message);
        }

        res.status(201).json({
            message: "Edizione creata con successo",
            id_edizione: edId,
        });
    } catch (error) {
        await errorLogger(
            `[createEdizione] - Errore creazione edizione (opera ${id_opera}): ${error.message}`
        ).catch(console.error);
        res.status(500).json({ error: "Errore durante la creazione dell'edizione" });
    }
}
