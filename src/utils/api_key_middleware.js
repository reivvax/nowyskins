const API_KEY = process.env['API_KEY'];

const apiKeySetterMiddleware = (req, res, next) => {
    req.headers['api-key'] = process.env.API_KEY; // Ensure API_KEY is set in environment variables
    next();
};

const apiKeyMiddleware = (req, res, next) => {
    const apiKey = req.headers['api-key'];
    if (apiKey && apiKey === API_KEY) {
        next();
    } else {
        console.log("UNAUTHORIZED");
        res.status(401).json({ message: 'Unauthorized' });
    }
};

module.exports = {
    apiKeySetterMiddleware,
    apiKeyMiddleware,
};