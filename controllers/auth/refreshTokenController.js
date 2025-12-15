import jwt from "jsonwebtoken";
import { supabase } from "../../db.js";
import { errorLogger } from "../../middlewares/errorLogger.js";

export async function refreshToken(req, res) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(400).json({ error: "Token mancante" });
    }

    try {
        // Verifica che il refresh token sia valido
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // Verifico il token iscritto nel database
        const { data: tokenRows, error: tokenErr } = await supabase
            .from('users')
            .select('*')
            .eq('refresh_token', refreshToken)
            .limit(1);

        if (tokenErr) {
            await errorLogger(`[refreshToken] - Errore DB token: ${tokenErr.message}`);
            return res.status(500).json({ error: "Errore server" });
        }

        if (!tokenRows || tokenRows.length === 0) {
            return res.status(403).json({ error: "Token non valido" });
        }

        // Verifico se l'utente esiste nel database
        const { data: userRows, error: userErr } = await supabase
            .from('users')
            .select('*')
            .eq('id', decoded.userId)
            .limit(1);

        if (userErr) {
            await errorLogger(`[refreshToken] - Errore DB utente: ${userErr.message}`);
            return res.status(500).json({ error: "Errore server" });
        }

        if (!userRows || userRows.length === 0) {
            return res.status(403).json({ error: "Utente non trovato" });
        }
        

        // Crea un nuovo access token
        const newAccessToken = jwt.sign(
            { userId: decoded.userId, email: userRows[0].email }, // Passiamo anche l'email per esempio
            process.env.JWT_SECRET,
            { expiresIn: "10m" } // Imposta la durata del nuovo access token
        );
        
        // Restituisci il nuovo access token
        res.json({ accessToken: newAccessToken });
    } catch (error) {
        await errorLogger(`[refreshToken] - Errore durante il refresh del token - Errore: ${error.message}`).catch(console.error);
        res.status(500).json({ error: "Errore durante il refresh del token" });
    }
}
