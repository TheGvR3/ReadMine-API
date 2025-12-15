import { supabase } from "../../db.js";
import { errorLogger } from "../../middlewares/errorLogger.js";

export async function getAllLetture(req, res) {
    try {
        const rows = await db`SELECT * FROM letture ORDER BY data_lettura DESC`;
        res.json(rows);
    } catch (error) {
        await errorLogger(`[getAllLetture] - Errore durante il recupero delle letture: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante il recupero delle letture' });
    }
}

export async function getLetturaById(req, res) {
    try {
        const { id_lettura } = req.params;
        const rows = await db`SELECT * FROM letture WHERE id_lettura = ${id_lettura}`;
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Lettura non trovata' });
        }
        res.json(rows);
    } catch (error) {
        await errorLogger(`[getLetturaById] - Errore durante il recupero della lettura: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante il recupero della lettura' });
    }
}

export async function createLettura(req, res) {
    try {
        const { id_utente, id_opera, data_lettura, volume, capitolo, pagina, stato } = req.body;

        const operaRows = await db`SELECT 1 FROM opere WHERE id_opera = ${id_opera}`;
        if (operaRows.length === 0) {
            return res.status(404).json({ error: "Opera non trovata" });
        }

        const letturaRows = await db`SELECT 1 FROM letture WHERE id_utente = ${id_utente} AND id_opera = ${id_opera}`;
        if (letturaRows.length > 0) {
            return res.status(409).json({ error: "Lettura già esistente per questo utente e opera" });
        }

        const result = await db`INSERT INTO letture (id_utente, id_opera, data_lettura, volume, capitolo, pagina, stato) VALUES (${id_utente}, ${id_opera}, ${data_lettura}, ${volume}, ${capitolo}, ${pagina}, ${stato})`;
        res.status(201).json({ message: 'Lettura creata con successo', id_lettura: result.insertId });
    } catch (error) {
        await errorLogger(`[createLettura] - Errore durante la creazione della lettura: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante la creazione della lettura' });
    }
}

export async function updateLettura(req, res) {
    try {
        const { id_lettura } = req.params;
        const { data_lettura, volume, capitolo, pagina, stato } = req.body;

        const letturaRows = await db`SELECT 1 FROM letture WHERE id_lettura = ${id_lettura}`;
        if (letturaRows.length === 0) {
            return res.status(404).json({ error: "Lettura non trovata" });
        }

        await db`UPDATE letture SET data_lettura = ${data_lettura}, volume = ${volume}, capitolo = ${capitolo}, pagina = ${pagina}, stato = ${stato} WHERE id_lettura = ${id_lettura}`;
        res.json({ message: 'Lettura aggiornata con successo' });
    } catch (error) {
        await errorLogger(`[updateLettura] - Errore durante l'aggiornamento della lettura: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante l\'aggiornamento della lettura' });
    }
}

export async function deleteLettura(req, res) {
    try {
        const { id_lettura } = req.params;

        const letturaRows = await db`SELECT 1 FROM letture WHERE id_lettura = ${id_lettura}`;
        if (letturaRows.length === 0) {
            return res.status(404).json({ error: "Lettura non trovata" });
        }

        await db`DELETE FROM letture WHERE id_lettura = ${id_lettura}`;
        res.json({ message: 'Lettura eliminata con successo' });
    } catch (error) {
        await errorLogger(`[deleteLettura] - Errore durante l'eliminazione della lettura: ${error.message}\n`).catch(console.error);
        res.status(500).json({ error: 'Errore durante l\'eliminazione della lettura' });
    }
}
