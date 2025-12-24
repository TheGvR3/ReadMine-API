import jwt from "jsonwebtoken";
import { supabase } from "../../db.js";
import { errorLogger } from "../../middlewares/errorLogger.js";

export async function refreshToken(req, res) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ error: "Sessione scaduta o token mancante" });
    }

    try {
        // Verifica che il refresh token sia valido
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // Verifico il token iscritto nel database
        const { data: tokenRows, error: tokenErr } = await supabase
            .from('users')
            .select('*')
            .eq('refresh_token', refreshToken)
            .single();

        if (tokenErr || !tokenRows) {
            await errorLogger(`[refreshToken] - Errore DB token: ${tokenErr.message}`);
            // Se il token non è nel DB, la sessione è stata revocata
            return res.status(401).json({ error: "Sessione non valida" });
        }

        // Verifico se l'utente esiste nel database
        const { data: userRows, error: userErr } = await supabase
            .from('users')
            .select('*')
            .eq('id', decoded.userId)
            .single();

        if (userErr) {
            await errorLogger(`[refreshToken] - Errore DB utente: ${userErr.message}`);
            return res.status(500).json({ error: "Errore server" });
        }

        if (!userRows) {
            return res.status(403).json({ error: "Utente non trovato" });
        }


        // Crea un nuovo access token
        const newAccessToken = jwt.sign(
            { userId: decoded.userId, email: userRows.email }, // Passiamo anche l'email per esempio
            process.env.JWT_SECRET,
            { expiresIn: "10m" } // Imposta la durata del nuovo access token
        );

        // Restituisci il nuovo access token
        res.json({ accessToken: newAccessToken });
    } catch (error) {
        // Gestione specifica degli errori JWT
        if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Sessione scaduta, effettua il login" });
        }

        await errorLogger(`[refreshToken] - Errore critico: ${error.message}`);
        return res.status(500).json({ error: "Errore interno durante il refresh" });
    }
}
