import express from "express";
import { auth } from "../middlewares/auth.js";
import { searchSerie, getAllSerie, getSerieById, getSerieByName, getSerieByOpera, createSerie, updateSerie, deleteSerie } from "../controllers/letture/serieController.js";
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