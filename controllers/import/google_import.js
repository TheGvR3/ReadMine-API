import { supabase } from "../../db.js";
import { errorLogger } from "../../middlewares/errorLogger.js";

const GOOGLE_BOOKS_URL = "https://www.googleapis.com/books/v1/volumes";

// =====================================================================
// Helpers
// =====================================================================

function stripHtml(s) {
    if (!s) return null;
    const cleaned = s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    return cleaned || null;
}

function forceHttps(url) {
    return url ? url.replace(/^http:\/\//i, "https://") : null;
}

function buildGoogleUrl(path, params = {}) {
    const sp = new URLSearchParams(params);
    if (process.env.GOOGLE_BOOKS_API_KEY) sp.set("key", process.env.GOOGLE_BOOKS_API_KEY);
    const qs = sp.toString();
    return `${GOOGLE_BOOKS_URL}${path}${qs ? `?${qs}` : ""}`;
}

// Parser semplice di pattern di serie nel titolo/sottotitolo Google.
function parseSerieFromTitleSubtitle(title, subtitle) {
    if (title) {
        const m = title.match(/\(([^,)]+),\s*(?:#|Book|Vol\.?|Volume|Tomo)\s*(\d+)\)/i);
        if (m) return { nome: m[1].trim(), numero: parseInt(m[2], 10) };
        // Pattern manga: "One Piece, Vol. 12"
        const m2 = title.match(/^(.+?),?\s+(?:Vol\.?|Volume|Tomo)\s*(\d+)/i);
        if (m2) return { nome: m2[1].trim(), numero: parseInt(m2[2], 10) };
    }
    if (subtitle) {
        const m = subtitle.match(/(?:Vol\.?|Volume|Book|Tomo)\s*(\d+)/i);
        if (m) return { nome: null, numero: parseInt(m[1], 10) };
    }
    return { nome: null, numero: null };
}

function mapVolume(volume) {
    const info = volume?.volumeInfo || {};
    const ids = info.industryIdentifiers || [];
    const isbn13 = ids.find(i => i.type === "ISBN_13")?.identifier;
    const isbn10 = ids.find(i => i.type === "ISBN_10")?.identifier;
    const cover = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || null;
    const anno = info.publishedDate ? parseInt(info.publishedDate.substring(0, 4), 10) : null;
    const serieParsata = parseSerieFromTitleSubtitle(info.title, info.subtitle);

    return {
        google_volume_id: volume?.id || null,
        opera: {
            titolo: info.title || null,
            descrizione_opera: stripHtml(info.description),
            lingua_originale: info.language || null,
            autori: Array.isArray(info.authors) ? info.authors : [],
            categorie: Array.isArray(info.categories) ? info.categories : [],
            printType: info.printType || null,
            serie_parsata: serieParsata,
        },
        edizione: {
            titolo_edizione: info.subtitle ? `${info.title} — ${info.subtitle}` : null,
            isbn_issn: isbn13 || isbn10 || null,
            editore: info.publisher || null,
            anno_pubblicazione: Number.isFinite(anno) ? anno : null,
            numero_pagine: Number.isFinite(info.pageCount) ? info.pageCount : null,
            copertina_url: forceHttps(cover),
            lingua: info.language || null,
            // numero_volume verrà passato esplicitamente dal client (per i manga)
        },
    };
}

async function inferTipoId(printType) {
    let nome = "Altro";
    if (printType === "BOOK") nome = "Libro";
    else if (printType === "MAGAZINE") nome = "Rivista";
    const { data } = await supabase.from("tipo").select("id_tipo").eq("nome_tipo", nome).maybeSingle();
    return data?.id_tipo || null;
}

async function findAutoreEsatto(nome) {
    if (!nome) return null;
    const { data } = await supabase
        .from("autori").select("id_autore, nome_autore")
        .eq("nome_autore", nome).maybeSingle();
    return data || null;
}

async function resolveGenere(nomeGoogle) {
    if (!nomeGoogle) return { alias_match: null, exact_match: null };
    const [aliasRes, exactRes] = await Promise.all([
        supabase.from("generi_alias")
            .select("id_genere, generi(nome_genere, fonte)")
            .eq("alias", nomeGoogle).maybeSingle(),
        supabase.from("generi")
            .select("id_genere, nome_genere, fonte")
            .eq("nome_genere", nomeGoogle).maybeSingle(),
    ]);
    return {
        alias_match: aliasRes.data
            ? { id_genere: aliasRes.data.id_genere, nome_genere: aliasRes.data.generi?.nome_genere }
            : null,
        exact_match: exactRes.data || null,
    };
}

async function findSerieEsatta(nome) {
    if (!nome) return null;
    const { data } = await supabase
        .from("serie").select("id_serie, nome_serie")
        .ilike("nome_serie", nome).maybeSingle();
    return data || null;
}

// Match per titolo (ricerca su token significativo). Usato per suggerire opere
// esistenti col titolo simile in fase di import.
async function findMatchingOpere(titolo) {
    if (!titolo) return [];
    const norm = titolo.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
    if (!norm) return [];
    const token = norm.split(" ").find(t => t.length > 3);
    if (!token) return [];
    const { data } = await supabase
        .from("opere").select("id_opera, titolo")
        .ilike("titolo", `%${token}%`).limit(5);
    return data || [];
}


// =====================================================================
// GET /import/google/search
// Ritorna i candidati con doppio match:
//   alreadyImported  → edizione GIÀ presente (via google_volume_id o ISBN)
//   matching_opere   → opere col titolo simile (per agganciare come edizione)
// =====================================================================

export async function searchGoogleBooks(req, res) {
    const { q, isbn } = req.query;
    if (!q && !isbn) return res.status(400).json({ error: "Parametro 'q' o 'isbn' obbligatorio" });

    const query = isbn ? `isbn:${String(isbn).replace(/[^0-9Xx]/g, "")}` : String(q);
    const limit = Math.max(1, Math.min(parseInt(req.query.maxResults, 10) || 10, 40));
    const startIndex = Math.max(0, parseInt(req.query.startIndex, 10) || 0);

    try {
        const url = buildGoogleUrl("", {
            q: query, maxResults: String(limit), startIndex: String(startIndex),
        });
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Google Books HTTP ${response.status}`);
        const json = await response.json();

        const items = (json.items || []).map(mapVolume);

        // Match edizioni esistenti: per google_volume_id e per ISBN
        const volumeIds = items.map(i => i.google_volume_id).filter(Boolean);
        const isbns = items.map(i => i.edizione.isbn_issn).filter(Boolean);

        let byVolumeId = new Map();
        let byIsbn = new Map();

        if (volumeIds.length) {
            const { data } = await supabase
                .from("edizioni").select("id_edizione, id_opera, google_volume_id")
                .in("google_volume_id", volumeIds);
            byVolumeId = new Map((data || []).map(e => [e.google_volume_id, e]));
        }
        if (isbns.length) {
            const { data } = await supabase
                .from("edizioni").select("id_edizione, id_opera, isbn_issn")
                .in("isbn_issn", isbns);
            byIsbn = new Map((data || []).map(e => [e.isbn_issn, e]));
        }

        const results = await Promise.all(items.map(async (i) => {
            const matchVol = byVolumeId.get(i.google_volume_id);
            const matchIsbn = i.edizione.isbn_issn ? byIsbn.get(i.edizione.isbn_issn) : null;
            const alreadyImported = matchVol || matchIsbn || null;

            return {
                google_volume_id: i.google_volume_id,
                titolo: i.opera.titolo,
                autori: i.opera.autori,
                editore: i.edizione.editore,
                anno_pubblicazione: i.edizione.anno_pubblicazione,
                isbn_issn: i.edizione.isbn_issn,
                copertina_url: i.edizione.copertina_url,
                lingua: i.edizione.lingua,
                categorie: i.opera.categorie,
                serie_parsata: i.opera.serie_parsata,
                alreadyImported: alreadyImported
                    ? {
                        id_edizione: alreadyImported.id_edizione,
                        id_opera: alreadyImported.id_opera,
                        match_via: matchVol ? "google_volume_id" : "isbn",
                    }
                    : null,
                matching_opere: alreadyImported ? [] : await findMatchingOpere(i.opera.titolo),
            };
        }));

        res.json({ totalItems: json.totalItems || 0, count: results.length, results });
    } catch (error) {
        await errorLogger(`[searchGoogleBooks] ${error.message}`).catch(console.error);
        res.status(500).json({ error: "Errore ricerca Google Books" });
    }
}


// =====================================================================
// GET /import/google/preview/:volumeId
// =====================================================================

export async function previewGoogleVolume(req, res) {
    const { volumeId } = req.params;
    if (!volumeId) return res.status(400).json({ error: "volumeId obbligatorio" });

    try {
        const { data: existing } = await supabase
            .from("edizioni").select("id_edizione, id_opera, opere(titolo)")
            .eq("google_volume_id", volumeId).maybeSingle();
        if (existing?.id_edizione) {
            return res.status(200).json({
                already_imported: true,
                id_edizione: existing.id_edizione,
                id_opera: existing.id_opera,
                titolo_opera: existing.opere?.titolo,
            });
        }

        const url = buildGoogleUrl(`/${encodeURIComponent(volumeId)}`);
        const response = await fetch(url);
        if (response.status === 404) return res.status(404).json({ error: "Volume non trovato" });
        if (!response.ok) throw new Error(`Google Books HTTP ${response.status}`);
        const volume = await response.json();
        const m = mapVolume(volume);
        if (!m.opera.titolo) return res.status(422).json({ error: "Volume senza titolo" });

        const [
            autoriResolvedRaw,
            generiResolvedRaw,
            serieMatched,
            tipoInferitoId,
            generiCuratiRes,
            tipiRes,
            matching_opere,
            isbnMatchRes,
        ] = await Promise.all([
            Promise.all(m.opera.autori.map(async (nome) => ({
                google_name: nome,
                matched: await findAutoreEsatto(nome),
            }))),
            Promise.all(m.opera.categorie.map(async (nome) => {
                const r = await resolveGenere(nome);
                let azione_default = "importato";
                if (r.alias_match) azione_default = "alias";
                else if (r.exact_match) azione_default = "esistente";
                return { google_name: nome, ...r, azione_default };
            })),
            findSerieEsatta(m.opera.serie_parsata.nome),
            inferTipoId(m.opera.printType),
            supabase.from("generi").select("id_genere, nome_genere").eq("fonte", "curato").order("nome_genere"),
            supabase.from("tipo").select("id_tipo, nome_tipo").order("nome_tipo"),
            findMatchingOpere(m.opera.titolo),
            // Match per ISBN: se l'edizione esiste già con stesso ISBN
            m.edizione.isbn_issn
                ? supabase.from("edizioni")
                    .select("id_edizione, id_opera, opere(titolo)")
                    .eq("isbn_issn", m.edizione.isbn_issn).maybeSingle()
                : Promise.resolve({ data: null }),
        ]);

        // Se trovato match ISBN, stesso comportamento di "already imported"
        if (isbnMatchRes.data?.id_edizione) {
            return res.status(200).json({
                already_imported: true,
                id_edizione: isbnMatchRes.data.id_edizione,
                id_opera: isbnMatchRes.data.id_opera,
                titolo_opera: isbnMatchRes.data.opere?.titolo,
                match_via: "isbn",
            });
        }

        res.json({
            already_imported: false,
            google_volume_id: m.google_volume_id,
            opera: {
                titolo: m.opera.titolo,
                descrizione_opera: m.opera.descrizione_opera,
                lingua_originale: m.opera.lingua_originale,
                tipo_opera_inferito: tipoInferitoId,
                matching_opere,
            },
            autori: autoriResolvedRaw,
            generi: generiResolvedRaw,
            serie_suggerita: {
                nome_parsato: m.opera.serie_parsata.nome,
                numero_volume_parsato: m.opera.serie_parsata.numero,
                matched: serieMatched,
            },
            edizione: m.edizione,
            lookups: {
                generi_curati: generiCuratiRes.data || [],
                tipi: tipiRes.data || [],
            },
        });
    } catch (error) {
        await errorLogger(`[previewGoogleVolume] ${error.message}`).catch(console.error);
        res.status(500).json({ error: "Errore preview" });
    }
}


// =====================================================================
// Helper: traduce body API → parametri RPC import_google_volume
// Usato sia da importGoogleVolume che da importBulk per consistenza.
// =====================================================================
async function buildRpcParams(volume, body) {
    const m = mapVolume(volume);

    const {
        id_opera, titolo, descrizione_opera, lingua_originale,
        tipo_opera, id_serie, numero_volume_opera, numero_volume_edizione,
        autori, generi, traduttore, complete_empty_fields,
    } = body;

    const p_autori_ids = [];
    const p_autori_da_creare = [];
    const p_generi_ids = [];
    const p_generi_da_creare = [];

    if (!id_opera) {
        for (const a of (autori || [])) {
            if (a.id_autore) p_autori_ids.push(a.id_autore);
            else if (a.nome_autore) p_autori_da_creare.push(a.nome_autore);
        }
        for (const g of (generi || [])) {
            if (!g.azione || g.azione === "ignora") continue;
            if (g.azione === "alias") {
                const { data: alias } = await supabase
                    .from("generi_alias").select("id_genere").eq("alias", g.google_name).maybeSingle();
                if (alias?.id_genere) p_generi_ids.push(alias.id_genere);
            } else if (g.azione === "esistente" || g.azione === "curato") {
                if (g.id_genere) p_generi_ids.push(g.id_genere);
            } else if (g.azione === "importato") {
                if (g.google_name) p_generi_da_creare.push(g.google_name);
            }
        }
    }

    return {
        m,
        params: {
            p_titolo:                 titolo || m.opera.titolo,
            p_tipo_opera:             tipo_opera || (id_opera ? null : await inferTipoId(m.opera.printType)),
            p_lingua_originale:       lingua_originale ?? m.opera.lingua_originale,
            p_descrizione_opera:      descrizione_opera ?? m.opera.descrizione_opera,
            p_id_serie:               id_serie || null,
            p_numero_volume_opera:    numero_volume_opera || null,
            p_id_opera_esistente:     id_opera || null,
            p_autori_ids,
            p_autori_da_creare,
            p_generi_ids,
            p_generi_da_creare,
            p_titolo_edizione:        m.edizione.titolo_edizione,
            p_isbn_issn:              m.edizione.isbn_issn,
            p_editore:                m.edizione.editore,
            p_anno_pubblicazione:     m.edizione.anno_pubblicazione,
            p_numero_pagine:          m.edizione.numero_pagine,
            p_copertina_url:          m.edizione.copertina_url,
            p_google_volume_id:       m.google_volume_id,
            p_lingua:                 m.edizione.lingua,
            p_traduttore:             traduttore || null,
            p_numero_volume_edizione: numero_volume_edizione ?? m.opera.serie_parsata.numero ?? null,
            p_complete_empty_fields:  !!complete_empty_fields,
        },
    };
}


// =====================================================================
// POST /import/google/import
// =====================================================================

export async function importGoogleVolume(req, res) {
    const { volumeId } = req.body || {};
    if (!volumeId) return res.status(400).json({ error: "volumeId obbligatorio" });

    try {
        // Idempotency: edizione già importata?
        const { data: existing } = await supabase
            .from("edizioni").select("id_edizione, id_opera")
            .eq("google_volume_id", volumeId).maybeSingle();
        if (existing?.id_edizione) {
            return res.status(200).json({
                message: "Edizione già presente",
                id_edizione: existing.id_edizione,
                id_opera: existing.id_opera,
                duplicate: true,
            });
        }

        const url = buildGoogleUrl(`/${encodeURIComponent(volumeId)}`);
        const response = await fetch(url);
        if (response.status === 404) return res.status(404).json({ error: "Volume non trovato" });
        if (!response.ok) throw new Error(`Google Books HTTP ${response.status}`);
        const volume = await response.json();

        const { m, params } = await buildRpcParams(volume, req.body);
        if (!m.opera.titolo && !req.body.id_opera) {
            return res.status(422).json({ error: "Volume senza titolo, non importabile" });
        }
        if (!params.p_id_opera_esistente && !params.p_tipo_opera) {
            return res.status(400).json({ error: "tipo_opera obbligatorio per nuova opera" });
        }

        const { data: result, error } = await supabase.rpc("import_google_volume", params);
        if (error) {
            if (error.code === "P0002") return res.status(404).json({ error: error.message });
            throw new Error(error.message);
        }

        res.status(201).json({
            message: req.body.id_opera ? "Edizione aggiunta a opera esistente" : "Opera + edizione importate",
            ...result,
            duplicate: false,
        });
    } catch (error) {
        await errorLogger(`[importGoogleVolume] ${error.message}`).catch(console.error);
        res.status(500).json({ error: "Errore importazione volume" });
    }
}


// =====================================================================
// POST /import/google/import-bulk
// Body: { items: [<oggetti come body di /import/google/import>] }
// Strategia "continua e segnala" (rollback parziale per item, non globale):
// per ogni item esegue una chiamata RPC separata. Se fallisce, lo mette in
// errors[] e prosegue. Risposta: { successes: [...], errors: [...] }.
// =====================================================================

export async function importGoogleBulk(req, res) {
    const { items } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "items deve essere un array non vuoto" });
    }
    if (items.length > 50) {
        return res.status(400).json({ error: "Massimo 50 item per chiamata" });
    }

    const successes = [];
    const errors = [];

    for (const item of items) {
        const { volumeId } = item || {};
        if (!volumeId) {
            errors.push({ volumeId: null, error: "volumeId mancante" });
            continue;
        }

        try {
            // Skip se già importato (idempotency: lo riportiamo come successo "duplicate")
            const { data: existing } = await supabase
                .from("edizioni").select("id_edizione, id_opera")
                .eq("google_volume_id", volumeId).maybeSingle();
            if (existing?.id_edizione) {
                successes.push({
                    volumeId, duplicate: true,
                    id_edizione: existing.id_edizione, id_opera: existing.id_opera,
                });
                continue;
            }

            // Fetch volume
            const url = buildGoogleUrl(`/${encodeURIComponent(volumeId)}`);
            const response = await fetch(url);
            if (response.status === 404) {
                errors.push({ volumeId, error: "Volume non trovato su Google" });
                continue;
            }
            if (!response.ok) {
                errors.push({ volumeId, error: `Google Books HTTP ${response.status}` });
                continue;
            }
            const volume = await response.json();
            const { m, params } = await buildRpcParams(volume, item);

            if (!m.opera.titolo && !item.id_opera) {
                errors.push({ volumeId, error: "Volume senza titolo" });
                continue;
            }
            if (!params.p_id_opera_esistente && !params.p_tipo_opera) {
                errors.push({ volumeId, error: "tipo_opera obbligatorio per nuova opera" });
                continue;
            }

            const { data: result, error } = await supabase.rpc("import_google_volume", params);
            if (error) {
                errors.push({ volumeId, error: error.message });
                continue;
            }

            successes.push({ volumeId, duplicate: false, ...result });
        } catch (err) {
            errors.push({ volumeId: item.volumeId, error: err.message });
        }
    }

    res.status(200).json({
        total: items.length,
        successCount: successes.length,
        errorCount: errors.length,
        successes,
        errors,
    });
}
