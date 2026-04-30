import { supabase } from "../../../../db.js";
import { errorLogger } from "../../../../middlewares/errorLogger.js";

// POST /genere/alias
// Body: { alias: string, id_genere: number }
// Crea un mapping da nome esterno (es. "Fiction / Historical") a un genere curato.
export async function createGenereAlias(req, res) {
    const { alias, id_genere } = req.body;

    try {
        // Verifica che il genere esista
        const { data: genere } = await supabase
            .from("generi")
            .select("id_genere")
            .eq("id_genere", id_genere)
            .maybeSingle();
        if (!genere) {
            return res.status(404).json({ error: `Genere ${id_genere} non trovato` });
        }

        const { data, error } = await supabase
            .from("generi_alias")
            .insert({ alias, id_genere })
            .select("alias, id_genere")
            .maybeSingle();

        if (error) {
            // 23505 = unique_violation (alias già esistente)
            if (error.code === "23505") {
                return res.status(409).json({ error: "Alias già esistente" });
            }
            throw new Error(error.message);
        }

        res.status(201).json({ message: "Alias creato", ...data });
    } catch (error) {
        await errorLogger(`[createGenereAlias] - alias=${alias}: ${error.message}`).catch(console.error);
        res.status(500).json({ error: "Errore durante la creazione dell'alias" });
    }
}
