import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function getAllRivisteByIdUser(req, res) {
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
            .eq('opere.tipo_opera', 3) // Filtra solo Riviste (ID 3)
            .order('data_lettura', { ascending: false, nullsFirst: false });

        if (error) {
            throw new Error(error.message);
        }

        res.json(data);
    } catch (error) {
        await errorLogger(
            `[getAllRivisteByIdUser] - Errore recupero riviste per utente ${id_utente}: ${error.message}`
        ).catch(console.error);
        
        res.status(500).json({ 
            error: 'Errore interno durante il recupero delle riviste' 
        });
    }
}