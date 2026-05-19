import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

// Letture di tipo "Libro" (id_tipo = 1) per utente.
// NB: l'ID 1 dipende dal seed della tabella tipo. Se cambia il seed,
// aggiornare qui o passare a una lookup per nome ("Libro").
export async function getAllLibriByIdUser(req, res) {
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
                    traduttore,
                    numero_volume
                )
            `)
            .eq("id_user", id_utente)
            .eq("opere.tipo_opera", 1)
            .order("data_inizio", { ascending: false, nullsFirst: false })
            .order("id_lettura", { ascending: false });

        if (error) throw new Error(error.message);
        res.json(data);
    } catch (error) {
        await errorLogger(
            `[getAllLibriByIdUser] - Errore utente ${id_utente}: ${error.message}`
        ).catch(console.error);
        res.status(500).json({ error: "Errore interno durante il recupero dei libri" });
    }
}
