import { generateTimetable } from './src/services/timetableEngine';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

function formatTime(minutesSinceMidnight: number): string {
  const hrs = Math.floor(minutesSinceMidnight / 60);
  const mins = minutesSinceMidnight % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

async function main() {
  const generatedSlots = await generateTimetable();
  
  console.log('Fetching relations to build readable grid...');
  
  const slots = await prisma.timetableSlot.findMany({
    include: {
      class: true,
      subject: true,
      teacher: true,
      lab: true
    },
    orderBy: [
      { dayOfWeek: 'asc' },
      { startTime: 'asc' }
    ]
  });

  const school = await prisma.school.findFirst();
  const workingDays = JSON.parse(school!.workingDays) as number[];
  
  const blockTimes = [
    { start: "08:30", end: "09:10" },
    { start: "09:10", end: "09:50" },
    { start: "09:50", end: "10:30" },
    { start: "10:30", end: "11:10" },
    { start: "11:10", end: "11:50" },
    { start: "11:50", end: "12:30" },
    { start: "12:30", end: "13:30", isLunch: true },
    { start: "13:30", end: "14:10" },
    { start: "14:10", end: "14:50" }
  ];
  const blockLabels = blockTimes.map(b => `${b.start}-${b.end}`);
  
  let markdown = `# Generated Timetable (Variable Durations & Backtracking)\n\n`;

  // --- Class Grid ---
  markdown += `## Class Views\n\n`;
  const classes = await prisma.class.findMany({ 
    where: { section: { not: 'LOUNGE' } },
    orderBy: { grade: 'asc' } 
  });
  
  for (const cls of classes) {
    markdown += `### Class ${cls.grade}-${cls.section}\n\n`;
    markdown += `| Day | ` + blockLabels.join(' | ') + ` |\n`;
    markdown += `|---` + Array.from({length: blockTimes.length}, () => `|---`).join('') + `|\n`;

    for (const day of workingDays) {
      let row = `| Day ${day} |`;
      for (const block of blockTimes) {
        if (block.isLunch) {
          row += ` **Lunch Break** |`;
          continue;
        }
        
        const bStart = block.start;
        // Find a slot that overlaps with this 40-min block
        const slot = slots.find(s => {
           if (s.classId !== cls.id || s.dayOfWeek !== day) return false;
           return s.startTime <= bStart && s.endTime > bStart;
        });

        if (slot) {
          row += ` ${slot.subject.name} (${slot.teacher.name})${slot.lab ? ' ['+slot.lab.name+']' : ''} |`;
        } else {
          row += ` **EMPTY** |`;
        }
      }
      markdown += row + `\n`;
    }
    markdown += `\n`;
  }

  // --- Teacher Grid ---
  markdown += `## Teacher Views\n\n`;
  const teachers = await prisma.teacher.findMany({ orderBy: { name: 'asc' } });

  for (const t of teachers) {
    const teacherSlots = slots.filter(s => s.teacherId === t.id);
    
    // Check if teacher has any leisure periods assigned
    const hasLeisure = slots.some(s => s.teacherId === t.id && s.subject.name === 'Leisure');
    if (teacherSlots.length === 0 && !hasLeisure) continue;

    markdown += `### Teacher: ${t.name}\n\n`;
    markdown += `| Day | ` + blockLabels.join(' | ') + ` |\n`;
    markdown += `|---` + Array.from({length: blockTimes.length}, () => `|---`).join('') + `|\n`;

    for (const day of workingDays) {
      let row = `| Day ${day} |`;
      for (const block of blockTimes) {
        if (block.isLunch) {
          row += ` **Lunch Break** |`;
          continue;
        }

        const bStart = block.start;
        const slot = teacherSlots.find(s => s.dayOfWeek === day && s.startTime <= bStart && s.endTime > bStart);
        if (slot) {
          if (slot.subject.name === 'Leisure') {
            row += ` **LEISURE** |`;
          } else {
            row += ` Class ${slot.class.grade}-${slot.class.section} (${slot.subject.name}) |`;
          }
        } else {
          row += ` Free |`;
        }
      }
      markdown += row + `\n`;
    }
    markdown += `\n`;
  }

  const outPath = 'C:\\Users\\anvii\\.gemini\\antigravity-ide\\brain\\267d7d0b-6757-4b24-b55d-958ab5fd150c\\timetable_output.md';
  fs.writeFileSync(outPath, markdown);
  
  console.log(`Saved markdown artifact to: ${outPath}`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
