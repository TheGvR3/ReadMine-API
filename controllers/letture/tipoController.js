import { supabase } from "../../db.js";
import { errorLogger } from "../../middlewares/errorLogger.js";

export async function getTipo(req, res) {
    try {
        const { data: rows, error } = await supabase
            .from("tipo")
            .select("*")
            .order("id_tipo", { ascending: true });

        if (error) {
            throw error;
        }

        res.json(rows);
    } catch (error) {
        await errorLogger(`[getTipo] - Errore durante il recupero del tipo: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante il recupero del tipo' });
    }
}

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