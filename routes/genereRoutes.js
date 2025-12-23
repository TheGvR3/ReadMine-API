import express from "express";
import { auth } from "../middlewares/auth.js";

// Importa i controller per i generi
import { searchGeneri} from "../controllers/letture/genere/searchGeneri.js";
import { getAllGeneri } from "../controllers/letture/genere/getAllGeneri.js";
import { getGenereById } from "../controllers/letture/genere/getGenereById.js";
import { getGenereByName } from "../controllers/letture/genere/getGenereByName.js";
import { getGeneriByOpera } from "../controllers/letture/genere/getGeneriByOpera.js";
import { createGenere } from "../controllers/letture/genere/createGenere.js";
import { updateGenere } from "../controllers/letture/genere/updateGenere.js";
import { deleteGenere } from "../controllers/letture/genere/deleteGenere.js";

// Importa i validatori
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
