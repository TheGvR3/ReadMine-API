// validators/opereValidator.js
import { body } from "express-validator";
import { handleValidationErrors } from "./handleValidators.js";

// Funzione helper per validazione comune
const operaValidationRules = () => [
    body("titolo")
        .notEmpty().withMessage("Il titolo dell'opera è obbligatorio")
        .isLength({ min: 2 }).withMessage("Il titolo deve contenere almeno 2 caratteri"),
    body("anno_pubblicazione")
        .notEmpty().withMessage("L'anno di pubblicazione è obbligatorio")
        .isInt({ min: 0 }).withMessage("L'anno non è valido"),
    body("tipo_opera")
        .notEmpty().withMessage("La tipo è obbligatori")
        .isInt({ min: 1 }).withMessage("La Tipo deve essere un ID valido"),
    body("stato_opera")
        .optional()
        .isIn(["finito", "in corso"]).withMessage("Stato opera non valido"),
    body("id_serie")
        .optional({ nullable: true, checkFalsy: true })
        .isInt({ min: 1 }).withMessage("Serie deve essere un ID valido"),
    body("editore")
        .optional({ nullable: true, checkFalsy: true })
        .isString().trim(),
    body("lingua_originale")
        .optional({ nullable: true, checkFalsy: true })
        .isString().trim(),
    handleValidationErrors,
];

// Validator per la creazione di un'opera
export const validateCreateOpera = [
    ...operaValidationRules(),
];

// Validator per l'aggiornamento di un'opera
export const validateUpdateOpera = [
    ...operaValidationRules(),
];
