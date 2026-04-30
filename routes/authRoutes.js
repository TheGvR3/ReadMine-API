import express from "express";
import {
    register,
    login,
    refreshToken,
    logout
} from "../controllers/auth/index.js";
import { validateRegister, validateLogin } from "../middlewares/validators/authValidator.js";


const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Registra un nuovo utente
 *     description: Crea un nuovo account e invia un'email di conferma. Endpoint pubblico.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       200:
 *         description: Utente registrato con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Utente registrato con successo!" }
 *       400:
 *         description: Email già registrata o errore di validazione
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post("/register", validateRegister, register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login utente
 *     description: |
 *       Autentica l'utente e ritorna un access token JWT (validità 10 minuti).
 *       Imposta inoltre un cookie httpOnly `refreshToken` (validità 3 giorni).
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login riuscito
 *         headers:
 *           Set-Cookie:
 *             description: Cookie httpOnly contenente il refresh token
 *             schema: { type: string }
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Formato identificatore non valido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Credenziali errate
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post("/login", validateLogin, login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Rinnova l'access token
 *     description: Usa il cookie httpOnly `refreshToken` per ottenere un nuovo access token.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Nuovo access token generato
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken: { type: string }
 *       401:
 *         description: Refresh token mancante o non valido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post("/refresh", refreshToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout utente
 *     description: Invalida il refresh token e cancella il cookie.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logout effettuato
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Logout effettuato con successo" }
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post("/logout", logout);

export default router;
