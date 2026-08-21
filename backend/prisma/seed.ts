import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);
  const adminCount = await prisma.admin.count();
  if (adminCount > 0) {
    console.log('Database already seeded. Skipping.');
    return;
  }

  console.log('Cleaning up old data...');
  await prisma.timetableSlot.deleteMany();
  await prisma.teacherSubject.deleteMany();
  await prisma.knowledgeBase.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.class.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.lab.deleteMany();
  await prisma.school.deleteMany();

  console.log('Creating School...');
  // 08:00 to 14:20 = 6 hours 20 minutes = 380 minutes per day.
  // We have a 60 min lunch (12:30 to 13:30) so active instruction = 320 mins/day.
  // 5 days a week = 1600 minutes per week.
  const school = await prisma.school.create({
    data: {
      name: 'Samaytrix High School',
      startTime: '08:00',
      endTime: '14:20',
      workingDays: JSON.stringify([1, 2, 3, 4, 5])
    }
  });

  console.log('Creating Labs...');
  const scienceLab = await prisma.lab.create({ data: { name: 'Science Lab', type: 'science', equipment: 'Beakers, Microscopes', capacity: 40 } });
  const computerLab = await prisma.lab.create({ data: { name: 'Computer Lab', type: 'computer', equipment: '40 PCs', capacity: 40 } });

  console.log('Creating Subjects...');
  const createSub = async (name: string, category: string, reqLab: boolean = false, labType: string | null = null, duration: number = 40) => 
    prisma.subject.create({ data: { name, category, requiresLab: reqLab, labType, duration } });

  const sEnglish = await createSub('English', 'Core');
  const sHindi = await createSub('Hindi', 'Core');
  const sMaths = await createSub('Maths', 'Core');
  const sSocialScience = await createSub('Social Science', 'Core');
  const sScience = await createSub('Science', 'Core'); 
  const sIT = await createSub('IT', 'Vocational');
  const sComputer = await createSub('Computer', 'Vocational');
  const sPunjabi = await createSub('Punjabi', 'Language');
  const sSanskrit = await createSub('Sanskrit', 'Language');
  
  // 9-10 Streams (80 minutes lab sessions)
  const sPhysics = await createSub('Physics', 'Science-Stream', true, 'science', 80);
  const sChemistry = await createSub('Chemistry', 'Science-Stream', true, 'science', 80);
  const sBiology = await createSub('Biology', 'Science-Stream', true, 'science', 80);
  const sCompScience = await createSub('Computer Science', 'Science-Stream', true, 'computer', 80);

  // Extracurriculars
  const sGames = await createSub('Games', 'Extracurricular');
  const sYoga = await createSub('Yoga', 'Extracurricular');
  const sMusic = await createSub('Music', 'Extracurricular');
  const sDance = await createSub('Dance', 'Extracurricular');

  console.log('Creating Classes 1-10...');
  const classes: any[] = [];
  for (let i = 1; i <= 10; i++) {
    const c = await prisma.class.create({ data: { grade: i, section: 'A' } });
    classes.push(c);
  }

  const poolAIds = classes.filter(c => c.grade >= 1 && c.grade <= 5).map(c => c.id);
  const poolBIds = classes.filter(c => c.grade >= 6 && c.grade <= 8).map(c => c.id);
  const poolCIds = classes.filter(c => c.grade >= 9 && c.grade <= 10).map(c => c.id);

  console.log('Creating Teachers and assigning to pools...');
  const createTeacher = async (name: string, empId: string, poolIds: string[], subjectIds: string[]) => {
    const t = await prisma.teacher.create({
      data: { name, employeeId: empId, passwordHash, assignedClasses: JSON.stringify(poolIds) }
    });
    for (const sid of subjectIds) {
      await prisma.teacherSubject.create({ data: { teacherId: t.id, subjectId: sid } });
    }
    return t;
  };

  // Pool A Teachers (1-5)
  await createTeacher('T_Eng_A1', 'T01', poolAIds, [sEnglish.id, sHindi.id]);
  await createTeacher('T_Eng_A2', 'T01b', poolAIds, [sEnglish.id, sHindi.id]);
  await createTeacher('T_Eng_A3', 'T01c', poolAIds, [sEnglish.id, sHindi.id]);
  await createTeacher('T_Math_A1', 'T02', poolAIds, [sMaths.id]);
  await createTeacher('T_Math_A2', 'T02b', poolAIds, [sMaths.id]);
  await createTeacher('T_Math_A3', 'T02c', poolAIds, [sMaths.id]);
  await createTeacher('T_Sci_A1', 'T03', poolAIds, [sScience.id]);
  await createTeacher('T_Sci_A2', 'T03b', poolAIds, [sScience.id]);
  await createTeacher('T_Sci_A3', 'T03c', poolAIds, [sScience.id]);
  await createTeacher('T_SS_A1', 'T04', poolAIds, [sSocialScience.id]);
  await createTeacher('T_SS_A2', 'T04b', poolAIds, [sSocialScience.id]);
  await createTeacher('T_SS_A3', 'T04c', poolAIds, [sSocialScience.id]);
  await createTeacher('T_IT_A1', 'T04d', poolAIds, [sIT.id, sComputer.id]);
  await createTeacher('T_Lang_A1', 'T04e', poolAIds, [sPunjabi.id, sSanskrit.id]);

  // Pool B Teachers (6-8)
  await createTeacher('T_Eng_B1', 'T06', poolBIds, [sEnglish.id, sHindi.id]);
  await createTeacher('T_Eng_B2', 'T06b', poolBIds, [sEnglish.id, sHindi.id]);
  await createTeacher('T_Math_B1', 'T07', poolBIds, [sMaths.id]);
  await createTeacher('T_Math_B2', 'T07b', poolBIds, [sMaths.id]);
  await createTeacher('T_Sci_B1', 'T08', poolBIds, [sScience.id]);
  await createTeacher('T_Sci_B2', 'T08b', poolBIds, [sScience.id]);
  await createTeacher('T_SS_B1', 'T09', poolBIds, [sSocialScience.id]);
  await createTeacher('T_SS_B2', 'T09b', poolBIds, [sSocialScience.id]);
  await createTeacher('T_IT_B1', 'T10', poolBIds, [sIT.id, sComputer.id]);
  await createTeacher('T_IT_B2', 'T10b', poolBIds, [sIT.id, sComputer.id]);
  await createTeacher('T_Lang_B1', 'T05b', poolBIds, [sPunjabi.id, sSanskrit.id]);
  await createTeacher('T_Lang_B2', 'T05c', poolBIds, [sPunjabi.id, sSanskrit.id]);

  // Dedicated Teachers (9-10)
  await createTeacher('T_Eng_C1', 'T11', poolCIds, [sEnglish.id]);
  await createTeacher('T_Math_C1', 'T12', poolCIds, [sMaths.id]);
  await createTeacher('T_Math_C2', 'T12b', poolCIds, [sMaths.id]);
  await createTeacher('T_Phys_C1', 'T13', poolCIds, [sPhysics.id]);
  await createTeacher('T_Chem_C1', 'T14', poolCIds, [sChemistry.id]);
  await createTeacher('T_Bio_C1', 'T15', poolCIds, [sBiology.id]);
  await createTeacher('T_CS_C1', 'T16', poolCIds, [sCompScience.id]);
  await createTeacher('T_SS_C1', 'T17', poolCIds, [sSocialScience.id]);
  await createTeacher('T_Hin_C1', 'T17b', poolCIds, [sHindi.id]);

  // Extracurricular Teachers
  const allPoolIds = [...poolAIds, ...poolBIds, ...poolCIds];
  await createTeacher('T_Sports1', 'T18', allPoolIds, [sGames.id]);
  await createTeacher('T_Sports2', 'T18b', allPoolIds, [sYoga.id]);
  await createTeacher('T_Arts1', 'T19', allPoolIds, [sMusic.id]);
  await createTeacher('T_Arts2', 'T19b', allPoolIds, [sDance.id]);

  console.log('Creating Admins...');
  await prisma.admin.createMany({
    data: [
      { name: 'Super Admin', email: 'admin@samaytrix.com', passwordHash },
      { name: 'Principal Admin', email: 'principal@samaytrix.com', passwordHash }
    ]
  });

  console.log('Creating Parents...');
  const parent1 = await prisma.parent.create({ data: { name: 'Parent Doe', contact: 'P01', passwordHash } });
  const parent2 = await prisma.parent.create({ data: { name: 'Parent Smith', contact: 'P02', passwordHash } });
  const parent3 = await prisma.parent.create({ data: { name: 'Parent Lee', contact: 'P03', passwordHash } });

  console.log('Creating Students...');
  await prisma.student.create({ data: { name: 'John Doe', rollNumber: 'S01', classId: classes[0].id, passwordHash, parentId: parent1.id } });
  await prisma.student.create({ data: { name: 'Jane Doe', rollNumber: 'S02', classId: classes[0].id, passwordHash, parentId: parent1.id } });
  await prisma.student.create({ data: { name: 'Sam Smith', rollNumber: 'S03', classId: classes[1].id, passwordHash, parentId: parent2.id } });
  await prisma.student.create({ data: { name: 'Lisa Lee', rollNumber: 'S04', classId: classes[8].id, passwordHash, parentId: parent3.id } });

}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
