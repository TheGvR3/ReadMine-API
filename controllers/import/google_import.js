/*import axios from 'axios';
import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

async function resolveNamesToIds(table, column, names) {
    if (!names || !Array.isArray(names) || names.length === 0) return [];
    const ids = [];
    const idColumn = table === 'autori' ? 'id_autore' : 'id_genere';

    for (const name of names) {
        try {
            const { data, error } = await supabase
                .from(table)
                .upsert({ [column]: name }, { onConflict: column })
                .select(idColumn)
                .single();
            if (error) throw error;
            ids.push(data[idColumn]);
        } catch (err) {
            console.error(`Errore risoluzione su ${table}:`, err.message);
        }
    }
    return ids;
}

export async function importFromGoogle(req, res) {
    const { query, maxToImport = 40 } = req.body;
    let startIndex = 0;
    const batchSize = 40;
    let totalImported = 0;

    try {
        while (startIndex < maxToImport) {
            const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
                params: {
                    q: query,
                    startIndex: startIndex,
                    maxResults: Math.min(batchSize, maxToImport - startIndex)
                }
            });

            const items = response.data.items;
            if (!items) break;

            for (const item of items) {
                const info = item.volumeInfo;

                // 1. Estrazione ISBN (se presente)
                const isbnObj = info.industryIdentifiers?.find(id => id.type === "ISBN_13") || 
                               info.industryIdentifiers?.find(id => id.type === "ISBN_10");
                const isbn = isbnObj ? isbnObj.identifier : null;

                // 2. Mapping Tipo Opera dal tuo screenshot
                let idTipoOpera = 4; // Default: Altro
                if (info.printType === 'BOOK') idTipoOpera = 1;      // Libro
                if (info.printType === 'MAGAZINE') idTipoOpera = 3;  // Rivista

                // 3. Risoluzione Autori e Generi
                const autoriIds = await resolveNamesToIds('autori', 'nome_autore', info.authors);
                const generiIds = await resolveNamesToIds('generi', 'nome_genere', info.categories);

                // 4. Chiamata al database (RPC)
                // Ho aggiunto isbn_issn e descrizione_opera basandomi sul tuo schema
                const { data: operaId, error: rpcError } = await supabase.rpc('create_opera', {
                    p_titolo: info.title,
                    p_tipo_opera: idTipoOpera,
                    p_anno_pubblicazione: info.publishedDate ? parseInt(info.publishedDate.substring(0, 4)) : null,
                    p_editore: info.publisher || null,
                    p_lingua_originale: info.language || null,
                    p_stato_opera: 'finito',
                    p_id_serie: null,
                    p_autori: autoriIds,
                    p_generi: generiIds,
                    // Aggiungi questi parametri alla tua funzione SQL se non ci sono ancora:
                    p_isbn_issn: isbn, 
                    p_descrizione: info.description || null 
                });

                if (!rpcError) totalImported++;
            }
            startIndex += batchSize;
        }

        res.status(200).json({ success: true, imported: totalImported });
    } catch (error) {
        await errorLogger(`[import] Errore: ${error.message}`);
        res.status(500).json({ error: "Errore importazione" });
    }
}*/