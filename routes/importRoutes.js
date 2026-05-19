import express from "express";

import {
    searchGoogleBooks,
    previewGoogleVolume,
    importGoogleVolume,
    importGoogleBulk,
} from "../controllers/import/google_import.js";

import {
    validateGoogleSearch,
    validateGooglePreview,
    validateGoogleImport,
    validateGoogleImportBulk,
} from "../middlewares/validators/importValidator.js";

const router = express.Router();

/**
 * @swagger
 * /import/google/search:
 *   get:
 *     tags: [Import]
 *     summary: Cerca libri su Google Books (no scrittura DB)
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: isbn
 *         schema: { type: string }
 *       - in: query
 *         name: maxResults
 *         schema: { type: integer, minimum: 1, maximum: 40, default: 10 }
 *     responses:
 *       200:
 *         description: |
 *           Lista candidati. Ogni risultato include:
 *             - alreadyImported (id_edizione + id_opera) se l'edizione esiste già
 *             - serie_parsata (nome + numero) estratta dal titolo, se rilevata
 */
router.get("/google/search", validateGoogleSearch, searchGoogleBooks);

/**
 * @swagger
 * /import/google/preview/{volumeId}:
 *   get:
 *     tags: [Import]
 *     summary: Preview ricca di un volume con tutti gli auto-match già risolti
 *     description: |
 *       Restituisce dettagli volume + risoluzioni:
 *         - autori esistenti (match esatto su nome_autore)
 *         - generi via alias o exact match, con azione_default proposta
 *         - serie parsata dal titolo, con eventuale match su serie esistenti
 *         - tipo_opera inferito da printType
 *         - lookup pronti per UI (generi curati, tipi, opere col titolo simile)
 *     parameters:
 *       - in: path
 *         name: volumeId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: "Preview ricca" }
 *       404: { description: "Volume non trovato su Google Books" }
 *       422: { description: "Volume senza titolo" }
 */
router.get("/google/preview/:volumeId", validateGooglePreview, previewGoogleVolume);

/**
 * @swagger
 * /import/google/import:
 *   post:
 *     tags: [Import]
 *     summary: Import atomico di un volume con scelte dell'admin
 *     description: |
 *       Body "ricco" — l'admin ha già fatto le scelte sul preview:
 *         autori   = [{id_autore} | {nome_autore}]
 *         generi   = [{azione: alias|esistente|curato|importato|ignora, ...}]
 *         id_opera = se valorizzato, salta opera e crea solo edizione
 *       Tutto in transazione PL/pgSQL: rollback automatico se qualcosa fallisce.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [volumeId]
 *             properties:
 *               volumeId:           { type: string }
 *               id_opera:           { type: integer, description: "Se presente: solo edizione" }
 *               tipo_opera:         { type: integer }
 *               id_serie:           { type: integer }
 *               numero_volume_edizione: { type: integer, description: "Numero del volume della pubblicazione fisica (manga/serie)" }
 *               titolo:             { type: string }
 *               descrizione_opera:  { type: string }
 *               lingua_originale:   { type: string }
 *               traduttore:         { type: string }
 *               autori:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id_autore:   { type: integer }
 *                     nome_autore: { type: string }
 *               generi:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     azione:      { type: string, enum: [alias, esistente, curato, importato, ignora] }
 *                     google_name: { type: string }
 *                     id_genere:   { type: integer }
 *     responses:
 *       201: { description: "Opera + edizione importate" }
 *       200: { description: "Edizione già presente (duplicate=true)" }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { description: "Volume Google non trovato (o opera esistente non trovata)" }
 *       422: { description: "Dati insufficienti" }
 */
router.post("/google/import", validateGoogleImport, importGoogleVolume);

/**
 * @swagger
 * /import/google/import-bulk:
 *   post:
 *     tags: [Import]
 *     summary: Import multiplo (max 50 item per chiamata)
 *     description: |
 *       Esegue gli import in serie. Strategia "continua e segnala": se un item
 *       fallisce, viene messo in errors[] e prosegue con i successivi.
 *       Idempotenza: gli item già presenti tornano in successes[] con duplicate=true.
 *       Risposta: { total, successCount, errorCount, successes, errors }.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items]
 *             properties:
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 maxItems: 50
 *                 items:
 *                   type: object
 *                   required: [volumeId]
 *                   properties:
 *                     volumeId:                { type: string }
 *                     id_opera:                { type: integer }
 *                     tipo_opera:              { type: integer }
 *                     id_serie:                { type: integer }
 *                     numero_volume_edizione:  { type: integer }
 *                     traduttore:              { type: string }
 *                     complete_empty_fields:   { type: boolean }
 *                     autori:                  { type: array }
 *                     generi:                  { type: array }
 *     responses:
 *       200: { description: "Risultato bulk con esiti per ogni item" }
 *       400: { $ref: '#/components/responses/ValidationError' }
 */
router.post("/google/import-bulk", validateGoogleImportBulk, importGoogleBulk);

export default router;
