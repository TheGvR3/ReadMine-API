import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "../../db.js";
import { errorLogger } from "../../middlewares/errorLogger.js";

export async function login(req, res) {
    const { identifier, password } = req.body;

    try {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(identifier)) {
            return res.status(400).json({ error: "Formato identificatore non valido" });
        }

        // Recupero utente da Supabase
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('email', identifier)
            .limit(1)
            .single();

        if (fetchError) throw fetchError;
        if (!user) return res.status(401).json({ error: "Utente non trovato" });

        // Confronto password
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ error: "Password errata" });
        }

        // Creo i token JWT
        const accessToken = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "10m" }
        );

        const refreshToken = jwt.sign(
            { userId: user.id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "3d" }
        );

        // Salvo il refresh token su Supabase
        const { error: updateError } = await supabase
            .from('users')
            .update({ refresh_token: refreshToken })
            .eq('id', user.id);

        if (updateError) throw updateError;

        // Imposto il cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/auth/',
        });

        // Risposta al client
        res.json({
            message: "Login effettuato con successo",
            accessToken,
            user: {
                id: user.id,
                email: user.email,
            },
        });

    } catch (error) {
        await errorLogger(`[login] - Errore durante il login: ${error.message}`).catch(console.error);
        res.status(500).json({ error: "Errore durante il login" });
    }
}
