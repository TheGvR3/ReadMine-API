import express from "express";
import { auth } from "../middlewares/auth.js";
import { validateCreateLettura, validateUpdateLettura } from "../middlewares/validators/letturaValidator.js";
import { validateId } from "../middlewares/validators/idValidator.js";
import { getAllLettureByIdUser } from "../controllers/letture/letture/getAllLettureByIdUser.js";
import { getLetturaById } from "../controllers/letture/letture/getLetturaById.js";
import { createLettura } from "../controllers/letture/letture/createLettura.js";
import { updateLettura as updateLetturaController } from "../controllers/letture/letture/updateLettura.js";
import { deleteLettura } from "../controllers/letture/letture/deleteLettura.js";

const router = express.Router();

router.get("/:id_utente", getAllLettureByIdUser);
router.get("/lettura/:id_lettura", validateId, getLetturaById);
router.post("/", validateCreateLettura, createLettura);
router.put("/:id_lettura", validateId, validateUpdateLettura, updateLetturaController);
router.delete("/:id_lettura", validateId, deleteLettura);

export default router;
