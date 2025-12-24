import jwt from "jsonwebtoken";
import { supabase } from "../../db.js";
import { errorLogger } from "../../middlewares/errorLogger.js";

export async function refreshToken(req, res) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ error: "Sessione scaduta o token mancante" });
    }

    try {

        // 1. Pulisci e verifica il token
        const rawToken = refreshToken.trim();
        const decoded = jwt.verify(rawToken, process.env.JWT_REFRESH_SECRET);

        // 2. Query al DB
        const { data: user, error: dbErr } = await supabase
            .from('users')
            .select('id, email, refresh_token')
            .eq('refresh_token', rawToken) // Cerchiamo il token esatto
            .maybeSingle();

        if (dbErr) {
            const msg = dbErr.message || JSON.stringify(dbErr);
            await errorLogger(`[refreshToken] - Errore DB: ${msg}`);
            return res.status(500).json({ error: "Errore server" });
        }

        // 3. Controllo incrociato (La parte "incriminata")
        // Usiamo il confronto non stretto (==) o String() per essere sicuri al 100%
        if (!user || String(user.id) !== String(decoded.userId)) {
            console.log("DEBUG LOGIN:", {
                foundInDb: !!user,
                dbId: user?.id,
                jwtId: decoded.userId
            });
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
