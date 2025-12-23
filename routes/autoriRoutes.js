import express from "express";
import { auth } from "../middlewares/auth.js";

// Importa i controller
import { searchAutori } from "../controllers/letture/autori/searchAutori.js";
import { getAllAutori } from "../controllers/letture/autori/getAllAutori.js";
import {getAutoreById} from "../controllers/letture/autori/getAutoreById.js";
import { getAutoreByName } from "../controllers/letture/autori/getAutoreByName.js";
import { getAutoriByOpera } from "../controllers/letture/autori/getAutoriByOpera.js";
import { createAutore } from "../controllers/letture/autori/createAutore.js";
import { updateAutore } from "../controllers/letture/autori/updateAutore.js";
import { deleteAutore } from "../controllers/letture/autori/deleteAutore.js";

// Importa i validatori
import { validateCreateAutore, validateUpdateAutore } from "../middlewares/validators/autoriValidator.js";
import { validateId } from "../middlewares/validators/idValidator.js";

const router = express.Router();

router.get("/search/:nome_autore", searchAutori);
router.get("/", getAllAutori);
router.get("/:id_autore", validateId("id_autore"), getAutoreById);
router.get("/nome/:nome_autore", getAutoreByName);
router.get("/opera/:id_opera", validateId("id_opera"), getAutoriByOpera);
router.post("/", validateCreateAutore, createAutore);
router.put("/:id_autore", validateId("id_autore"), validateUpdateAutore, updateAutore);
router.delete("/:id_autore", validateId("id_autore"), deleteAutore);

export default router;
