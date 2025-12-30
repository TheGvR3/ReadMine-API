import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function getLetturaById(req, res) {
    const { id_lettura } = req.params;
    console.log("Richiesta ricevuta per ID Lettura:", id_lettura); // DEBUG

    try {
        console.log("Eseguo query Supabase..."); // DEBUG
        const { data, error } = await supabase
            .from('letture')
            .select(`
                *,
                opere (
                    id_opera,
                    titolo,
                    editore,
                    stato_opera
                )
            `)
            .eq('id_lettura', id_lettura)
            .maybeSingle();

        if (error) {
            console.error("Errore query Supabase:", error.message); // DEBUG
            throw error;
        }

        console.log("Dati recuperati:", data); // DEBUG

        if (!data) {
            return res.status(404).json({ error: 'Lettura non trovata' });
        }

        return res.json(data); // Usa return per sicurezza

    } catch (error) {
        console.error("Errore Catch:", error.message); // DEBUG
        // Se errorLogger non è configurato bene, potrebbe bloccare tutto qui
        try {
            await errorLogger(`[getLetturaById] - Errore: ${error.message}`);
        } catch (logErr) {
            console.error("Errore durante il logging:", logErr);
        }
        
        return res.status(500).json({ error: 'Errore interno nel recupero della lettura' });
    }
}