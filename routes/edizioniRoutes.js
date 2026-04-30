import express from "express";

// Controllers
import { getEdizioneById }    from "../controllers/letture/edizioni/getEdizioneById.js";
import { getEdizioneByIsbn }  from "../controllers/letture/edizioni/getEdizioneByIsbn.js";
import { getEdizioniByOpera } from "../controllers/letture/edizioni/getEdizioniByOpera.js";
import { createEdizione }     from "../controllers/letture/edizioni/createEdizione.js";
import { updateEdizione }     from "../controllers/letture/edizioni/updateEdizione.js";
import { deleteEdizione }     from "../controllers/letture/edizioni/deleteEdizione.js";

// Validators
import { validateId } from "../middlewares/validators/idValidator.js";
import { validateCreateEdizione, validateUpdateEdizione } from "../middlewares/validators/edizioniValidator.js";

const router = express.Router();

/**
 * @swagger
 * /edizioni/opera/{id_opera}:
 *   get:
 *     tags: [Edizioni]
 *     summary: Lista edizioni di un'opera
 *     parameters:
 *       - in: path
 *         name: id_opera
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: "Lista edizioni (ordinata per anno desc)" }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.get("/opera/:id_opera", validateId("id_opera"), getEdizioniByOpera);

/**
 * @swagger
 * /edizioni/isbn/{isbn}:
 *   get:
 *     tags: [Edizioni]
 *     summary: Cerca un'edizione per ISBN (utile per scansione codice a barre)
 *     parameters:
 *       - in: path
 *         name: isbn
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: "Edizione + opera collegata" }
 *       404: { description: "Nessuna edizione con quell'ISBN" }
 */
router.get("/isbn/:isbn", getEdizioneByIsbn);

/**
 * @swagger
 * /edizioni/{id_edizione}:
 *   get:
 *     tags: [Edizioni]
 *     summary: Dettaglio edizione
 *     parameters:
 *       - in: path
 *         name: id_edizione
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: "Edizione" }
 *       404: { $ref: '#/components/responses/NotFound' }
 *   put:
 *     tags: [Edizioni]
 *     summary: Aggiorna edizione (parziale, solo i campi passati vengono toccati)
 *     parameters:
 *       - in: path
 *         name: id_edizione
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: "Edizione aggiornata" }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *   delete:
 *     tags: [Edizioni]
 *     summary: Elimina edizione
 *     parameters:
 *       - in: path
 *         name: id_edizione
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: "Edizione eliminata" }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get("/:id_edizione", validateId("id_edizione"), getEdizioneById);

/**
 * @swagger
 * /edizioni:
 *   post:
 *     tags: [Edizioni]
 *     summary: Crea una nuova edizione collegata a un'opera esistente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_opera]
 *             properties:
 *               id_opera:           { type: integer }
 *               titolo_edizione:    { type: string }
 *               isbn_issn:          { type: string }
 *               editore:            { type: string }
 *               anno_pubblicazione: { type: integer }
 *               numero_pagine:      { type: integer }
 *               copertina_url:      { type: string }
 *               google_volume_id:   { type: string }
 *               lingua:             { type: string }
 *               traduttore:         { type: string }
 *     responses:
 *       201: { description: "Edizione creata" }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { description: "Opera non trovata" }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.post("/", validateCreateEdizione, createEdizione);
router.put("/:id_edizione", validateId("id_edizione"), validateUpdateEdizione, updateEdizione);
router.delete("/:id_edizione", validateId("id_edizione"), deleteEdizione);

export default router;
