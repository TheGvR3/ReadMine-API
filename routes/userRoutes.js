import express from "express";
import { auth } from "../middlewares/auth.js";
import { getUserProfile, updatePassword, updateProfile } from "../controllers//user/index.js";
import { handleEditorRequest } from "../controllers/user/handleEditorRequest.js";
import { requestEditorRole } from "../controllers/user/requestEditoreRole.js";
import {getPendingEditorRequests} from "../controllers/user/getPendingEditorRequest.js";
import { getEditorRequestsHistory } from "../controllers/user/getEditorRequestHistory.js";
import { validateProfileUpdate, validatePasswordUpdate } from "../middlewares/validators/userValidator.js";



const router = express.Router();

/**
 * @swagger
 * /users/profile:
 *   get:
 *     tags: [Users]
 *     summary: Ottieni il profilo dell'utente autenticato
 *     responses:
 *       200:
 *         description: Profilo utente
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.get("/profile", getUserProfile);

/**
 * @swagger
 * /users/profile/update:
 *   put:
 *     tags: [Users]
 *     summary: Aggiorna i dati del profilo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProfileUpdateInput' }
 *     responses:
 *       200:
 *         description: Profilo aggiornato
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.put("/profile/update", validateProfileUpdate, updateProfile);

/**
 * @swagger
 * /users/profile/updatePassword:
 *   put:
 *     tags: [Users]
 *     summary: Aggiorna la password dell'utente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/PasswordUpdateInput' }
 *     responses:
 *       200:
 *         description: Password aggiornata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401:
 *         description: Vecchia password errata
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.put("/profile/updatePassword", validatePasswordUpdate, updatePassword);

/**
 * @swagger
 * /users/editorrequests:
 *   post:
 *     tags: [Users]
 *     summary: Richiedi il ruolo di Editor
 *     description: Crea una richiesta in stato `pending`. L'utente non deve essere già editor né avere richieste pendenti.
 *     responses:
 *       201:
 *         description: Richiesta inviata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Richiesta inviata con successo" }
 *       400:
 *         description: L'utente è già editor o ha già una richiesta in sospeso
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.post("/editorrequests", requestEditorRole);
/**
 * TODO: Proteggere queste rotte con il middleware auth dopo averlo corretto.
 * - /editorrequests: deve essere accessibile a tutti gli utenti loggati (auth).
 * - /handleeditorrequest: deve essere accessibile solo agli admin (auth con controllo ruoli).
 */

/**
 * @swagger
 * /users/editorrequestslist:
 *   get:
 *     tags: [Users]
 *     summary: Lista richieste editor in stato pending (admin)
 *     responses:
 *       200:
 *         description: Lista richieste pending
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: integer }
 *                   user_id: { type: integer }
 *                   status: { type: string, enum: [pending, approved, rejected] }
 *                   created_at: { type: string, format: date-time }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.get("/editorrequestslist", getPendingEditorRequests);

/**
 * @swagger
 * /users/editorrequestshistory:
 *   get:
 *     tags: [Users]
 *     summary: Storico di tutte le richieste editor (admin)
 *     responses:
 *       200:
 *         description: Storico richieste
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: integer }
 *                   user_id: { type: integer }
 *                   status: { type: string, enum: [pending, approved, rejected] }
 *                   created_at: { type: string, format: date-time }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.get("/editorrequestshistory", getEditorRequestsHistory);

/**
 * @swagger
 * /users/handleeditorrequest:
 *   post:
 *     tags: [Users]
 *     summary: Approva o rifiuta una richiesta editor (admin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/EditorRequestHandleInput' }
 *     responses:
 *       200:
 *         description: Richiesta gestita
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.post("/handleeditorrequest", handleEditorRequest);



export default router;
