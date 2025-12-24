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

        // 1. Cerchiamo l'utente e il token in un colpo solo
        const { data: user, error: dbErr } = await supabase
            .from('users')
            .select('id, email, refresh_token')
            .eq('refresh_token', refreshToken)
            .maybeSingle();

        // 2. Gestione Errore Tecnico del DB (es. connessione persa)
        if (dbErr) {
            await errorLogger(`[refreshToken] - Errore DB: ${dbErr.message}`);
            return res.status(500).json({ error: "Errore interno del server" });
        }

        // 3. Gestione Token non trovato o non corrispondente
        if (!user || user.id !== decoded.userId) {
            // Qui non usiamo dbErr.message perché dbErr è null!
            await errorLogger(`[refreshToken] - Tentativo con token non valido o revocato`);
            return res.status(401).json({ error: "Sessione non valida" });
        }


        // 4. Se tutto è ok, crea il nuovo access token
        const newAccessToken = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "10m" }
        );

        // Restituisci il nuovo access token
        res.json({ accessToken: newAccessToken });
    } catch (error) {
        if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Sessione scaduta, effettua il login" });
        }

        // Fallback sicuro per errori imprevisti
        const crashMsg = error?.message || "Errore sconosciuto";
        await errorLogger(`[refreshToken] - Errore critico: ${crashMsg}`);
        return res.status(500).json({ error: "Errore interno" });
    }
}
