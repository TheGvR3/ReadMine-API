import express from "express";
import { auth } from "../middlewares/auth.js";

// Serie Controllers
import { searchSerie } from "../controllers/letture/serie/searchSerie.js";
import { getAllSerie } from "../controllers/letture/serie/getAllSerie.js";
import { getSerieById } from "../controllers/letture/serie/getSerieById.js";
import { getSerieByName } from "../controllers/letture/serie/getSerieByName.js";
import { getSerieByOpera } from "../controllers/letture/serie/getSerieByOpera.js";
import { createSerie } from "../controllers/letture/serie/createSerie.js";
import { updateSerie } from "../controllers/letture/serie/updateSerie.js";
import { deleteSerie } from "../controllers/letture/serie/deleteSerie.js";

// Validators
import { createSerieValidator, updateSerieValidator } from "../middlewares/validators/serieValidator.js";
import { validateId } from "../middlewares/validators/idValidator.js";

const router = express.Router();

/**
 * @swagger
 * /serie/search/{nome_serie}:
 *   get:
 *     tags: [Serie]
 *     summary: Cerca serie per nome (match parziale)
 *     parameters:
 *       - in: path
 *         name: nome_serie
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista serie trovate
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Serie' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.get("/search/:nome_serie", searchSerie);

/**
 * @swagger
 * /serie:
 *   get:
 *     tags: [Serie]
 *     summary: Elenco di tutte le serie
 *     responses:
 *       200:
 *         description: Lista serie
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Serie' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/ServerError' }
 *   post:
 *     tags: [Serie]
 *     summary: Crea una nuova serie
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/SerieInput' }
 *     responses:
 *       201:
 *         description: Serie creata
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Serie' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.get("/", getAllSerie);

/**
 * @swagger
 * /serie/{id_serie}:
 *   get:
 *     tags: [Serie]
 *     summary: Ottieni serie per ID
 *     parameters:
 *       - in: path
 *         name: id_serie
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Serie
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Serie' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/ServerError' }
 *   put:
 *     tags: [Serie]
 *     summary: Aggiorna una serie
 *     parameters:
 *       - in: path
 *         name: id_serie
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/SerieInput' }
 *     responses:
 *       200:
 *         description: Serie aggiornata
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Serie' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/ServerError' }
 *   delete:
 *     tags: [Serie]
 *     summary: Elimina una serie
 *     parameters:
 *       - in: path
 *         name: id_serie
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Serie eliminata
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
router.get("/:id_serie", validateId("id_serie"), getSerieById);

/**
 * @swagger
 * /serie/nome/{nome_serie}:
 *   get:
 *     tags: [Serie]
 *     summary: Ottieni serie per nome esatto
 *     parameters:
 *       - in: path
 *         name: nome_serie
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Serie
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Serie' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.get("/nome/:nome_serie", getSerieByName);

/**
 * @swagger
 * /serie/opera/{id_opera}:
 *   get:
 *     tags: [Serie]
 *     summary: Ottieni la serie associata a un'opera
 *     parameters:
 *       - in: path
 *         name: id_opera
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Serie dell'opera
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Serie' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.get("/opera/:id_opera", validateId("id_opera"), getSerieByOpera);

router.post("/", createSerieValidator, createSerie);
router.put("/:id_serie", validateId("id_serie"), updateSerieValidator, updateSerie);
router.delete("/:id_serie", validateId("id_serie"), deleteSerie);

export default router;
