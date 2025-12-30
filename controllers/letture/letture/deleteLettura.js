import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function deleteLettura(req, res) {
    const { id_lettura } = req.params;

    try {
        // Eseguiamo la cancellazione chiedendo a Supabase di restituirci i dati eliminati
        const { data, error, count } = await supabase
            .from('letture')
            .delete({ count: 'exact' })
            .eq('id_lettura', id_lettura)
            .select(); 

        if (error) {
            throw new Error(error.message);
        }

        // Se count è 0, significa che non è stata trovata nessuna riga con quell'ID
        if (count === 0) {
            return res.status(404).json({ error: "Lettura non trovata" });
        }

        res.json({ message: 'Lettura eliminata con successo' });

    } catch (error) {
        await errorLogger(
            `[deleteLettura] - Errore durante l'eliminazione della lettura: ${error.message}`
        ).catch(console.error);
        
        res.status(500).json({ 
            error: 'Errore interno durante l\'eliminazione della lettura' 
        });
    }
}