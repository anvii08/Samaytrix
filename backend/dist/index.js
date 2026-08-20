"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/health', (req, res) => {
    res.json({ status: 'ok', time: new Date() });
});
const auth_1 = __importDefault(require("./routes/auth"));
const timetable_1 = __importDefault(require("./routes/timetable"));
const attendance_1 = __importDefault(require("./routes/attendance"));
const aiTutor_1 = __importDefault(require("./routes/aiTutor"));
// API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/timetable', timetable_1.default);
app.use('/api/attendance', attendance_1.default);
app.use('/api/ai-tutor', aiTutor_1.default);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
