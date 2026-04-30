// validators/importValidator.js
import { body, query, param } from "express-validator";
import { handleValidationErrors } from "./handleValidators.js";

export const validateGoogleSearch = [
    query("q").optional().isString().trim().isLength({ min: 1 }).withMessage("'q' non può essere vuoto"),
    query("isbn").optional().isString().trim().matches(/^[0-9Xx-]{10,17}$/).withMessage("ISBN non valido"),
    query("maxResults").optional().isInt({ min: 1, max: 40 }).withMessage("maxResults deve essere 1..40"),
    query("startIndex").optional().isInt({ min: 0 }).withMessage("startIndex deve essere >= 0"),
    (req, res, next) => {
        if (!req.query.q && !req.query.isbn) {
            return res.status(400).json({ errors: [{ msg: "Specificare 'q' o 'isbn'" }] });
        }
        next();
    },
    handleValidationErrors,
];

export const validateGooglePreview = [
    param("volumeId").notEmpty().isString().trim(),
    handleValidationErrors,
];

// Regole condivise tra import singolo e bulk (un singolo "item")
const importItemRules = (prefix = "") => [
    body(`${prefix}volumeId`).notEmpty().withMessage("volumeId obbligatorio").isString().trim(),
    body(`${prefix}id_opera`).optional({ nullable: true, checkFalsy: true }).isInt({ min: 1 }),
    body(`${prefix}tipo_opera`).optional({ nullable: true, checkFalsy: true }).isInt({ min: 1 }),
    body(`${prefix}id_serie`).optional({ nullable: true, checkFalsy: true }).isInt({ min: 1 }),
    body(`${prefix}numero_volume_opera`).optional({ nullable: true, checkFalsy: true }).isInt({ min: 1 }),
    body(`${prefix}numero_volume_edizione`).optional({ nullable: true, checkFalsy: true }).isInt({ min: 1 }),
    body(`${prefix}titolo`).optional({ nullable: true }).isString().trim(),
    body(`${prefix}descrizione_opera`).optional({ nullable: true }).isString().trim(),
    body(`${prefix}lingua_originale`).optional({ nullable: true, checkFalsy: true }).isString().trim().isLength({ max: 10 }),
    body(`${prefix}traduttore`).optional({ nullable: true, checkFalsy: true }).isString().trim().isLength({ max: 255 }),
    body(`${prefix}complete_empty_fields`).optional().isBoolean(),
    body(`${prefix}autori`).optional().isArray(),
    body(`${prefix}generi`).optional().isArray(),
];

export const validateGoogleImport = [
    ...importItemRules(""),
    body("autori.*").optional().custom((a) => {
        if (!a || typeof a !== "object") throw new Error("autore deve essere oggetto");
        const hasId = Number.isInteger(a.id_autore) && a.id_autore > 0;
        const hasName = typeof a.nome_autore === "string" && a.nome_autore.trim().length > 0;
        if (!hasId && !hasName) throw new Error("autore deve avere id_autore o nome_autore");
        return true;
    }),
    body("generi.*.azione").optional().isIn(["alias", "esistente", "curato", "importato", "ignora"]),
    body("generi.*.google_name").optional({ nullable: true }).isString(),
    body("generi.*.id_genere").optional({ nullable: true, checkFalsy: true }).isInt({ min: 1 }),
    handleValidationErrors,
];

export const validateGoogleImportBulk = [
    body("items").isArray({ min: 1, max: 50 }).withMessage("items deve essere un array di 1..50 elementi"),
    body("items.*.volumeId").notEmpty().withMessage("volumeId obbligatorio in ogni item").isString(),
    body("items.*.id_opera").optional({ nullable: true, checkFalsy: true }).isInt({ min: 1 }),
    body("items.*.tipo_opera").optional({ nullable: true, checkFalsy: true }).isInt({ min: 1 }),
    body("items.*.id_serie").optional({ nullable: true, checkFalsy: true }).isInt({ min: 1 }),
    body("items.*.numero_volume_edizione").optional({ nullable: true, checkFalsy: true }).isInt({ min: 1 }),
    body("items.*.complete_empty_fields").optional().isBoolean(),
    body("items.*.autori").optional().isArray(),
    body("items.*.generi").optional().isArray(),
    handleValidationErrors,
];
