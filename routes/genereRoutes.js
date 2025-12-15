import express from "express";
import { auth } from "../middlewares/auth.js";
import { searchGeneri, getAllGeneri, getGenereById, getGenereByName, getGeneriByOpera, createGenere, updateGenere, deleteGenere } from "../controllers/letture/genereController.js";
import { validateCreateGenere, validateUpdateGenere } from "../middlewares/validators/genereValidator.js";
import { validateId } from "../middlewares/validators/idValidator.js";

const router = express.Router();

router.get("/search/:nome_genere", searchGeneri);
router.get("/", getAllGeneri);
router.get("/:id_genere", validateId("id_genere"), getGenereById);
router.get("/nome/:nome_genere", getGenereByName);
router.get("/opera/:id_opera", validateId("id_opera"), getGeneriByOpera);
router.post("/", validateCreateGenere, createGenere);
router.put("/:id_genere", validateId("id_genere"), validateUpdateGenere, updateGenere);
router.delete("/:id_genere", validateId("id_genere"), deleteGenere);

export default router;
