import express from "express";
import { auth } from "../middlewares/auth.js";
import { validateId } from "../middlewares/validators/idValidator.js";
import { validateCreateOpera, validateUpdateOpera } from "../middlewares/validators/opereValidator.js";
import { searchOpere, getAllOpere, getOperaById, getOperaByTitle, createOpera, updateOpera, deleteOpera, getOpereBySerie, getOpereByAutore, getOpereByTipo } from "../controllers/letture/opereController.js";

const router = express.Router();

router.get("/search/:titolo", searchOpere);
router.get("/", getAllOpere);
router.get("/:id_opera", validateId("id_opera"), getOperaById);
router.get("/nome/:titolo", getOperaByTitle);
router.get("/autore/:id_autore", validateId("id_autore"), getOpereByAutore);
router.get("/tipo/:id_tipo", validateId("id_tipo"), getOpereByTipo);
router.get("/serie/:id_serie", validateId("id_serie"), getOpereBySerie);
router.post("/", validateCreateOpera, createOpera);
router.put("/:id_opera", validateId("id_opera"), validateUpdateOpera, updateOpera);
router.delete("/:id_opera", validateId("id_opera"), deleteOpera);

export default router;
