import express from "express";
import { auth } from "../middlewares/auth.js";
import { getTipo } from "../controllers/letture/tipo/getTipo.js";
import { getTipoById } from "../controllers/letture/tipo/getTipoById.js";
import { validateId } from "../middlewares/validators/idValidator.js";

const router = express.Router();

/**
 * @swagger
 * /tipo:
 *   get:
 *     tags: [Tipi]
 *     summary: Elenco di tutti i tipi di opera
 *     responses:
 *       200:
 *         description: Lista tipi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Tipo' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.get("/", getTipo);

/**
 * @swagger
 * /tipo/{id_tipo}:
 *   get:
 *     tags: [Tipi]
 *     summary: Ottieni tipo per ID
 *     parameters:
 *       - in: path
 *         name: id_tipo
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Tipo
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Tipo' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/ServerError' }
 */
router.get("/:id_tipo", validateId("id_tipo"), getTipoById);

export default router;
