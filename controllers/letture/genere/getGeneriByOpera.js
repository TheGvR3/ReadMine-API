import { supabase } from "../../../db.js";
import { errorLogger } from "../../../middlewares/errorLogger.js";

export async function getGeneriByOpera(req, res) {
    const { id_opera } = req.params;
    try {
        const { data: generi, error } = await supabase
            .from('opera_generi')
            .select('generi(*)')
            .eq('id_opera', id_opera);

        if (error) {
            throw new Error(error.message);
        }

        const genereList = generi.map(item => item.generi);
        if (genereList.length === 0) {
            return res.status(404).json({ message: 'Nessun genere trovato per questa opera' });
        }
        res.json(genereList);
    } catch (error) {
        await errorLogger(`[getGenereByOpera] - Errore durante il recupero dei generi per l'opera con ID ${req.params.id_opera}: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante il recupero dei generi per l\'opera' });
    }
}