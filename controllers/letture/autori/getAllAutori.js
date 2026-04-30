import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";
import { getPagination, paginatedResponse } from "../../../utils/pagination.js";

export async function getAllAutori(req, res) {
    const { page, limit, from, to } = getPagination(req);

    try {
        const { data, error, count } = await supabase
            .from("autori")
            .select("*", { count: "exact" })
            .order("nome_autore", { ascending: true })
            .range(from, to);

        if (error) throw error;

        res.json(paginatedResponse(data, count, page, limit));
    } catch (error) {
        await errorLogger(`[getAllAutori] - ${error.message}`).catch(console.error);
        res.status(500).json({ error: "Errore durante il recupero degli autori" });
    }
}
