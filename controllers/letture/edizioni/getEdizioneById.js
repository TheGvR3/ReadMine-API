import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function getEdizioneById(req, res) {
    const { id_edizione } = req.params;

    try {
        const { data, error } = await supabase
            .from("edizioni")
            .select("*")
            .eq("id_edizione", id_edizione)
            .maybeSingle();

        if (error) throw new Error(error.message);
        if (!data) return res.status(404).json({ message: "Edizione non trovata" });

        res.status(200).json(data);
    } catch (error) {
        await errorLogger(
            `[getEdizioneById] - Errore recupero edizione ${id_edizione}: ${error.message}`
        ).catch(console.error);
        res.status(500).json({ error: "Errore durante il recupero dell'edizione" });
    }
}
