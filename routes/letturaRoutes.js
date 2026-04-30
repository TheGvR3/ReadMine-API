import express from "express";
import { auth } from "../middlewares/auth.js";
// Importa i validatori
import { validateCreateLettura, validateUpdateLettura, validateUpdateLetturaStato } from "../middlewares/validators/letturaValidator.js";
import { validateId } from "../middlewares/validators/idValidator.js";
// Importa i controller
//get
import { getAllLettureByIdUser } from "../controllers/letture/letture/getAllLettureByIdUser.js";
import { getAllLibriByIdUser } from "../controllers/letture/letture/getAllLibribyUser.js";
import { getAllMangaByIdUser } from "../controllers/letture/letture/getAllMangaByUser.js";
import { getAllRivisteByIdUser } from "../controllers/letture/letture/getAllRivisteByUser.js";
import { getLetturaById } from "../controllers/letture/letture/getLetturaById.js";
import { getLetturaByOperaAndUser } from "../controllers/letture/letture/getLetturaByOperaAndUser.js";
import { getLettureStats } from "../controllers/letture/letture/getLettureStats.js";
//post, put, delete, patch
import { createLettura } from "../controllers/letture/letture/createLettura.js";
import { updateLettura as updateLetturaController } from "../controllers/letture/letture/updateLettura.js";
import { updateLetturaStato } from "../controllers/letture/letture/updateLetturaStato.js";
import { deleteLettura } from "../controllers/letture/letture/deleteLettura.js";

const router = express.Router();


/**
 * @swagger
 * /letture/utente/libri/{id_utente}:
 *   get:
 *     tags: [Letture]
 *     summary: Tutti i libri letti da un utente
 *     parameters:
 *       - in: path
 *         name: id_utente
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lista letture di tipo libro
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Lettura' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.get("/utente/libri/:id_utente", getAllLibriByIdUser);

/**
 * @swagger
 * /letture/utente/manga/{id_utente}:
 *   get:
 *     tags: [Letture]
 *     summary: Tutti i manga letti da un utente
 *     parameters:
 *       - in: path
 *         name: id_utente
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lista letture di tipo manga
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Lettura' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.get("/utente/manga/:id_utente", getAllMangaByIdUser);

/**
 * @swagger
 * /letture/utente/riviste/{id_utente}:
 *   get:
 *     tags: [Letture]
 *     summary: Tutte le riviste lette da un utente
 *     parameters:
 *       - in: path
 *         name: id_utente
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lista letture di tipo rivista
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Lettura' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.get("/utente/riviste/:id_utente", getAllRivisteByIdUser);

/**
 * @swagger
 * /letture/utente/{id_utente}:
 *   get:
 *     tags: [Letture]
 *     summary: Tutte le letture di un utente
 *     parameters:
 *       - in: path
 *         name: id_utente
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lista completa di letture dell'utente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Lettura' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.get("/utente/:id_utente", getAllLettureByIdUser);

/**
 * @swagger
 * /letture/stats/{id_utente}:
 *   get:
 *     tags: [Letture]
 *     summary: Statistiche di lettura dell'utente
 *     parameters:
 *       - in: path
 *         name: id_utente
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Conteggi per stato, pagine totali, valutazione media, top generi/autori
 */
router.get("/stats/:id_utente", validateId("id_utente"), getLettureStats);

/**
 * @swagger
 * /letture/opera/{id_opera}/utente/{id_utente}:
 *   get:
 *     tags: [Letture]
 *     summary: Letture di un utente per una specifica opera (per "ho già letto?")
 *     parameters:
 *       - in: path
 *         name: id_opera
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: id_utente
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: "Array di letture (vuoto se nessuna)" }
 */
router.get("/opera/:id_opera/utente/:id_utente",
    validateId("id_opera"), validateId("id_utente"), getLetturaByOperaAndUser);

/**
 * @swagger
 * /letture/lettura/{id_lettura}:
 *   get:
 *     tags: [Letture]
 *     summary: Ottieni una lettura per ID
 *     parameters:
 *       - in: path
 *         name: id_lettura
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lettura
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Lettura' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.get("/lettura/:id_lettura", validateId("id_lettura"), getLetturaById);

/**
 * @swagger
 * /letture:
 *   post:
 *     tags: [Letture]
 *     summary: Crea una nuova lettura
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LetturaCreateInput' }
 *     responses:
 *       201:
 *         description: Lettura creata
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Lettura' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.post("/", validateCreateLettura, createLettura);

/**
 * @swagger
 * /letture/{id_lettura}:
 *   put:
 *     tags: [Letture]
 *     summary: Aggiorna una lettura
 *     parameters:
 *       - in: path
 *         name: id_lettura
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LetturaUpdateInput' }
 *     responses:
 *       200:
 *         description: Lettura aggiornata
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Lettura' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/ServerError' }
 *   delete:
 *     tags: [Letture]
 *     summary: Elimina una lettura
 *     parameters:
 *       - in: path
 *         name: id_lettura
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lettura eliminata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.put("/:id_lettura", validateId("id_lettura"), validateUpdateLettura, updateLetturaController);

/**
 * @swagger
 * /letture/{id_lettura}/stato:
 *   patch:
 *     tags: [Letture]
 *     summary: Cambia rapidamente lo stato di una lettura (con auto-fill date)
 *     parameters:
 *       - in: path
 *         name: id_lettura
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [stato]
 *             properties:
 *               stato:
 *                 type: string
 *                 enum: [da_iniziare, in_corso, finito, abbandonato]
 *     responses:
 *       200: { description: "Stato aggiornato (con eventuale auto-fill data_inizio/data_fine)" }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.patch("/:id_lettura/stato",
    validateId("id_lettura"), validateUpdateLetturaStato, updateLetturaStato);

router.delete("/:id_lettura", validateId("id_lettura"), deleteLettura);

export default router;
