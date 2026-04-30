import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";
import { getPagination, paginatedResponse } from "../../../utils/pagination.js";

export async function getAllGeneri(req, res) {
    const { page, limit, from, to } = getPagination(req);
    // Filtro opzionale: ?fonte=curato | importato
    const fonte = req.query.fonte;

    try {
        let query = supabase
            .from("generi")
            .select("*", { count: "exact" })
            .order("nome_genere", { ascending: true })
            .range(from, to);

        if (fonte === "curato" || fonte === "importato") {
            query = query.eq("fonte", fonte);
        }

        const { data, error, count } = await query;
        if (error) throw new Error(error.message);

        res.json(paginatedResponse(data, count, page, limit));
    } catch (error) {
        await errorLogger(`[getAllGeneri] - ${error.message}`).catch(console.error);
        res.status(500).json({ error: "Errore durante il recupero dei generi" });
    }
}
