import express from "express";
import { auth } from "../middlewares/auth.js";

// Controllers
import { searchOpere } from "../controllers/letture/opere/searchOpere.js";
import { getAllOpere } from "../controllers/letture/opere/getAllOpere.js";
import { getOperaById } from "../controllers/letture/opere/getOperaById.js";
import { getOperaByTitle } from "../controllers/letture/opere/getOperaByTitle.js";
import { getOpereBySerie } from "../controllers/letture/opere/getOpereBySerie.js";
import { getOpereByAutore } from "../controllers/letture/opere/getOpereByAutore.js";
import { getOpereByTipo } from "../controllers/letture/opere/getOpereByTipo.js";
import { createOpera } from "../controllers/letture/opere/createOpera.js";
import { updateOpera } from "../controllers/letture/opere/updateOpera.js";
import { deleteOpera } from "../controllers/letture/opere/deleteOpera.js";

// Validators
import { validateId } from "../middlewares/validators/idValidator.js";
import { validateCreateOpera, validateUpdateOpera } from "../middlewares/validators/opereValidator.js";


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
