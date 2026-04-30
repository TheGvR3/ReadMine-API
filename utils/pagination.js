// Helpers per paginazione su Supabase.
// Convenzione query: ?page=1&limit=20  (1-based, default 20, max 100)

export function getPagination(req, { defaultLimit = 20, maxLimit = 100 } = {}) {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(maxLimit, Math.max(1, parseInt(req.query.limit, 10) || defaultLimit));
    const from = (page - 1) * limit;
    const to = from + limit - 1; // Supabase .range è inclusivo
    return { page, limit, from, to };
}

export function paginatedResponse(data, total, page, limit) {
    return {
        data: data ?? [],
        total: total ?? (data?.length || 0),
        page,
        limit,
        totalPages: total != null ? Math.max(1, Math.ceil(total / limit)) : null,
    };
}
