import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

// GET /letture/opera/:id_opera/utente/:id_utente
// Ritorna TUTTE le letture dell'utente per quell'opera (può averne più di una se
// ha letto edizioni diverse). Array vuoto se nessuna.
export async function getLetturaByOperaAndUser(req, res) {
    const { id_opera, id_utente } = req.params;

    try {
        const { data, error } = await supabase
            .from("letture")
            .select(`
                id_lettura, id_user, id_opera, id_edizione, stato,
                data_inizio, data_fine, valutazione, volume, capitolo, pagina, note, created_at,
                edizioni ( id_edizione, titolo_edizione, editore, anno_pubblicazione, copertina_url )
            `)
            .eq("id_user", id_utente)
            .eq("id_opera", id_opera)
            .order("created_at", { ascending: false });

        if (error) throw new Error(error.message);
        res.json(data || []);
    } catch (error) {
        await errorLogger(
            `[getLetturaByOperaAndUser] - Opera ${id_opera} utente ${id_utente}: ${error.message}`
        ).catch(console.error);
        res.status(500).json({ error: "Errore durante il recupero della lettura" });
    }
}
