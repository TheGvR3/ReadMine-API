// validators/serieValidator.js
import { body } from "express-validator";
import { handleValidationErrors } from "../validators/handleValidators.js";

export const createSerieValidator = [
    body("nome_serie")
        .notEmpty().withMessage("Il nome della serie è obbligatorio")
        .isLength({ max: 100 }).withMessage("Il nome della serie non può superare i 100 caratteri"),
    handleValidationErrors
];

export const updateSerieValidator = [
    body("nome_serie")
        .notEmpty().withMessage("Il nome della serie è obbligatorio")
        .isLength({ max: 100 }).withMessage("Il nome della serie non può superare i 100 caratteri"),
    handleValidationErrors
];