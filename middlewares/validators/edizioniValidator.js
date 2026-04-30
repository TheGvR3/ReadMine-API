// validators/edizioniValidator.js
import { body } from "express-validator";
import { handleValidationErrors } from "./handleValidators.js";

const sharedFields = [
    body("titolo_edizione").optional({ nullable: true, checkFalsy: true }).isString().trim(),
    body("isbn_issn")
        .optional({ nullable: true, checkFalsy: true })
        .isString().trim()
        .matches(/^[0-9Xx-]{10,17}$/).withMessage("ISBN/ISSN non valido"),
    body("editore").optional({ nullable: true, checkFalsy: true }).isString().trim(),
    body("anno_pubblicazione")
        .optional({ nullable: true, checkFalsy: true })
        .isInt({ min: 0, max: 2100 }).withMessage("Anno non valido"),
    body("numero_pagine")
        .optional({ nullable: true, checkFalsy: true })
        .isInt({ min: 1 }).withMessage("Numero pagine non valido"),
    body("copertina_url")
        .optional({ nullable: true, checkFalsy: true })
        .isURL().withMessage("URL copertina non valido"),
    body("google_volume_id")
        .optional({ nullable: true, checkFalsy: true })
        .isString().trim().isLength({ max: 20 }),
    body("lingua")
        .optional({ nullable: true, checkFalsy: true })
        .isString().trim().isLength({ max: 10 }),
    body("traduttore")
        .optional({ nullable: true, checkFalsy: true })
        .isString().trim().isLength({ max: 255 }),
];

export const validateCreateEdizione = [
    body("id_opera")
        .notEmpty().withMessage("id_opera obbligatorio")
        .isInt({ min: 1 }).withMessage("id_opera deve essere un ID valido"),
    ...sharedFields,
    handleValidationErrors,
];

export const validateUpdateEdizione = [
    // id_opera non è modificabile via update — se passato, errore.
    body("id_opera").not().exists().withMessage("id_opera non modificabile"),
    ...sharedFields,
    handleValidationErrors,
];
