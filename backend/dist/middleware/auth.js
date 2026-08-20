"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_development';
const requireRole = (roles) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: Missing token' });
        }
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            if (!roles.includes(decoded.role)) {
                return res.status(403).json({ error: 'Forbidden: Insufficient role permissions' });
            }
            req.user = decoded;
            next();
        }
        catch (err) {
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }
    };
};
exports.requireRole = requireRole;
