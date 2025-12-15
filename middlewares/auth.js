import jwt from "jsonwebtoken";
import { errorLogger } from "../middlewares/errorLogger.js";

// Middleware per autenticazione
export async function auth(req, res, next) {
    const header = req.headers["authorization"];
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Token mancante o formato non valido" });
    }

    const token = header.split(" ")[1]; // separa "Bearer" dal token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // verifica e decodifica il token
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            await errorLogger(`[ Token scaduto: ${error.message} ]`).catch(console.error);
            return res.status(403).json({ error: "Token scaduto" });
        }
        await errorLogger(`[ Token non valido: ${error.message} ]`).catch(console.error);
        res.status(403).json({ error: "Token non valido" });
    }
}