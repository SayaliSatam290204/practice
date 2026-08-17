// Not Found Middleware
// Runs when no API route matches
const notFound = (req, res, next) => {
    const error = new Error(
        `Route Not Found - ${req.originalUrl}`
    );
    res.status(404);
    next(error);
};

// Error Handler Middleware
// Handles errors from the application
const errorHandler = (err, req, res, next) => {

    const statusCode =
        res.statusCode === 200
            ? 500
            : res.statusCode;

    res.status(statusCode).json({
        message: err.message,
        // Show stack trace only in development mode
        stack:
            process.env.NODE_ENV === "production"
                ? null
                : err.stack
    });
};

module.exports = {
    notFound,
    errorHandler
};