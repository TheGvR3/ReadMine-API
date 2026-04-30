import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";
import { getPagination, paginatedResponse } from "../../../utils/pagination.js";

export async function getAllSerie(req, res) {
    const { page, limit, from, to } = getPagination(req);

    try {
        const { data, error, count } = await supabase
            .from("serie")
            .select("*", { count: "exact" })
            .order("nome_serie", { ascending: true })
            .range(from, to);

        if (error) throw new Error(error.message);

        res.json(paginatedResponse(data, count, page, limit));
    } catch (error) {
        await errorLogger(`[getAllSerie] - ${error.message}`).catch(console.error);
        res.status(500).json({ error: "Errore durante il recupero delle serie" });
    }
}
