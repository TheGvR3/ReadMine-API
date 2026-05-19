import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

const ALLOWED_FIELDS = [
    "titolo_edizione",
    "isbn_issn",
    "editore",
    "anno_pubblicazione",
    "numero_pagine",
    "copertina_url",
    "google_volume_id",
    "lingua",
    "traduttore",
    "numero_volume",
];

export async function updateEdizione(req, res) {
    const { id_edizione } = req.params;

    // Costruisce il payload SOLO con i campi presenti in req.body
    // (così un PUT parziale non azzera quelli non passati).
    const updates = {};
    for (const k of ALLOWED_FIELDS) {
        if (req.body[k] !== undefined) updates[k] = req.body[k] === "" ? null : req.body[k];
    }

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "Nessun campo da aggiornare" });
    }

    try {
        const { data, error } = await supabase
            .from("edizioni")
            .update(updates)
            .eq("id_edizione", id_edizione)
            .select("id_edizione")
            .maybeSingle();

        if (error) throw new Error(error.message);
        if (!data) return res.status(404).json({ message: "Edizione non trovata" });

        res.status(200).json({ message: "Edizione aggiornata con successo" });
    } catch (error) {
        await errorLogger(
            `[updateEdizione] - Errore aggiornamento edizione ${id_edizione}: ${error.message}`
        ).catch(console.error);
        res.status(500).json({ error: "Errore durante l'aggiornamento dell'edizione" });
    }
}
