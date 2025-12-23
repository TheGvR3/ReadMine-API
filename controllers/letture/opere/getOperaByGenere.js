import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";


/**
 * Recupera tutte le opere collegate a un genere specifico tramite la vista aggregata.
 * Utilizza l'operatore .contains sulla colonna 'generi_ids'.
 */
export async function getOpereByGenere(req, res) {
    const { id_genere } = req.params;

    try {
        // 1. Validazione e conversione ID
        const idNumerico = parseInt(id_genere, 10);
        if (isNaN(idNumerico)) {
            return res.status(400).json({ error: "ID genere non valido. Deve essere un numero." });
        }

        // 2. Query alla vista
        // Filtriamo per 'generi_ids' cercando l'ID specifico all'interno dell'array
        const { data: opere, error } = await supabase
            .from('get_all_opere_view')
            .select('*')
            .contains('generi_ids', [idNumerico]);

        // 3. Gestione errori database
        if (error) {
            await errorLogger(`[getOpereByGenere] - Errore query per genere ID ${id_genere}: ${error.message}\n`).catch(console.error);
            return res.status(500).json({ error: "Errore durante l'interrogazione del database." });
        }

        // 4. Gestione caso "Nessun risultato"
        if (!opere || opere.length === 0) {
            return res.status(404).json({ message: 'Nessuna opera trovata per questo genere.' });
        }

        // Restituzione dei dati
        return res.json(opere);

    } catch (err) {
        // Errore imprevisto del server
        await errorLogger(`[getOpereByGenere] - Errore critico per genere ID ${id_genere}: ${err.message}\n`).catch(console.error);
        return res.status(500).json({ error: "Errore interno al server." });
    }
}