import express from "express";
import { auth } from "../middlewares/auth.js";

// Importa i controller per i generi
import { searchGeneri} from "../controllers/letture/genere/searchGeneri.js";
import { getAllGeneri } from "../controllers/letture/genere/getAllGeneri.js";
import { getGenereById } from "../controllers/letture/genere/getGenereById.js";
import { getGenereByName } from "../controllers/letture/genere/getGenereByName.js";
import { getGeneriByOpera } from "../controllers/letture/genere/getGeneriByOpera.js";
import { createGenere } from "../controllers/letture/genere/createGenere.js";
import { updateGenere } from "../controllers/letture/genere/updateGenere.js";
import { deleteGenere } from "../controllers/letture/genere/deleteGenere.js";

// Alias (mapping nomi esterni → genere curato)
import { getAllAlias }       from "../controllers/letture/genere/alias/getAllAlias.js";
import { createGenereAlias } from "../controllers/letture/genere/alias/createGenereAlias.js";
import { deleteGenereAlias } from "../controllers/letture/genere/alias/deleteGenereAlias.js";

// Importa i validatori
import { validateCreateGenere, validateUpdateGenere } from "../middlewares/validators/genereValidator.js";
import { validateCreateGenereAlias } from "../middlewares/validators/genereAliasValidator.js";
import { validateId } from "../middlewares/validators/idValidator.js";

const router = express.Router();

/**
 * @swagger
 * /genere/search/{nome_genere}:
 *   get:
 *     tags: [Generi]
 *     summary: Cerca generi per nome (match parziale)
 *     parameters:
 *       - in: path
 *         name: nome_genere
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista generi trovati
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Genere' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.get("/search/:nome_genere", searchGeneri);

// ─── Generi alias (mapping da nomi esterni a generi curati) ───
/**
 * @swagger
 * /genere/alias:
 *   get:
 *     tags: [Generi]
 *     summary: Lista alias (paginata)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: "Alias mapping" }
 *   post:
 *     tags: [Generi]
 *     summary: Crea un mapping alias → genere
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [alias, id_genere]
 *             properties:
 *               alias:     { type: string, example: "Fiction / Historical" }
 *               id_genere: { type: integer }
 *     responses:
 *       201: { description: "Alias creato" }
 *       409: { description: "Alias già esistente" }
 *       404: { description: "Genere non trovato" }
 */
router.get("/alias", getAllAlias);
router.post("/alias", validateCreateGenereAlias, createGenereAlias);

/**
 * @swagger
 * /genere/alias/{alias}:
 *   delete:
 *     tags: [Generi]
 *     summary: Elimina un alias
 *     parameters:
 *       - in: path
 *         name: alias
 *         required: true
 *         schema: { type: string }
 *         description: URL-encoded
 */
router.delete("/alias/:alias", deleteGenereAlias);
// ─── Fine alias ───

/**
 * @swagger
 * /genere:
 *   get:
 *     tags: [Generi]
 *     summary: Elenco di tutti i generi
 *     responses:
 *       200:
 *         description: Lista generi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Genere' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/ServerError' }
 *   post:
 *     tags: [Generi]
 *     summary: Crea un nuovo genere
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/GenereInput' }
 *     responses:
 *       201:
 *         description: Genere creato
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Genere' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.get("/", getAllGeneri);

/**
 * @swagger
 * /genere/{id_genere}:
 *   get:
 *     tags: [Generi]
 *     summary: Ottieni genere per ID
 *     parameters:
 *       - in: path
 *         name: id_genere
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Genere
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Genere' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/ServerError' }
 *   put:
 *     tags: [Generi]
 *     summary: Aggiorna un genere
 *     parameters:
 *       - in: path
 *         name: id_genere
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/GenereInput' }
 *     responses:
 *       200:
 *         description: Genere aggiornato
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Genere' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/ServerError' }
 *   delete:
 *     tags: [Generi]
 *     summary: Elimina un genere
 *     parameters:
 *       - in: path
 *         name: id_genere
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Genere eliminato
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
router.get("/:id_genere", validateId("id_genere"), getGenereById);

/**
 * @swagger
 * /genere/nome/{nome_genere}:
 *   get:
 *     tags: [Generi]
 *     summary: Ottieni genere per nome esatto
 *     parameters:
 *       - in: path
 *         name: nome_genere
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Genere
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Genere' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.get("/nome/:nome_genere", getGenereByName);

/**
 * @swagger
 * /genere/opera/{id_opera}:
 *   get:
 *     tags: [Generi]
 *     summary: Ottieni generi associati a un'opera
 *     parameters:
 *       - in: path
 *         name: id_opera
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lista generi dell'opera
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Genere' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.get("/opera/:id_opera", validateId("id_opera"), getGeneriByOpera);

router.post("/", validateCreateGenere, createGenere);
router.put("/:id_genere", validateId("id_genere"), validateUpdateGenere, updateGenere);
router.delete("/:id_genere", validateId("id_genere"), deleteGenere);

export default router;
