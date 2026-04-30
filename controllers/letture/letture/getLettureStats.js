import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

// GET /letture/stats/:id_utente
// Ritorna:
//   conteggi per stato + totale
//   pagine totali lette (su letture finite con edizione)
//   valutazione media
//   top 3 generi e top 3 autori (su letture finite)
//
// Niente reading streak per ora (richiede analisi giornaliera, calcoliamo lato app dopo).
export async function getLettureStats(req, res) {
    const { id_utente } = req.params;

    try {
        // 1. Tutte le letture dell'utente (singola query, poi aggreghi in JS)
        const { data: letture, error: errL } = await supabase
            .from("letture")
            .select(`
                stato, valutazione, id_edizione,
                edizioni ( numero_pagine ),
                opere (
                    autori_opere ( autori ( id_autore, nome_autore ) ),
                    generi_opere ( generi ( id_genere, nome_genere ) )
                )
            `)
            .eq("id_user", id_utente);

        if (errL) throw new Error(errL.message);

        const counts = { da_iniziare: 0, in_corso: 0, finito: 0, abbandonato: 0 };
        let pagine_totali = 0;
        const valutazioni = [];
        const genereFreq = new Map();
        const autoreFreq = new Map();

        for (const l of letture || []) {
            counts[l.stato] = (counts[l.stato] || 0) + 1;

            if (l.stato === "finito") {
                pagine_totali += l.edizioni?.numero_pagine || 0;

                for (const ao of l.opere?.autori_opere || []) {
                    const a = ao.autori;
                    if (a?.id_autore) {
                        const cur = autoreFreq.get(a.id_autore) || { id_autore: a.id_autore, nome: a.nome_autore, count: 0 };
                        cur.count++;
                        autoreFreq.set(a.id_autore, cur);
                    }
                }
                for (const go of l.opere?.generi_opere || []) {
                    const g = go.generi;
                    if (g?.id_genere) {
                        const cur = genereFreq.get(g.id_genere) || { id_genere: g.id_genere, nome: g.nome_genere, count: 0 };
                        cur.count++;
                        genereFreq.set(g.id_genere, cur);
                    }
                }
            }

            if (l.valutazione != null) valutazioni.push(l.valutazione);
        }

        const valutazione_media = valutazioni.length
            ? Math.round((valutazioni.reduce((a, b) => a + b, 0) / valutazioni.length) * 100) / 100
            : null;

        const top_generi = [...genereFreq.values()].sort((a, b) => b.count - a.count).slice(0, 3);
        const top_autori = [...autoreFreq.values()].sort((a, b) => b.count - a.count).slice(0, 3);

        res.json({
            ...counts,
            totale: Object.values(counts).reduce((a, b) => a + b, 0),
            pagine_totali,
            valutazione_media,
            top_generi,
            top_autori,
        });
    } catch (error) {
        await errorLogger(
            `[getLettureStats] - Utente ${id_utente}: ${error.message}`
        ).catch(console.error);
        res.status(500).json({ error: "Errore durante il recupero delle statistiche" });
    }
}
