// middlewares/handleValidators.js
import { validationResult } from "express-validator";
import { errorLogger } from "../errorLogger.js";

export const handleValidationErrors = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(err => `${err.param}: ${err.msg}`).join(" | ");

        // Log dell’errore di validazione
        await errorLogger(`Errore di validazione - ${req.method} ${req.originalUrl}: ${formattedErrors}\n`)
            .catch(console.error);

        return res.status(400).json({
            error: "Errore di validazione dei campi",
            details: errors.array(),
        });
    }

    next();
};
