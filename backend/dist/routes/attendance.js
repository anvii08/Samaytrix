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
const client_1 = require("@prisma/client");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Mark attendance (Teacher only)
router.post('/mark', (0, authMiddleware_1.authorizeRole)(['Teacher']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { studentId, date, status, mode } = req.body;
    if (!studentId || !date || !status || !mode) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        const teacherId = req.user.id;
        const attendance = yield prisma.attendance.create({
            data: {
                studentId,
                date: new Date(date),
                status,
                mode,
                markedBy: teacherId
            }
        });
        return res.json({ message: 'Attendance marked', attendance });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to mark attendance' });
    }
}));
// Get attendance for a student (Admin, Teacher, Student, Parent)
router.get('/student/:studentId', (0, authMiddleware_1.authorizeRole)(['Admin', 'Teacher', 'Student', 'Parent']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { studentId } = req.params;
    const user = req.user;
    if (user.role === 'Student' && user.id !== studentId) {
        return res.status(403).json({ error: 'Forbidden: You can only view your own attendance' });
    }
    try {
        const records = yield prisma.attendance.findMany({
            where: { studentId },
            orderBy: { date: 'desc' }
        });
        return res.json(records);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch attendance records' });
    }
}));
exports.default = router;
