import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_development';

// Login route
router.post('/login', async (req, res) => {
  const { role, identifier, password } = req.body;

  if (!role || !identifier || !password) {
    return res.status(400).json({ error: 'Missing role, identifier, or password' });
  }

  try {
    let user = null;
    let validPassword = false;

    if (role === 'Admin') {
      user = await prisma.admin.findUnique({ where: { email: identifier } });
      if (user) validPassword = await bcrypt.compare(password, user.passwordHash);
    } else if (role === 'Teacher') {
      user = await prisma.teacher.findUnique({ where: { employeeId: identifier } });
      if (user) validPassword = await bcrypt.compare(password, user.passwordHash);
    } else if (role === 'Student') {
      // Assuming identifier is rollNumber for student
      // Since student unique is classId + rollNumber, let's just do a first for now, or expect identifier to be unique across all students somehow
      // For a robust system we might need classId + rollNumber. Here we just findFirst by rollNumber
      user = await prisma.student.findFirst({ where: { rollNumber: identifier } });
      if (user) validPassword = await bcrypt.compare(password, user.passwordHash);
    } else if (role === 'Parent') {
      user = await prisma.parent.findUnique({ where: { contact: identifier } });
      if (user) validPassword = await bcrypt.compare(password, user.passwordHash);
    } else {
      return res.status(400).json({ error: 'Invalid role' });
    }

    if (!user || !validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
});

export default router;
