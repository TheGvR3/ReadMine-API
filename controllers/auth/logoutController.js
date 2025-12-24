import { supabase } from "../../db.js";
import { errorLogger } from "../../middlewares/errorLogger.js";

export async function logout(req, res) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(200).json({ message: "Nessuna sessione attiva." });
    }

    try {
        // Invalidiamo il refresh token nel database
        const { data, error } = await supabase
            .from('users')
            .update({ refresh_token: null })
            .eq('refresh_token', refreshToken)
            .select();

        if (error) {
            await errorLogger(`[logout] - Errore DB: ${error.message}`).catch(console.error);
            return res.status(500).json({ error: "Errore durante il logout." });
        }

        // Se nessun utente aveva quel token
        if (!data || data.length === 0) {
            return res.status(404).json({ error: "Token non trovato nel database" });
        }

        // Rimuoviamo il refresh token dal cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/'
        });

        return res.json({ message: "Logout effettuato, token invalidato." });
    } catch (error) {
        console.error(error);
        await errorLogger(`[logout] - Errore durante il logout: ${error.message}`).catch(console.error);
        return res.status(500).json({ error: "Errore durante il logout." });
    }
}
