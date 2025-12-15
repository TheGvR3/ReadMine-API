import { body } from "express-validator";
import { handleValidationErrors } from "./handleValidators.js";



// 🔹 Validazione per la registrazione
export const validateRegister = [
  body("email")
    .notEmpty().withMessage("L'email è obbligatoria")
    .isEmail().withMessage("Inserisci un'email valida"),

  body("password")
    .notEmpty().withMessage("La password è obbligatoria")
    .isLength({ min: 8 }).withMessage("La password deve avere almeno 8 caratteri")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/).withMessage("La password deve contenere almeno una lettera maiuscola, una minuscola, un numero e un simbolo"),

  body("nome")
    .optional({ checkFalsy: true })
    .isLength({ min: 2 }).withMessage("Il nome deve contenere almeno 2 caratteri"),

  body("cognome")
    .optional({ checkFalsy: true })
    .isLength({ min: 2 }).withMessage("Il cognome deve contenere almeno 2 caratteri"),

  body("data_nascita")
    .optional({ checkFalsy: true })
    .isISO8601().withMessage("La data di nascita deve essere in formato YYYY-MM-DD"),

  body("indirizzo")
    .optional({ checkFalsy: true })
    .isLength({ min: 5 }).withMessage("L'indirizzo deve contenere almeno 5 caratteri"),

  body("telefono")
    .optional({ checkFalsy: true })
    .matches(/^[0-9+\s()-]+$/).withMessage("Il numero di telefono non è valido"),

  handleValidationErrors,
];

// 🔹 Validazione per il login (può usare email o codice fiscale)
export const validateLogin = [
  body("identifier")
    .notEmpty().withMessage("L'identificatore (email) è obbligatorio"),

  body("password")
    .notEmpty().withMessage("La password è obbligatoria"),

  handleValidationErrors,
];
