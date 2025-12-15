import express from "express";
import { auth } from "../middlewares/auth.js";
import { searchAutori, getAllAutori, getAutoreById, getAutoreByName, getAutoriByOpera, createAutore, updateAutore, deleteAutore } from "../controllers/letture/autoriController.js";
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
