// validators/opereValidator.js
import { body } from "express-validator";
import { handleValidationErrors } from "./handleValidators.js";

// Post-migration 003: opere contiene SOLO campi opera-level.
// I campi edizione (anno, editore, isbn, ecc.) sono validati da edizioniValidator.
const operaValidationRules = () => [
    body("titolo")
        .notEmpty().withMessage("Il titolo dell'opera è obbligatorio")
        .isLength({ min: 2 }).withMessage("Il titolo deve contenere almeno 2 caratteri"),
    body("tipo_opera")
        .notEmpty().withMessage("Il tipo è obbligatorio")
        .isInt({ min: 1 }).withMessage("Tipo deve essere un ID valido"),
    body("stato_opera")
        .optional()
        .isIn(["finito", "in_corso"]).withMessage("Stato opera non valido"),
    body("id_serie")
        .optional({ nullable: true, checkFalsy: true })
        .isInt({ min: 1 }).withMessage("Serie deve essere un ID valido"),
    body("numero_volume")
        .optional({ nullable: true, checkFalsy: true })
        .isInt({ min: 1 }).withMessage("Numero volume non valido"),
    body("lingua_originale")
        .optional({ nullable: true, checkFalsy: true })
        .isString().trim(),
    body("descrizione_opera")
        .optional({ nullable: true, checkFalsy: true })
        .isString().trim(),
    body("autori").optional().isArray().withMessage("autori deve essere un array di ID"),
    body("autori.*").optional().isInt({ min: 1 }),
    body("generi").optional().isArray().withMessage("generi deve essere un array di ID"),
    body("generi.*").optional().isInt({ min: 1 }),
    handleValidationErrors,
];

export const validateCreateOpera = [...operaValidationRules()];
export const validateUpdateOpera = [...operaValidationRules()];
