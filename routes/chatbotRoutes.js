import express from 'express';
import { generateAIResponse } from '../controllers/chatbot/chatbotController.js';

const router = express.Router();

/**
 * @swagger
 * /ai/generate:
 *   post:
 *     tags: [AI]
 *     summary: Genera una risposta AI con contesto dal catalogo
 *     description: |
 *       Riconosce l'intento dell'utente (`get_books`, `search_book`, `recommend_books`,
 *       `search_series`, `general_chat`) e usa le API interne per arricchire il prompt
 *       prima di generare la risposta tramite Groq (llama-3.3-70b).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ChatbotInput' }
 *     responses:
 *       200:
 *         description: Risposta generata
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ChatbotResponse' }
 *       400:
 *         description: Input mancante o vuoto
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Token di autenticazione mancante
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.post('/generate', generateAIResponse);

export default router;
