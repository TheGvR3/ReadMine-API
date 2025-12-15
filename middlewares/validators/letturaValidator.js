import { body, param } from "express-validator";
import { handleValidationErrors } from "./handleValidators.js";

export const validateCreateLettura = [
    body("id_user")
        .notEmpty().withMessage("L'id dell'utente è obbligatorio")
        .isInt({ min: 1 }).withMessage("L'id utente deve essere un numero intero valido"),

    body("id_opera")
        .notEmpty().withMessage("L'id dell'opera è obbligatorio")
        .isInt({ min: 1 }).withMessage("L'id opera deve essere un numero intero valido"),

    body("data_lettura")
        .optional({ nullable: true })
        .isISO8601().withMessage("La data di lettura deve essere in formato valido (YYYY-MM-DD)"),

    body("volume")
        .optional({ nullable: true })
        .isInt({ min: 0 }).withMessage("Il volume deve essere un numero intero positivo"),

    body("capitolo")
        .optional({ nullable: true })
        .isInt({ min: 0 }).withMessage("Il capitolo deve essere un numero intero positivo"),

    body("pagina")
        .optional({ nullable: true })
        .isInt({ min: 0 }).withMessage("La pagina deve essere un numero intero positivo"),

    body("stato")
        .optional()
        .isIn(["da_iniziare", "in_corso", "finito"])
        .withMessage("Lo stato deve essere uno tra: 'da_iniziare', 'in_corso', 'finito'"),
    handleValidationErrors,
];

export const validateUpdateLettura = [
    param("id_lettura")
        .notEmpty().withMessage("L'id della lettura è obbligatorio")
        .isInt({ min: 1 }).withMessage("L'id lettura deve essere un numero intero valido"),

    body("data_lettura")
        .optional({ nullable: true })
        .isISO8601().withMessage("La data di lettura deve essere in formato valido (YYYY-MM-DD)"),

    body("volume")
        .optional({ nullable: true })
        .isInt({ min: 0 }).withMessage("Il volume deve essere un numero intero positivo"),

    body("capitolo")
        .optional({ nullable: true })
        .isInt({ min: 0 }).withMessage("Il capitolo deve essere un numero intero positivo"),

    body("pagina")
        .optional({ nullable: true })
        .isInt({ min: 0 }).withMessage("La pagina deve essere un numero intero positivo"),

    body("stato")
        .optional()
        .isIn(["da_iniziare", "in_corso", "finito"])
        .withMessage("Lo stato deve essere uno tra: 'da_iniziare', 'in_corso', 'finito'"),

    handleValidationErrors,
];

