const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Split by space

    // No token provided, return 401 Unauthorized
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_KEY, (err, user) => {
        // Token is invalid or expired, return 403 Forbidden
        if (err) return res.sendStatus(403);
        
        // Attach the user object to the request
        req.user = user;
        next();
    });
}

module.exports = {
    authenticateToken,
};