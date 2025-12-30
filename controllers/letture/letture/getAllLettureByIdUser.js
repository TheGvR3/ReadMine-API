import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function getAllLettureByIdUser(req, res) {
    const { id_user } = req.params;

    try {
        // Recupera le letture dell'utente ordinandole per data decrescente
        // Nota: '*, opere(*)' recupera tutti i dati della lettura E i dati dell'opera associata
        const { data, error } = await supabase
            .from('letture')
            .select(`
                *,
                opere (
                    titolo,
                    editore
                )
            `)
            .eq('id_user', id_user)
            .order('data_lettura', { ascending: false, nullsFirst: false });

        if (error) {
            throw new Error(error.message);
        }

        res.json(data);
    } catch (error) {
        await errorLogger(
            `[getAllLettureByIdUser] - Errore durante il recupero delle letture: ${error.message}`
        ).catch(console.error);
        
        res.status(500).json({ 
            error: 'Errore interno durante il recupero delle letture' 
        });
    }
}