import express from "express";
import { auth } from "../middlewares/auth.js";

// Serie Controllers
import { searchSerie } from "../controllers/letture/serie/searchSerie.js";
import { getAllSerie } from "../controllers/letture/serie/getAllSerie.js";
import { getSerieById } from "../controllers/letture/serie/getSerieById.js";
import { getSerieByName } from "../controllers/letture/serie/getSerieByName.js";
import { getSerieByOpera } from "../controllers/letture/serie/getSerieByOpera.js";
import { createSerie } from "../controllers/letture/serie/createSerie.js";
import { updateSerie } from "../controllers/letture/serie/updateSerie.js";
import { deleteSerie } from "../controllers/letture/serie/deleteSerie.js";

// Validators
import { createSerieValidator, updateSerieValidator } from "../middlewares/validators/serieValidator.js";
import { validateId } from "../middlewares/validators/idValidator.js";

const router = express.Router();

router.get("/search/:nome_serie", searchSerie);
router.get("/", getAllSerie);
router.get("/:id_serie", validateId("id_serie"), getSerieById);
router.get("/nome/:nome_serie", getSerieByName);
router.get("/opera/:id_opera", validateId("id_opera"), getSerieByOpera);
router.post("/", createSerieValidator, createSerie);
router.put("/:id_serie", validateId("id_serie"), updateSerieValidator, updateSerie);
router.delete("/:id_serie", validateId("id_serie"), deleteSerie);

export default router;