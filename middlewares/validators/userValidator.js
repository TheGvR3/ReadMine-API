import { body } from "express-validator";
import { handleValidationErrors } from "./handleValidators.js";

// 🔹 Validazione per aggiornamento profilo (solo campi opzionali)
export const validateProfileUpdate = [
    body("email")
        .optional()
        .isEmail().withMessage("Email non valida"),

    body("nome")
        .optional({ checkFalsy: true })
        .isLength({ min: 2 }).withMessage("Il nome deve contenere almeno 2 caratteri"),

    body("cognome")
        .optional({ checkFalsy: true })
        .isLength({ min: 2 }).withMessage("Il cognome deve contenere almeno 2 caratteri"),

    body("data_nascita")
        .optional({ checkFalsy: true })
        .isISO8601().withMessage("Data di nascita non valida"),

    body("indirizzo")
        .optional({ checkFalsy: true })
        .isLength({ min: 5 }).withMessage("Indirizzo troppo corto"),

    body("telefono")
        .optional({ checkFalsy: true })
        .matches(/^[0-9+\s()-]+$/).withMessage("Numero di telefono non valido"),

    handleValidationErrors,
];

// 🔹 Validazione per aggiornamento password
export const validatePasswordUpdate = [
    body("oldPassword")
        .notEmpty().withMessage("La vecchia password è obbligatoria"),

    body("newPassword")
        .notEmpty().withMessage("La nuova password è obbligatoria")
        .isLength({ min: 8 }).withMessage("La nuova password deve avere almeno 8 caratteri")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/).withMessage("La password deve contenere almeno una lettera maiuscola, una minuscola, un numero e un simbolo"),

    handleValidationErrors,
];