import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";
import { getPagination, paginatedResponse } from "../../../utils/pagination.js";

// Mappa "sort" friendly → colonna della view
const SORT_FIELDS = {
    titolo:  "titolo",
    anno:    "prima_edizione_anno",
    recenti: "id_opera",
};

/**
 * GET /opere/search
 * Query: q, autore, genere, tipo, stato, serie, page, limit, sort, order
 */
export async function searchOpereAdvanced(req, res) {
    const { page, limit, from, to } = getPagination(req);
    const { q, autore, genere, tipo, stato, serie } = req.query;
    const sort = SORT_FIELDS[req.query.sort] || SORT_FIELDS.titolo;
    const ascending = String(req.query.order || "asc").toLowerCase() !== "desc";

    try {
        let query = supabase
            .from("get_all_opere_view")
            .select("*", { count: "exact" });

        if (q)      query = query.ilike("titolo", `%${q}%`);
        if (autore) query = query.contains("autori_ids", [parseInt(autore, 10)]);
        if (genere) query = query.contains("generi_ids", [parseInt(genere, 10)]);
        if (tipo)   query = query.eq("id_tipo", parseInt(tipo, 10));
        if (stato)  query = query.eq("stato_opera", stato);
        if (serie)  query = query.eq("id_serie", parseInt(serie, 10));

        query = query.order(sort, { ascending, nullsFirst: false }).range(from, to);

        const { data, error, count } = await query;
        if (error) throw new Error(error.message);

        res.json(paginatedResponse(data, count, page, limit));
    } catch (error) {
        await errorLogger(`[searchOpereAdvanced] - ${error.message}`).catch(console.error);
        res.status(500).json({ error: "Errore durante la ricerca" });
    }
}
