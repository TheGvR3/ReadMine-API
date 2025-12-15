import { body } from "express-validator";
import { handleValidationErrors } from "../validators/handleValidators.js";

export const validateCreateGenere = [
    body("nome_genere")
        .notEmpty().withMessage("Il nome del genere è obbligatorio")
        .isLength({ min: 2 }).withMessage("Il nome deve contenere almeno 2 caratteri"),
    handleValidationErrors,
];

export const validateUpdateGenere = [
    body("nome_genere")
        .notEmpty().withMessage("Il nome del genere è obbligatorio")
        .isLength({ min: 2 }).withMessage("Il nome deve contenere almeno 2 caratteri"),
    handleValidationErrors,
];
