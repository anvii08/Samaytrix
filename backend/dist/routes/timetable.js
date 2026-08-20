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
// Get timetable for a specific class (accessible by anyone logged in)
router.get('/class/:classId', (0, authMiddleware_1.authorizeRole)(['Admin', 'Teacher', 'Student', 'Parent']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { classId } = req.params;
    const user = req.user;
    if (user.role === 'Student') {
        const student = yield prisma.student.findUnique({ where: { id: user.id } });
        if (!student || student.classId !== classId) {
            return res.status(403).json({ error: 'Forbidden: You can only view your own class timetable' });
        }
    }
    try {
        const timetable = yield prisma.timetableSlot.findMany({
            where: { classId },
            include: {
                subject: true,
                teacher: true,
                lab: true
            },
            orderBy: [
                { dayOfWeek: 'asc' },
                { startTime: 'asc' }
            ]
        });
        return res.json(timetable);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch timetable' });
    }
}));
// Get timetable for a specific teacher
router.get('/teacher/:teacherId', (0, authMiddleware_1.authorizeRole)(['Admin', 'Teacher']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { teacherId } = req.params;
    try {
        const timetable = yield prisma.timetableSlot.findMany({
            where: { teacherId },
            include: {
                subject: true,
                class: true,
                lab: true
            },
            orderBy: [
                { dayOfWeek: 'asc' },
                { startTime: 'asc' }
            ]
        });
        return res.json(timetable);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch teacher timetable' });
    }
}));
exports.default = router;
