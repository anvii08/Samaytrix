import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authorizeRole, AuthRequest } from '../middleware/authMiddleware';

const router = express.Router();
const prisma = new PrismaClient();

// Get timetable for the currently logged-in user
router.get('/my', authorizeRole(['Teacher', 'Student']), async (req: AuthRequest, res) => {
  const user = req.user!;
  
  try {
    if (user.role === 'Student') {
      const student = await prisma.student.findUnique({ where: { id: user.id } });
      if (!student) return res.status(404).json({ error: 'Student not found' });
      
      const timetable = await prisma.timetableSlot.findMany({
        where: { classId: student.classId },
        include: { subject: true, teacher: true, lab: true },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
      });
      return res.json(timetable);
    } 
    
    if (user.role === 'Teacher') {
      const timetable = await prisma.timetableSlot.findMany({
        where: { teacherId: user.id },
        include: { subject: true, class: true, lab: true },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
      });
      return res.json(timetable);
    }

    return res.status(403).json({ error: 'Role not supported for /my timetable yet' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch your timetable' });
  }
});


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
