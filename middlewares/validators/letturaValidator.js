import { body, param } from "express-validator";
import { handleValidationErrors } from "./handleValidators.js";

export const validateCreateLettura = [
    body("id_utente") // Uniformato al DB
        .notEmpty().withMessage("L'id dell'utente è obbligatorio")
        .isInt({ min: 1 }).withMessage("L'id utente deve essere un numero intero valido"),

    body("id_opera")
        .notEmpty().withMessage("L'id dell'opera è obbligatorio")
        .isInt({ min: 1 }).withMessage("L'id opera deve essere un numero intero valido"),

    body("data_lettura")
        .optional({ checkFalsy: true }) // Gestisce meglio stringhe vuote
        .isISO8601().withMessage("La data deve essere in formato YYYY-MM-DD"),

    body("volume")
        .optional({ checkFalsy: true })
        .isInt({ min: 0 }).withMessage("Il volume deve essere un numero intero positivo"),

    body("capitolo")
        .optional({ checkFalsy: true })
        .isInt({ min: 0 }).withMessage("Il capitolo deve essere un numero intero positivo"),

    body("pagina")
        .optional({ checkFalsy: true })
        .isInt({ min: 0 }).withMessage("La pagina deve essere un numero intero positivo"),

    body("stato")
        .optional()
        .isIn(["da_iniziare", "in_corso", "finito"])
        .withMessage("Stato non valido"),

    // Aggiungiamo la valutazione (CHECK 1-5 nel DB)
    body("valutazione")
        .optional({ checkFalsy: true })
        .isInt({ min: 1, max: 5 }).withMessage("La valutazione deve essere compresa tra 1 e 5"),

    body("note")
        .optional({ checkFalsy: true })
        .isString().withMessage("Le note devono essere un testo")
        .trim(),

    handleValidationErrors,
];

export const validateUpdateLettura = [
    param("id_lettura")
        .notEmpty().withMessage("L'id della lettura è obbligatorio")
        .isInt({ min: 1 }).withMessage("L'id lettura deve essere un numero intero valido"),

    body("data_lettura")
        .optional({ checkFalsy: true })
        .isISO8601().withMessage("La data deve essere in formato YYYY-MM-DD"),

    body("volume")
        .optional({ checkFalsy: true })
        .isInt({ min: 0 }).withMessage("Il volume deve essere un numero intero positivo"),

    body("capitolo")
        .optional({ checkFalsy: true })
        .isInt({ min: 0 }).withMessage("Il capitolo deve essere un numero intero positivo"),

    body("pagina")
        .optional({ checkFalsy: true })
        .isInt({ min: 0 }).withMessage("La pagina deve essere un numero intero positivo"),

    body("stato")
        .optional()
        .isIn(["da_iniziare", "in_corso", "finito"])
        .withMessage("Stato non valido"),

    // Aggiunti per coerenza con la nuova tabella
    body("valutazione")
        .optional({ checkFalsy: true })
        .isInt({ min: 1, max: 5 }).withMessage("La valutazione deve essere tra 1 e 5"),

    body("note")
        .optional({ checkFalsy: true })
        .isString()
        .trim(),

    handleValidationErrors,
];