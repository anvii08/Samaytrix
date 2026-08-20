"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_development';
// Login route
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { role, identifier, password } = req.body;
    if (!role || !identifier || !password) {
        return res.status(400).json({ error: 'Missing role, identifier, or password' });
    }
    try {
        let user = null;
        let validPassword = false;
        if (role === 'Admin') {
            user = yield prisma.admin.findUnique({ where: { email: identifier } });
            if (user)
                validPassword = yield bcryptjs_1.default.compare(password, user.passwordHash);
        }
        else if (role === 'Teacher') {
            user = yield prisma.teacher.findUnique({ where: { employeeId: identifier } });
            if (user)
                validPassword = yield bcryptjs_1.default.compare(password, user.passwordHash);
        }
        else if (role === 'Student') {
            // Assuming identifier is rollNumber for student
            // Since student unique is classId + rollNumber, let's just do a first for now, or expect identifier to be unique across all students somehow
            // For a robust system we might need classId + rollNumber. Here we just findFirst by rollNumber
            user = yield prisma.student.findFirst({ where: { rollNumber: identifier } });
            if (user)
                validPassword = yield bcryptjs_1.default.compare(password, user.passwordHash);
        }
        else if (role === 'Parent') {
            user = yield prisma.parent.findUnique({ where: { contact: identifier } });
            if (user)
                validPassword = yield bcryptjs_1.default.compare(password, user.passwordHash);
        }
        else {
            return res.status(400).json({ error: 'Invalid role' });
        }
        if (!user || !validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: user.id, role }, JWT_SECRET, { expiresIn: '24h' });
        return res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                role
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error during login' });
    }
}));
exports.default = router;
