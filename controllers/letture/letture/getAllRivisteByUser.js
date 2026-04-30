import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

// Letture di tipo "Rivista" (id_tipo = 3) per utente.
export async function getAllRivisteByIdUser(req, res) {
    const { id_utente } = req.params;

    try {
        const { data, error } = await supabase
            .from("letture")
            .select(`
                *,
                opere!inner (
                    id_opera,
                    titolo,
                    tipo_opera,
                    lingua_originale,
                    numero_volume,
                    stato_opera
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
                    traduttore
                )
            `)
            .eq("id_user", id_utente)
            .eq("opere.tipo_opera", 3)
            .order("data_inizio", { ascending: false, nullsFirst: false })
            .order("id_lettura", { ascending: false });

        if (error) throw new Error(error.message);
        res.json(data);
    } catch (error) {
        await errorLogger(
            `[getAllRivisteByIdUser] - Errore utente ${id_utente}: ${error.message}`
        ).catch(console.error);
        res.status(500).json({ error: "Errore interno durante il recupero delle riviste" });
    }
}
