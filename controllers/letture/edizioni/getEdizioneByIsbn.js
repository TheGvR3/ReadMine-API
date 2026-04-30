import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

// GET /edizioni/isbn/:isbn
// Cerca per ISBN esatto. Match anche se l'ISBN nel DB ha trattini e quello in input no
// (e viceversa) — confrontiamo entrambe le forme normalizzate.
export async function getEdizioneByIsbn(req, res) {
    const { isbn } = req.params;
    const cleaned = String(isbn).replace(/[^0-9Xx]/g, "");

    try {
        const { data, error } = await supabase
            .from("edizioni")
            .select(`
                *,
                opere ( id_opera, titolo, tipo_opera, lingua_originale )
            `)
            .or(`isbn_issn.eq.${isbn},isbn_issn.eq.${cleaned}`)
            .maybeSingle();

        if (error) throw new Error(error.message);
        if (!data) return res.status(404).json({ message: "Edizione non trovata per questo ISBN" });

        res.json(data);
    } catch (error) {
        await errorLogger(`[getEdizioneByIsbn] - ISBN ${isbn}: ${error.message}`).catch(console.error);
        res.status(500).json({ error: "Errore durante il lookup ISBN" });
    }
}
