import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function getAllLibriByIdUser(req, res) {
    const { id_utente } = req.params; 

    try {
        const { data, error } = await supabase
            .from('letture')
            .select(`
                *,
                opere!inner (
                    titolo,
                    editore,
                    tipo_opera
                )
            `)
            .eq('id_user', id_utente)
            .eq('opere.tipo_opera', 1) // Filtra solo le opere che sono Libri (ID 1)
            .order('data_lettura', { ascending: false, nullsFirst: false });

        if (error) {
            throw new Error(error.message);
        }

        res.json(data);
    } catch (error) {
        await errorLogger(
            `[getAllLibriByIdUser] - Errore recupero libri per utente ${id_utente}: ${error.message}`
        ).catch(console.error);
        
        res.status(500).json({ 
            error: 'Errore interno durante il recupero dei libri' 
        });
    }
}