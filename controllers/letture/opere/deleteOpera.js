import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

/* come eliminare un'opera e le sue associazioni in modo sicuro
ALTER TABLE autori_opere 
ADD CONSTRAINT fk_opera_id
    FOREIGN KEY (id_opera) 
    REFERENCES opere (id_opera) 
    ON DELETE CASCADE;
 */
export async function deleteOpera(req, res) {
    const { id_opera } = req.params;
    try {
        const { error, count } = await supabase
            .from('opere')
            .delete()
            .eq('id_opera', id_opera)
            .select('*', { count: 'exact' }); // Conta le righe eliminate

        if (error) {
            throw new Error(error.message);
        }
        if (count === 0) {
            return res.status(404).json({ message: 'Opera non trovata' });
        }

        res.status(200).json({
            message: 'Opera eliminata con successo'
        });
    } catch (error) {
        await errorLogger(`[deleteOpera] - Errore durante l'eliminazione dell'opera: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante l\'eliminazione dell\'opera' });
    }
}
