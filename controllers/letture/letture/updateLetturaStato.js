import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

const VALID_STATI = ["da_iniziare", "in_corso", "finito", "abbandonato"];

// PATCH /letture/:id_lettura/stato
// Body: { stato }
//
// Auto-fill date intelligente:
//   stato='in_corso' e data_inizio NULL → data_inizio = oggi
//   stato='finito'   e data_fine   NULL → data_fine   = oggi
//                    e data_inizio NULL → data_inizio = oggi (lettura "lampo")
//
// Se il client vuole sovrascrivere le date, usa il PUT /letture/:id pieno.
export async function updateLetturaStato(req, res) {
    const { id_lettura } = req.params;
    const { stato } = req.body;

    if (!stato || !VALID_STATI.includes(stato)) {
        return res.status(400).json({ error: `stato deve essere uno tra: ${VALID_STATI.join(", ")}` });
    }

    try {
        // Leggi le date correnti per applicare l'auto-fill
        const { data: current, error: errFetch } = await supabase
            .from("letture")
            .select("data_inizio, data_fine, stato")
            .eq("id_lettura", id_lettura)
            .maybeSingle();
        if (errFetch) throw new Error(errFetch.message);
        if (!current) return res.status(404).json({ message: "Lettura non trovata" });

        const today = new Date().toISOString().slice(0, 10);
        const updates = { stato };

        if (stato === "in_corso" && !current.data_inizio) {
            updates.data_inizio = today;
        }
        if (stato === "finito") {
            if (!current.data_fine)   updates.data_fine   = today;
            if (!current.data_inizio) updates.data_inizio = today;
        }

        const { error: errUpd } = await supabase
            .from("letture")
            .update(updates)
            .eq("id_lettura", id_lettura);
        if (errUpd) throw new Error(errUpd.message);

        res.json({ message: "Stato aggiornato", lettura_id: parseInt(id_lettura, 10), updates });
    } catch (error) {
        await errorLogger(`[updateLetturaStato] - Lettura ${id_lettura}: ${error.message}`).catch(console.error);
        res.status(500).json({ error: "Errore durante l'aggiornamento dello stato" });
    }
}
