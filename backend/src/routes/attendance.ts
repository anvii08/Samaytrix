import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authorizeRole, AuthRequest } from '../middleware/authMiddleware';

const router = express.Router();
const prisma = new PrismaClient();

// Mark attendance (Teacher only)
router.post('/mark', authorizeRole(['Teacher']), async (req: AuthRequest, res) => {
  const { studentId, date, status, mode } = req.body;
  
  if (!studentId || !date || !status || !mode) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const teacherId = req.user!.id;
    
    const attendance = await prisma.attendance.create({
      data: {
        studentId,
        date: new Date(date),
        status,
        mode,
        markedBy: teacherId
      }
    });

    return res.json({ message: 'Attendance marked', attendance });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to mark attendance' });
  }
});

// Get attendance for a student (Admin, Teacher, Student, Parent)
router.get('/student/:studentId', authorizeRole(['Admin', 'Teacher', 'Student', 'Parent']), async (req: AuthRequest, res) => {
  const { studentId } = req.params;
  const user = req.user!;
  
  if (user.role === 'Student' && user.id !== studentId) {
    return res.status(403).json({ error: 'Forbidden: You can only view your own attendance' });
  }
  
  try {
    const records = await prisma.attendance.findMany({
      where: { studentId },
      orderBy: { date: 'desc' }
    });
    
    return res.json(records);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
});

export default router;
