import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function getAllLettureByIdUser(req, res) {
    // Usiamo id_utente per coerenza con il frontend
    const { id_utente } = req.params; 

    try {
        const { data, error } = await supabase
            .from('letture')
            .select(`
                *,
                opere (
                    titolo,
                    editore
                )
            `)
            .eq('id_user', id_utente) // Mappa id_utente (input) su id_user (colonna DB)
            .order('data_lettura', { ascending: false, nullsFirst: false });

        if (error) {
            throw new Error(error.message);
        }

        res.json(data);
    } catch (error) {
        await errorLogger(
            `[getAllLettureByIdUser] - Errore recupero letture per utente ${id_utente}: ${error.message}`
        ).catch(console.error);
        
        res.status(500).json({ 
            error: 'Errore interno durante il recupero delle letture' 
        });
    }
}