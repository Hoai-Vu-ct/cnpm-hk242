require('dotenv').config();
const jwt = require('jsonwebtoken');

const AuthMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ status: false, message: "Authorization header is missing" });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ status: false, message: "Token not found in Authorization header" });
        }

        const secretKey = process.env.JWT_SECRET || 'default-secret-key';

        try {
            const decoded = await jwt.verify(token, secretKey);
            req.user = decoded; // Lưu thông tin người dùng đã giải mã
            next(); // Tiếp tục thực hiện các middleware hoặc route handler khác
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ status: false, message: "Token has expired" });
            } else if (err.name === 'JsonWebTokenError') {
                return res.status(401).json({ status: false, message: "Invalid token" });
            }
            return res.status(500).json({ status: false, message: "Internal server error" });
        }
    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(500).json({ status: false, message: "Unexpected error occurred" });
    }
};

module.exports = AuthMiddleware;
