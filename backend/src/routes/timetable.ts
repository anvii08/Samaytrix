import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authorizeRole, AuthRequest } from '../middleware/authMiddleware';

const router = express.Router();
const prisma = new PrismaClient();

// Get timetable for a specific class (accessible by anyone logged in)
router.get('/class/:classId', authorizeRole(['Admin', 'Teacher', 'Student', 'Parent']), async (req: AuthRequest, res) => {
  const { classId } = req.params;
  const user = req.user!;

  if (user.role === 'Student') {
    const student = await prisma.student.findUnique({ where: { id: user.id } });
    if (!student || student.classId !== classId) {
      return res.status(403).json({ error: 'Forbidden: You can only view your own class timetable' });
    }
  }
  
  try {
    const timetable = await prisma.timetableSlot.findMany({
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
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch timetable' });
  }
});

// Get timetable for a specific teacher
router.get('/teacher/:teacherId', authorizeRole(['Admin', 'Teacher']), async (req, res) => {
  const { teacherId } = req.params;
  
  try {
    const timetable = await prisma.timetableSlot.findMany({
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
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch teacher timetable' });
  }
});

export default router;
