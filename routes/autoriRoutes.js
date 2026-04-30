import express from "express";
import { auth } from "../middlewares/auth.js";

// Importa i controller
import { searchAutori } from "../controllers/letture/autori/searchAutori.js";
import { getAllAutori } from "../controllers/letture/autori/getAllAutori.js";
import {getAutoreById} from "../controllers/letture/autori/getAutoreById.js";
import { getAutoreByName } from "../controllers/letture/autori/getAutoreByName.js";
import { getAutoriByOpera } from "../controllers/letture/autori/getAutoriByOpera.js";
import { createAutore } from "../controllers/letture/autori/createAutore.js";
import { updateAutore } from "../controllers/letture/autori/updateAutore.js";
import { deleteAutore } from "../controllers/letture/autori/deleteAutore.js";

// Importa i validatori
import { validateCreateAutore, validateUpdateAutore } from "../middlewares/validators/autoriValidator.js";
import { validateId } from "../middlewares/validators/idValidator.js";

const router = express.Router();

/**
 * @swagger
 * /autori/search/{nome_autore}:
 *   get:
 *     tags: [Autori]
 *     summary: Cerca autori per nome (match parziale)
 *     parameters:
 *       - in: path
 *         name: nome_autore
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista autori trovati
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Autore' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.get("/search/:nome_autore", searchAutori);

/**
 * @swagger
 * /autori:
 *   get:
 *     tags: [Autori]
 *     summary: Elenco di tutti gli autori
 *     responses:
 *       200:
 *         description: Lista autori
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Autore' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/ServerError' }
 *   post:
 *     tags: [Autori]
 *     summary: Crea un nuovo autore
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/AutoreInput' }
 *     responses:
 *       201:
 *         description: Autore creato
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Autore' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.get("/", getAllAutori);

/**
 * @swagger
 * /autori/{id_autore}:
 *   get:
 *     tags: [Autori]
 *     summary: Ottieni autore per ID
 *     parameters:
 *       - in: path
 *         name: id_autore
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Autore
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Autore' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/ServerError' }
 *   put:
 *     tags: [Autori]
 *     summary: Aggiorna un autore
 *     parameters:
 *       - in: path
 *         name: id_autore
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/AutoreInput' }
 *     responses:
 *       200:
 *         description: Autore aggiornato
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Autore' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/ServerError' }
 *   delete:
 *     tags: [Autori]
 *     summary: Elimina un autore
 *     parameters:
 *       - in: path
 *         name: id_autore
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Autore eliminato
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
router.get("/:id_autore", validateId("id_autore"), getAutoreById);

/**
 * @swagger
 * /autori/nome/{nome_autore}:
 *   get:
 *     tags: [Autori]
 *     summary: Ottieni autore per nome esatto
 *     parameters:
 *       - in: path
 *         name: nome_autore
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Autore
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Autore' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.get("/nome/:nome_autore", getAutoreByName);

/**
 * @swagger
 * /autori/opera/{id_opera}:
 *   get:
 *     tags: [Autori]
 *     summary: Ottieni autori associati a un'opera
 *     parameters:
 *       - in: path
 *         name: id_opera
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lista autori dell'opera
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Autore' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.get("/opera/:id_opera", validateId("id_opera"), getAutoriByOpera);

router.post("/", validateCreateAutore, createAutore);
router.put("/:id_autore", validateId("id_autore"), validateUpdateAutore, updateAutore);
router.delete("/:id_autore", validateId("id_autore"), deleteAutore);

export default router;
