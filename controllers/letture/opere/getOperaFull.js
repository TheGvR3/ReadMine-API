import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

// GET /opere/:id_opera/full
// Restituisce opera (con autori, generi, tipo, serie già aggregati dalla view)
// + lista completa delle edizioni ordinate per anno desc.
export async function getOperaFull(req, res) {
    const { id_opera } = req.params;

    try {
        const [opera, edizioni] = await Promise.all([
            supabase
                .from("get_all_opere_view")
                .select("*")
                .eq("id_opera", id_opera)
                .maybeSingle(),
            supabase
                .from("edizioni")
                .select("*")
                .eq("id_opera", id_opera)
                .order("anno_pubblicazione", { ascending: false, nullsFirst: false })
                .order("id_edizione", { ascending: false }),
        ]);

        if (opera.error)    throw new Error(opera.error.message);
        if (edizioni.error) throw new Error(edizioni.error.message);
        if (!opera.data)    return res.status(404).json({ message: "Opera non trovata" });

        res.json({ ...opera.data, edizioni: edizioni.data || [] });
    } catch (error) {
        await errorLogger(`[getOperaFull] - Opera ${id_opera}: ${error.message}`).catch(console.error);
        res.status(500).json({ error: "Errore durante il recupero dell'opera" });
    }
}
