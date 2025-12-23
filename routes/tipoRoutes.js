import express from "express";
import { auth } from "../middlewares/auth.js";
import { getTipo } from "../controllers/letture/tipo/getTipo.js";
import { getTipoById } from "../controllers/letture/tipo/getTipoById.js";
import { validateId } from "../middlewares/validators/idValidator.js";

const router = express.Router();

router.get("/", getTipo);
router.get("/:id_tipo", validateId("id_tipo"), getTipoById);

export default router;