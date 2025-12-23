import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function getAutoriByOpera(req, res) {
    const { id_opera } = req.params;
    try {

        // Questo è il modo di Supabase per JOIN:
        const { data: rows, error } = await supabase
            .from('autori_opere')
            .select('autori(*)') // Recupera tutte le colonne dell'autore correlato
            .eq('id_opera', id_opera); // Filtra per l'ID dell'opera

        if (error) {
            throw new Error(error.message);
        }

        // Il risultato è un array di oggetti { autori: { id_autore:..., nome_autore:... } }.
        // Mappiamo per pulire il risultato.
        const autori = rows.map(row => row.autori);
        if (autori.length === 0) {
            return res.status(404).json({ message: 'Nessun autore trovato per questa opera' });
        }

        res.json(autori);
    } catch (error) {
        await errorLogger(`[getAutoriByOpera] - Errore durante il recupero degli autori per l'opera con ID ${req.params.id_opera}: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante il recupero degli autori per l\'opera' });
    }
}
