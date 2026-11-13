
const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {

    const authorization = req.headers.authorization;

    if (!authorization ||
        !authorization.startsWith("Bearer ")) {

        return res.status(401).json({
            message: "Please log in first"
        });
    }

    const token = authorization.substring(7);

    try {

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT secret missing");
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET,
            { issuer: "smart-library" }
        );

        req.user = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            message: "Invalid or expired session"
        });

    }
}

module.exports = verifyToken;
