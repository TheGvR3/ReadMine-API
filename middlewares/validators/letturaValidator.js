import { body, param } from "express-validator";
import { handleValidationErrors } from "./handleValidators.js";

// Regola riusabile: se entrambe le date presenti, data_fine >= data_inizio.
// (Il DB ha già il CHECK chk_letture_date_ordine, ma fail-fast lato app è più chiaro.)
const dateOrderRule = body("data_fine").custom((dataFine, { req }) => {
    const di = req.body.data_inizio;
    if (!di || !dataFine) return true;
    if (new Date(dataFine) < new Date(di)) {
        throw new Error("data_fine deve essere >= data_inizio");
    }
    return true;
});

const sharedFields = [
    body("id_edizione")
        .optional({ nullable: true, checkFalsy: true })
        .isInt({ min: 1 }).withMessage("id_edizione deve essere un ID valido"),
    body("data_inizio")
        .optional({ nullable: true, checkFalsy: true })
        .isISO8601().withMessage("data_inizio deve essere YYYY-MM-DD"),
    body("data_fine")
        .optional({ nullable: true, checkFalsy: true })
        .isISO8601().withMessage("data_fine deve essere YYYY-MM-DD"),
    dateOrderRule,
    body("volume")
        .optional({ nullable: true, checkFalsy: true })
        .isInt({ min: 0 }).withMessage("Il volume deve essere un intero >= 0"),
    body("capitolo")
        .optional({ nullable: true, checkFalsy: true })
        .isInt({ min: 0 }).withMessage("Il capitolo deve essere un intero >= 0"),
    body("pagina")
        .optional({ nullable: true, checkFalsy: true })
        .isInt({ min: 0 }).withMessage("La pagina deve essere un intero >= 0"),
    body("stato")
        .optional({ nullable: true, checkFalsy: true })
        .isIn(["da_iniziare", "in_corso", "finito", "abbandonato"])
        .withMessage("Stato non valido"),
    body("valutazione")
        .optional({ nullable: true, checkFalsy: true })
        .isInt({ min: 1, max: 5 }).withMessage("La valutazione deve essere 1..5"),
    body("note")
        .optional({ nullable: true, checkFalsy: true })
        .isString().withMessage("Le note devono essere testo")
        .trim(),
];

export const validateCreateLettura = [
    body("id_utente")
        .notEmpty().withMessage("L'id dell'utente è obbligatorio")
        .isInt({ min: 1 }).withMessage("id_utente non valido"),
    body("id_opera")
        .notEmpty().withMessage("L'id dell'opera è obbligatorio")
        .isInt({ min: 1 }).withMessage("id_opera non valido"),
    ...sharedFields,
    handleValidationErrors,
];

export const validateUpdateLettura = [
    param("id_lettura")
        .notEmpty().withMessage("L'id della lettura è obbligatorio")
        .isInt({ min: 1 }).withMessage("id_lettura non valido"),
    ...sharedFields,
    handleValidationErrors,
];

// PATCH /letture/:id/stato — solo body.stato richiesto
export const validateUpdateLetturaStato = [
    body("stato")
        .notEmpty().withMessage("stato obbligatorio")
        .isIn(["da_iniziare", "in_corso", "finito", "abbandonato"])
        .withMessage("stato non valido"),
    handleValidationErrors,
];
