import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

// Dettaglio singola lettura con opera + edizione embedded.
export async function getLetturaById(req, res) {
    const { id_lettura } = req.params;

    try {
        const { data, error } = await supabase
            .from("letture")
            .select(`
                *,
                opere (
                    id_opera,
                    titolo,
                    tipo_opera,
                    stato_opera,
                    lingua_originale,
                    descrizione_opera
                ),
                edizioni (
                    id_edizione,
                    titolo_edizione,
                    isbn_issn,
                    editore,
                    anno_pubblicazione,
                    numero_pagine,
                    copertina_url,
                    lingua,
                    traduttore,
                    numero_volume
                )
            `)
            .eq("id_lettura", id_lettura)
            .maybeSingle();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: "Lettura non trovata" });

        return res.json(data);
    } catch (error) {
        await errorLogger(
            `[getLetturaById] - Errore lettura ${id_lettura}: ${error.message}`
        ).catch(console.error);
        return res.status(500).json({ error: "Errore interno nel recupero della lettura" });
    }
}
