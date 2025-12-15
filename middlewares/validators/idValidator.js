
export function validateId(paramName) {
    return (req, res, next) => {
        const id = req.params[paramName];
        if (isNaN(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({ error: `${paramName} non valido` });
        }
        next();
    };
}