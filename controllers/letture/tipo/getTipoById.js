import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function getTipoById(req, res) {
    try {
        const { id_tipo } = req.params;
        const { data: tipo, error } = await supabase
            .from("tipo")
            .select("*")
            .eq("id_tipo", id_tipo)
            .single();

        if (error) {
            // Controlla l'errore specifico di "No rows found"
            if (error.code === 'PGRST204') {
                return res.status(404).json({ message: 'Tipo non trovato' });
            }
            // Altrimenti, lancia l'errore per il catch
            throw new Error(error.message);
        }
        
        res.json(tipo);
    } catch (error) {
        await errorLogger(`[getTipoById] - Errore durante il recupero del tipo con ID ${req.params.id}: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante il recupero del tipo' });
    }
}