import express from "express";
import { auth } from "../middlewares/auth.js";
import { getTipo, getTipoById } from "../controllers/letture/tipoController.js";
import { validateId } from "../middlewares/validators/idValidator.js";

const router = express.Router();

router.get("/", getTipo);
router.get("/:id_tipo", validateId("id_tipo"), getTipoById);

export default router;