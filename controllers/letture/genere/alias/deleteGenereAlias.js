import { supabase } from "../../../../db.js";
import { errorLogger } from "../../../../middlewares/errorLogger.js";

// DELETE /genere/alias/:alias
// Nota: alias può contenere spazi/slash → va URL-encoded dal client.
export async function deleteGenereAlias(req, res) {
    const { alias } = req.params;

    try {
        const { error, count } = await supabase
            .from("generi_alias")
            .delete()
            .eq("alias", alias)
            .select("*", { count: "exact" });

        if (error) throw new Error(error.message);
        if (count === 0) return res.status(404).json({ message: "Alias non trovato" });

        res.json({ message: "Alias eliminato" });
    } catch (error) {
        await errorLogger(`[deleteGenereAlias] - ${alias}: ${error.message}`).catch(console.error);
        res.status(500).json({ error: "Errore durante l'eliminazione dell'alias" });
    }
}
