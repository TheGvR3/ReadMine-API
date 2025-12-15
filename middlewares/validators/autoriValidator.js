// validators/autoriValidator.js
import { body } from "express-validator";
import { handleValidationErrors } from "../validators/handleValidators.js";

export const validateCreateAutore = [
    body("nome_autore")
        .notEmpty().withMessage("Il nome dell'autore è obbligatorio")
        .isLength({ min: 2 }).withMessage("Il nome deve contenere almeno 2 caratteri"),
    handleValidationErrors,
];

export const validateUpdateAutore = [
    body("nome_autore")
        .notEmpty().withMessage("Il nome dell'autore è obbligatorio")
        .isLength({ min: 2 }).withMessage("Il nome deve contenere almeno 2 caratteri"),
    handleValidationErrors,
];
