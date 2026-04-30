import { supabase } from "../../../../db.js";
import { errorLogger } from "../../../../middlewares/errorLogger.js";
import { getPagination, paginatedResponse } from "../../../../utils/pagination.js";

// GET /genere/alias
export async function getAllAlias(req, res) {
    const { page, limit, from, to } = getPagination(req);

    try {
        const { data, error, count } = await supabase
            .from("generi_alias")
            .select(`
                alias,
                id_genere,
                generi ( nome_genere, fonte )
            `, { count: "exact" })
            .order("alias", { ascending: true })
            .range(from, to);

        if (error) throw new Error(error.message);
        res.json(paginatedResponse(data, count, page, limit));
    } catch (error) {
        await errorLogger(`[getAllAlias] - ${error.message}`).catch(console.error);
        res.status(500).json({ error: "Errore durante il recupero degli alias" });
    }
}
