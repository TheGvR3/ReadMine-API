import express from "express";
import { auth } from "../middlewares/auth.js";
// Importa i validatori
import { validateCreateLettura, validateUpdateLettura } from "../middlewares/validators/letturaValidator.js";
import { validateId } from "../middlewares/validators/idValidator.js";
// Importa i controller
//get
import { getAllLettureByIdUser } from "../controllers/letture/letture/getAllLettureByIdUser.js";
import { getAllLibriByIdUser } from "../controllers/letture/letture/getAllLibribyUser.js";
import { getAllMangaByIdUser } from "../controllers/letture/letture/getAllMangaByUser.js";
import { getAllRivisteByIdUser } from "../controllers/letture/letture/getAllRivisteByUser.js";
import { getLetturaById } from "../controllers/letture/letture/getLetturaById.js";
//post, put, delete
import { createLettura } from "../controllers/letture/letture/createLettura.js";
import { updateLettura as updateLetturaController } from "../controllers/letture/letture/updateLettura.js";
import { deleteLettura } from "../controllers/letture/letture/deleteLettura.js";

const router = express.Router();


router.get("/utente/libri/:id_utente", getAllLibriByIdUser);
router.get("/utente/manga/:id_utente", getAllMangaByIdUser);
router.get("/utente/riviste/:id_utente", getAllRivisteByIdUser);
router.get("/utente/:id_utente", getAllLettureByIdUser);
router.get("/lettura/:id_lettura", validateId("id_lettura"), getLetturaById);
router.post("/", validateCreateLettura, createLettura);
router.put("/:id_lettura", validateId("id_lettura"), validateUpdateLettura, updateLetturaController);
router.delete("/:id_lettura", validateId("id_lettura"), deleteLettura);

export default router;
