import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

// Tutte le letture di un utente con dati opera + edizione (se collegata).
// Ordinate per data_inizio desc (le più recenti prima).
// Le letture senza data_inizio (es. da_iniziare) finiscono in coda.
export async function getAllLettureByIdUser(req, res) {
    const { id_utente } = req.params;

    try {
        const { data, error } = await supabase
            .from("letture")
            .select(`
                *,
                opere (
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
            .order("data_inizio", { ascending: false, nullsFirst: false })
            .order("id_lettura", { ascending: false });

        if (error) throw new Error(error.message);
        res.json(data);
    } catch (error) {
        await errorLogger(
            `[getAllLettureByIdUser] - Errore utente ${id_utente}: ${error.message}`
        ).catch(console.error);
        res.status(500).json({ error: "Errore interno durante il recupero delle letture" });
    }
}
