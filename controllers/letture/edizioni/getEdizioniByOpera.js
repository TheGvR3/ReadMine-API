import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

// Ritorna tutte le edizioni di un'opera, ordinate per anno desc (le più recenti prima).
// Le NULL anno finiscono in coda.
export async function getEdizioniByOpera(req, res) {
    const { id_opera } = req.params;

    try {
        const { data, error } = await supabase
            .from("edizioni")
            .select("*")
            .eq("id_opera", id_opera)
            .order("anno_pubblicazione", { ascending: false, nullsFirst: false })
            .order("id_edizione", { ascending: false });

        if (error) throw new Error(error.message);

        res.status(200).json(data || []);
    } catch (error) {
        await errorLogger(
            `[getEdizioniByOpera] - Errore recupero edizioni opera ${id_opera}: ${error.message}`
        ).catch(console.error);
        res.status(500).json({ error: "Errore durante il recupero delle edizioni" });
    }
}
