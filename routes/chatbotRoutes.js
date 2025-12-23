import express from 'express';
import { generateAIResponse } from '../controllers/chatbot/chatbotController.js';

const router = express.Router();

// Route per la generazione AI (solo testo)
router.post('/generate', generateAIResponse);

export default router;