const asyncHandler = require('express-async-handler');

const validate = (schema) => asyncHandler(async (req, res, next) => {
    try {
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        return next();
    } catch (err) {
        res.status(400).json({
            message: 'Validation Error',
            errors: err.errors.map(e => e.message),
        });
    }
});

module.exports = {
    validate,
};