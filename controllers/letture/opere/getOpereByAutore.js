import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";


/**
 * Recupera tutte le opere collegate a un autore specifico tramite la vista aggregata.
 * Utilizza l'operatore .contains perché la vista raggruppa gli ID in un array.
 */
export async function getOpereByAutore(req, res) {
    const { id_autore } = req.params;

    try {
        // 1. Validazione e conversione ID
        const idNumerico = parseInt(id_autore, 10);
        if (isNaN(idNumerico)) {
            return res.status(400).json({ error: "ID autore non valido. Deve essere un numero." });
        }
        // 2. Query alla vista
        // Usiamo .cs('colonna', [valore]) perché 'autori_ids' nella vista è un ARRAY_AGG.
        // Questo operatore SQL corrisponde a @> (contiene elemento).
        const { data: opere, error } = await supabase
            .from('get_all_opere_view')
            .select('*')
            .contains('autori_ids', [idNumerico]);

        // 3. Gestione errori database
        if (error) {
            await errorLogger(`[getOpereByAutore] - Errore durante l'interrogazione delle opere per l'autore con ID ${id_autore}: ${error.message}\n`).catch(console.error);
            return res.status(500).json({ error: "Errore durante l'interrogazione del database." });
        }

        // 4. Gestione caso "Nessun risultato"
        // Restituiamo 404 così il frontend può mostrare il messaggio "Nessuna opera trovata"
        if (!opere || opere.length === 0) {
            return res.status(404).json({ message: 'Nessuna opera trovata per questo autore.' });
        }
        return res.json(opere);

    } catch (err) {
        // Errore imprevisto del server (crash, timeout, etc.)
        await errorLogger(`[getOpereByAutore] - Errore critico durante il recupero delle opere per l'autore con ID ${id_autore}: ${err.message}\n`).catch(console.error);
        return res.status(500).json({ error: "Errore interno al server." });
    }
}