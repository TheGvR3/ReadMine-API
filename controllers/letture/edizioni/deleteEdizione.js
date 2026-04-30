import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function deleteEdizione(req, res) {
    const { id_edizione } = req.params;

    try {
        const { error, count } = await supabase
            .from("edizioni")
            .delete()
            .eq("id_edizione", id_edizione)
            .select("*", { count: "exact" });

        if (error) throw new Error(error.message);
        if (count === 0) {
            return res.status(404).json({ message: "Edizione non trovata" });
        }

        res.status(200).json({ message: "Edizione eliminata con successo" });
    } catch (error) {
        await errorLogger(
            `[deleteEdizione] - Errore eliminazione edizione ${id_edizione}: ${error.message}`
        ).catch(console.error);
        res.status(500).json({ error: "Errore durante l'eliminazione dell'edizione" });
    }
}
