import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

// RPC create_opera (post-migration 003): solo campi opera-level. I campi
// edizione (isbn, editore, anno, pagine, copertina, google_volume_id) si
// inseriscono via createEdizione.
export async function createOpera(req, res) {
    const {
        titolo,
        tipo_opera,
        lingua_originale,
        stato_opera,
        id_serie,
        descrizione_opera,
        autori,
        generi,
    } = req.body;

    try {
        const { data: operaId, error } = await supabase.rpc("create_opera", {
            p_titolo: titolo,
            p_tipo_opera: tipo_opera,
            p_lingua_originale: lingua_originale || null,
            p_stato_opera: stato_opera || "finito",
            p_id_serie: id_serie || null,
            p_descrizione_opera: descrizione_opera || null,
            p_autori: autori || [],
            p_generi: generi || [],
        });

        if (error) throw new Error(error.message);

        res.status(201).json({
            message: "Opera creata con successo",
            id_opera: operaId,
        });
    } catch (error) {
        await errorLogger(
            `[createOpera] - Errore durante la creazione dell'opera: ${error.message}`
        ).catch(console.error);
        res.status(500).json({
            error: "Errore durante la creazione dell'opera",
        });
    }
}
