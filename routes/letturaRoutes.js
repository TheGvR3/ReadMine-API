import express from "express";
import { auth } from "../middlewares/auth.js";
import { validateCreateLettura, validateUpdateLettura } from "../middlewares/validators/letturaValidator.js";
import { validateId } from "../middlewares/validators/idValidator.js";
import { getAllLetture, getLetturaById, createLettura, updateLettura, deleteLettura } from "../controllers/letture/lettureController.js";

const router = express.Router();

router.get("/", getAllLetture);
router.get("/:id_lettura", validateId, getLetturaById);
router.post("/", validateCreateLettura, createLettura);
router.put("/:id_lettura", validateId, validateUpdateLettura, updateLettura);
router.delete("/:id_lettura", validateId, deleteLettura);

export default router;
