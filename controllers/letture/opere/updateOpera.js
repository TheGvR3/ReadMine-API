import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

// RPC update_opera (post-migration 003): solo campi opera-level.
// COALESCE: NULL → "non toccare". autori/generi: null = no-op, [] = svuota.
export async function updateOpera(req, res) {
    const { id_opera } = req.params;
    const {
        titolo,
        lingua_originale,
        tipo_opera,
        stato_opera,
        id_serie,
        numero_volume,
        descrizione_opera,
        autori,
        generi,
    } = req.body;

    try {
        const { data: updatedId, error } = await supabase.rpc("update_opera", {
            p_id_opera: id_opera,
            p_titolo: titolo,
            p_lingua_originale: lingua_originale,
            p_tipo_opera: tipo_opera,
            p_stato_opera: stato_opera,
            p_id_serie: id_serie,
            p_numero_volume: numero_volume,
            p_descrizione_opera: descrizione_opera,
            p_autori: autori,
            p_generi: generi,
        });

        if (error) throw new Error(error.message);
        if (updatedId === 0) {
            return res.status(404).json({ message: "Opera non trovata" });
        }

        res.status(200).json({ message: "Opera aggiornata con successo" });
    } catch (error) {
        await errorLogger(
            `[updateOpera] - Errore durante l'aggiornamento dell'opera con ID ${id_opera}: ${error.message}`
        ).catch(console.error);
        res.status(500).json({
            error: "Errore durante l'aggiornamento dell'opera",
        });
    }
}
