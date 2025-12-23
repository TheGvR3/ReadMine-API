import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function getSerieByOpera(req, res) {
    const { id_opera } = req.params;
    try {

        // Questo è il modo di Supabase per JOIN:
        const { data: rows, error } = await supabase
            .from('opere')
            .select('serie(*)') // Recupera tutte le colonne della serie correlata
            .eq('id_opera', id_opera); // Filtra per l'ID dell'opera

        if (error) {
            throw new Error(error.message);
        }

        // Il risultato è un array di oggetti { serie: { id_serie:..., nome_serie:... } }.
        // Mappiamo per pulire il risultato.
        const serie = rows.map(row => row.serie);
        if (serie.length === 0) {
            return res.status(404).json({ message: 'Nessuna serie trovata per questa opera' });
        }

        res.json(serie);
    } catch (error) {
        await errorLogger(`[getSerieByOpera] - Errore durante il recupero delle serie per l'opera con ID ${req.params.id_opera}: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante il recupero delle serie per l\'opera' });
    }
}//CORREGGERE LA COLONNA ID SERIE PERCHE TRATTATA COME TEXT
