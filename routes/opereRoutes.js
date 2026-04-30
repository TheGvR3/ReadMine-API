import express from "express";
import { auth } from "../middlewares/auth.js";

// Controllers
import { searchOpere } from "../controllers/letture/opere/searchOpere.js";
import { searchOpereAdvanced } from "../controllers/letture/opere/searchOpereAdvanced.js";
import { getAllOpere } from "../controllers/letture/opere/getAllOpere.js";
import { getOperaById } from "../controllers/letture/opere/getOperaById.js";
import { getOperaFull } from "../controllers/letture/opere/getOperaFull.js";
import { getOperaByTitle } from "../controllers/letture/opere/getOperaByTitle.js";
import { getOpereBySerie } from "../controllers/letture/opere/getOpereBySerie.js";
import { getOpereByAutore } from "../controllers/letture/opere/getOpereByAutore.js";
import { getOpereByGenere } from "../controllers/letture/opere/getOperaByGenere.js";
import { getOpereByTipo } from "../controllers/letture/opere/getOpereByTipo.js";
import { createOpera } from "../controllers/letture/opere/createOpera.js";
import { updateOpera } from "../controllers/letture/opere/updateOpera.js";
import { deleteOpera } from "../controllers/letture/opere/deleteOpera.js";

// Validators
import { validateId } from "../middlewares/validators/idValidator.js";
import { validateCreateOpera, validateUpdateOpera } from "../middlewares/validators/opereValidator.js";


const router = express.Router();

/**
 * @swagger
 * /opere/search/{titolo}:
 *   get:
 *     tags: [Opere]
 *     summary: Cerca opere per titolo (match parziale)
 *     parameters:
 *       - in: path
 *         name: titolo
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista opere trovate
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Opera' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
/**
 * @swagger
 * /opere/search:
 *   get:
 *     tags: [Opere]
 *     summary: Ricerca avanzata opere (paginata, filtri combinabili)
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Match su titolo (ILIKE)
 *       - in: query
 *         name: autore
 *         schema: { type: integer }
 *       - in: query
 *         name: genere
 *         schema: { type: integer }
 *       - in: query
 *         name: tipo
 *         schema: { type: integer }
 *       - in: query
 *         name: serie
 *         schema: { type: integer }
 *       - in: query
 *         name: stato
 *         schema: { type: string, enum: [in_corso, finito] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [titolo, anno, recenti], default: titolo }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc], default: asc }
 *     responses:
 *       200: { description: "Risultati paginati { data, total, page, limit, totalPages }" }
 */
router.get("/search", searchOpereAdvanced);

// (deprecato) ricerca legacy con titolo come path param
router.get("/search/:titolo", searchOpere);

/**
 * @swagger
 * /opere:
 *   get:
 *     tags: [Opere]
 *     summary: Elenco di tutte le opere
 *     responses:
 *       200:
 *         description: Lista opere
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Opera' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/ServerError' }
 *   post:
 *     tags: [Opere]
 *     summary: Crea una nuova opera
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/OperaInput' }
 *     responses:
 *       201:
 *         description: Opera creata
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Opera' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.get("/", getAllOpere);

/**
 * @swagger
 * /opere/{id_opera}:
 *   get:
 *     tags: [Opere]
 *     summary: Ottieni opera per ID
 *     parameters:
 *       - in: path
 *         name: id_opera
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Opera
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Opera' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/ServerError' }
 *   put:
 *     tags: [Opere]
 *     summary: Aggiorna un'opera
 *     parameters:
 *       - in: path
 *         name: id_opera
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/OperaInput' }
 *     responses:
 *       200:
 *         description: Opera aggiornata
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Opera' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/ServerError' }
 *   delete:
 *     tags: [Opere]
 *     summary: Elimina un'opera
 *     parameters:
 *       - in: path
 *         name: id_opera
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Opera eliminata
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
/**
 * @swagger
 * /opere/{id_opera}/full:
 *   get:
 *     tags: [Opere]
 *     summary: Opera con autori/generi/tipo/serie aggregati + lista completa edizioni
 *     parameters:
 *       - in: path
 *         name: id_opera
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: "Opera con embedded edizioni (per pagina dettaglio)" }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get("/:id_opera/full", validateId("id_opera"), getOperaFull);

router.get("/:id_opera", validateId("id_opera"), getOperaById);

/**
 * @swagger
 * /opere/nome/{titolo}:
 *   get:
 *     tags: [Opere]
 *     summary: Ottieni opera per titolo esatto
 *     parameters:
 *       - in: path
 *         name: titolo
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Opera
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Opera' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.get("/nome/:titolo", getOperaByTitle);

/**
 * @swagger
 * /opere/autore/{id_autore}:
 *   get:
 *     tags: [Opere]
 *     summary: Ottieni opere per autore
 *     parameters:
 *       - in: path
 *         name: id_autore
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lista opere dell'autore
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Opera' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.get("/autore/:id_autore", validateId("id_autore"), getOpereByAutore);

/**
 * @swagger
 * /opere/genere/{id_genere}:
 *   get:
 *     tags: [Opere]
 *     summary: Ottieni opere per genere
 *     parameters:
 *       - in: path
 *         name: id_genere
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lista opere del genere
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Opera' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.get("/genere/:id_genere", validateId("id_genere"), getOpereByGenere);

/**
 * @swagger
 * /opere/tipo/{id_tipo}:
 *   get:
 *     tags: [Opere]
 *     summary: Ottieni opere per tipo
 *     parameters:
 *       - in: path
 *         name: id_tipo
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lista opere del tipo
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Opera' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.get("/tipo/:id_tipo", validateId("id_tipo"), getOpereByTipo);

/**
 * @swagger
 * /opere/serie/{id_serie}:
 *   get:
 *     tags: [Opere]
 *     summary: Ottieni opere per serie
 *     parameters:
 *       - in: path
 *         name: id_serie
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lista opere della serie
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Opera' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.get("/serie/:id_serie", validateId("id_serie"), getOpereBySerie);

router.post("/", validateCreateOpera, createOpera);
router.put("/:id_opera", validateId("id_opera"), validateUpdateOpera, updateOpera);
router.delete("/:id_opera", validateId("id_opera"), deleteOpera);

export default router;
