import { body } from "express-validator";
import { handleValidationErrors } from "./handleValidators.js";

export const validateCreateGenereAlias = [
    body("alias")
        .notEmpty().withMessage("alias obbligatorio")
        .isString().trim()
        .isLength({ min: 1, max: 200 }).withMessage("alias deve essere 1..200 caratteri"),
    body("id_genere")
        .notEmpty().withMessage("id_genere obbligatorio")
        .isInt({ min: 1 }).withMessage("id_genere non valido"),
    handleValidationErrors,
];
