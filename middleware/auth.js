const jwt = require('jsonwebtoken');

const UserMiddleware = function (req, res, next) {
    // Retrieve the 'Authorization' header
    const authHeader = req.header('Authorization');

    // Ensure the header has a token in the format 'Bearer <token>'
    const token = authHeader && authHeader.split(' ')[1];

    // If no token is found, return a 401 response
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // Verify the token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the decoded user data to the request object
        req.user = decoded.user;

        // Move on to the next middleware/route handler
        next();
    } catch (err) {
        // Handle any token verification errors (e.g., expired, invalid token)
        console.error('Token verification error:', err);
        return res.status(401).json({ message: 'Token is not valid' });
    }
};

// Export the middleware to be used in other files
module.exports = {
    UserMiddleware
};
