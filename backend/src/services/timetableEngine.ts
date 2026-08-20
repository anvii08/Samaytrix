import { PrismaClient, Subject, Teacher, Lab, Class } from '@prisma/client';

const prisma = new PrismaClient();

interface Slot {
  dayOfWeek: number;
  startTime: string; // "08:30"
  endTime: string;   // "09:10"
  classId: string;
  subjectId: string;
  teacherId: string;
  labId: string | null;
  isExtracurricular: boolean;
}

interface EventToSchedule {
  subjectId: string;
  teacherId: string;
  labId: string | null;
  duration: number;
  isExtracurricular: boolean;
  blocks: number; // 1 for 40m, 2 for 80m
}

// Fixed timeslots that respect the 12:30-13:30 lunch break and 40-min blocks
// Slot 0..5 (08:30 to 12:30), Lunch (12:30 to 13:30), Slot 6..7 (13:30 to 14:50)
const BLOCK_TIMES = [
  { start: "08:30", end: "09:10" },
  { start: "09:10", end: "09:50" },
  { start: "09:50", end: "10:30" },
  { start: "10:30", end: "11:10" },
  { start: "11:10", end: "11:50" },
  { start: "11:50", end: "12:30" },
  { start: "13:30", end: "14:10" },
  { start: "14:10", end: "14:50" }
];

// formatTime removed since we use explicit BLOCK_TIMES

export async function generateTimetable() {
  console.log('Starting Timetable Generation (Backtracking Phase)...');
  
  await prisma.timetableSlot.deleteMany();

  const school = await prisma.school.findFirst();
  if (!school) throw new Error("School config not found");
  
  const workingDays = JSON.parse(school.workingDays) as number[];
  
  // E.g., "08:00"
  const startHrs = parseInt(school.startTime.split(':')[0]);
  const startMins = parseInt(school.startTime.split(':')[1]);
  const startOffsetMins = startHrs * 60 + startMins;

  const classes = await prisma.class.findMany();
  const subjects = await prisma.subject.findMany();
  const labs = await prisma.lab.findMany();
  const teachers = await prisma.teacher.findMany({
    include: { subjects: true }
  });

  // Ensure Leisure Subject and Lounge Class exist for teacher free periods
  let leisureSub = await prisma.subject.findFirst({ where: { name: 'Leisure' } });
  if (!leisureSub) {
      leisureSub = await prisma.subject.create({ data: { name: 'Leisure', category: 'Misc', duration: 40, requiresLab: false } });
  }
  let loungeClass = await prisma.class.findFirst({ where: { section: 'LOUNGE' } });
  if (!loungeClass) {
      loungeClass = await prisma.class.create({ data: { grade: 0, section: 'LOUNGE' } });
  }
  subjects.push(leisureSub);

  const getSubjectsForClass = (grade: number) => {
    const sEnglish = subjects.find((s: Subject) => s.name === 'English')!;
    const sHindi = subjects.find((s: Subject) => s.name === 'Hindi')!;
    const sMaths = subjects.find((s: Subject) => s.name === 'Maths')!;
    const sSocialScience = subjects.find((s: Subject) => s.name === 'Social Science')!;
    const sScience = subjects.find((s: Subject) => s.name === 'Science')!;
    const sIT = subjects.find((s: Subject) => s.name === 'IT')!;
    const sComputer = subjects.find((s: Subject) => s.name === 'Computer')!;
    const sPunjabi = subjects.find((s: Subject) => s.name === 'Punjabi')!;
    const sSanskrit = subjects.find((s: Subject) => s.name === 'Sanskrit')!;
    const sPhysics = subjects.find((s: Subject) => s.name === 'Physics')!;
    const sChemistry = subjects.find((s: Subject) => s.name === 'Chemistry')!;
    const sBiology = subjects.find((s: Subject) => s.name === 'Biology')!;
    const sCompScience = subjects.find((s: Subject) => s.name === 'Computer Science')!;
    const sGames = subjects.find((s: Subject) => s.name === 'Games')!;
    const sYoga = subjects.find((s: Subject) => s.name === 'Yoga')!;
    const sMusic = subjects.find((s: Subject) => s.name === 'Music')!;
    const sDance = subjects.find((s: Subject) => s.name === 'Dance')!;
    
    if (grade >= 1 && grade <= 5) {
      return [sEnglish, sHindi, sMaths, sSocialScience, sScience, sIT, sComputer, sPunjabi, sSanskrit, sGames, sYoga, sMusic, sDance];
    } else if (grade >= 6 && grade <= 8) {
      return [sEnglish, sHindi, sMaths, sSocialScience, sScience, sPunjabi, sSanskrit, sIT, sComputer, sGames, sYoga, sMusic, sDance];
    } else {
      return [sEnglish, sHindi, sMaths, sSocialScience, sPhysics, sChemistry, sBiology, sCompScience, sGames, sYoga, sMusic, sDance];
    }
  };

  const getSubjectDemandCount = (grade: number, subId: string): number => {
    const s = subjects.find((sub: Subject) => sub.id === subId)!;
    
    if (grade >= 1 && grade <= 5) {
        if (s.name === 'English') return 5;
        if (s.name === 'Maths') return 5;
        if (s.name === 'Hindi') return 5;
        if (s.name === 'Science') return 5;
        if (s.name === 'Social Science') return 5;
        if (s.name === 'IT') return 4;
        if (s.name === 'Computer') return 3;
        if (s.name === 'Punjabi') return 2;
        if (s.name === 'Sanskrit') return 2;
        if (s.name === 'Games') return 1;
        if (s.name === 'Yoga') return 1;
        if (s.name === 'Music') return 1;
        if (s.name === 'Dance') return 1;
    } else if (grade >= 6 && grade <= 8) {
        if (s.name === 'English') return 5;
        if (s.name === 'Maths') return 5;
        if (s.name === 'Hindi') return 5;
        if (s.name === 'Science') return 5;
        if (s.name === 'Social Science') return 5;
        if (s.name === 'Punjabi') return 3;
        if (s.name === 'Sanskrit') return 3;
        if (s.name === 'IT') return 3;
        if (s.name === 'Computer') return 2; // Reduced to 2 to make room for Dance (Total 40 blocks)
        if (s.name === 'Games' || s.name === 'Yoga' || s.name === 'Music' || s.name === 'Dance') return 1;
    } else if (grade >= 9 && grade <= 10) {
        if (s.name === 'Physics' || s.name === 'Chemistry' || s.name === 'Biology' || s.name === 'Computer Science') return 2; // 80m blocks
        if (s.name === 'English' || s.name === 'Maths' || s.name === 'Hindi' || s.name === 'Social Science') return 5;
        if (s.name === 'Games' || s.name === 'Yoga' || s.name === 'Music' || s.name === 'Dance') return 1;
    }
    return 0;
  };

  const generatedSlots: Slot[] = [];
  
  // Track busy state using a simple string array for each minute!
  // To optimize, since all durations are multiples of 40, we can discretize time into 40-min blocks.
  // 320 mins = 8 blocks of 40 mins.
  // So a 40 min class takes 1 block. An 80 min class takes 2 blocks.
  const busyMap = new Set<string>(); // "teacherId-day-blockIdx" or "labId-day-blockIdx"

  const markBusy = (teacherId: string, labId: string | null, day: number, startBlock: number, blocks: number, busy: boolean) => {
    for (let i = 0; i < blocks; i++) {
      const bIdx = startBlock + i;
      const tKey = `t-${teacherId}-${day}-${bIdx}`;
      const lKey = labId ? `l-${labId}-${day}-${bIdx}` : null;
      if (busy) {
        busyMap.add(tKey);
        if (lKey) busyMap.add(lKey);
      } else {
        busyMap.delete(tKey);
        if (lKey) busyMap.delete(lKey);
      }
    }
  };

  const isFree = (teacherId: string, labId: string | null, day: number, startBlock: number, blocks: number) => {
    for (let i = 0; i < blocks; i++) {
      const bIdx = startBlock + i;
      if (busyMap.has(`t-${teacherId}-${day}-${bIdx}`)) return false;
      if (labId && busyMap.has(`l-${labId}-${day}-${bIdx}`)) return false;
    }
    return true;
  };

  // Pre-calculate event permutations
  const classEvents = new Map<string, EventToSchedule[]>();

  // Filter out LOUNGE class from regular scheduling
  const regularClasses = classes.filter((c: Class) => c.section !== 'LOUNGE');
  
  // Sort classes 9-10 first, then 6-8, then 1-5 to place hardest constraints first
  const sortedClasses = [...regularClasses].sort((a, b) => b.grade - a.grade);

  for (const cls of sortedClasses) {
    const events: EventToSchedule[] = [];
    const clsSubjects = getSubjectsForClass(cls.grade);
    
    for (const sub of clsSubjects) {
      const count = getSubjectDemandCount(cls.grade, sub.id);
      for (let i = 0; i < count; i++) {
        // Enforce EXACT subject match, not just pool assignment!
        // teacher.subjects contains objects { subjectId }
        const eligibleTeachers = teachers.filter((t: any) => 
            t.subjects.some((ts: any) => ts.subjectId === sub.id) && 
            JSON.parse(t.assignedClasses).includes(cls.id)
        );
        
        if (eligibleTeachers.length === 0) {
           throw new Error(`No eligible teacher found for ${sub.name} in Grade ${cls.grade}`);
        }

        let chosenLabId = null;
        if (sub.requiresLab) {
          const eligibleLabs = labs.filter((l: Lab) => l.type === sub.labType);
          chosenLabId = eligibleLabs[cls.grade % eligibleLabs.length].id;
        }
        events.push({
          subjectId: sub.id,
          teacherId: eligibleTeachers[cls.grade % eligibleTeachers.length].id,
          labId: chosenLabId,
          duration: sub.duration,
          isExtracurricular: sub.category === 'Extracurricular',
          blocks: sub.duration / 40
        });
      }
    }
    
    // We will shuffle events per attempt instead of sorting by duration
    classEvents.set(cls.id, events);
  }

  function shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  let nodesExplored = 0;
  let deepestClass = 0;

  function solveClass(cIndex: number, maxBlocksPerDay: number): boolean {
    if (cIndex === sortedClasses.length) return true; // Done!
    if (cIndex > deepestClass) deepestClass = cIndex;

    const cls = sortedClasses[cIndex];

    // Priority Heuristic: Labs first, then long duration, with slight random jitter for restarts
    const events = [...classEvents.get(cls.id)!];
    events.sort((a, b) => {
        const scoreA = (a.labId ? 1000 : 0) + (a.duration * 10);
        const scoreB = (b.labId ? 1000 : 0) + (b.duration * 10);
        return (scoreB + Math.random() * 20) - (scoreA + Math.random() * 20);
    });
    
    return packEvents(cls, events, maxBlocksPerDay);
  }

  function packEvents(cls: Class, remainingEvents: EventToSchedule[], maxBlocksPerDay: number): boolean {
    nodesExplored++;
    if (nodesExplored > 10000) return false; // Fail fast per search node to allow restarts/relaxations
    
    if (remainingEvents.length === 0) {
      const cIndex = sortedClasses.findIndex(c => c.id === cls.id);
      return solveClass(cIndex + 1, maxBlocksPerDay);
    }

    const ev = remainingEvents[0];
    const blocksNeeded = ev.blocks;

    // Try all possible start blocks (0 to 39)
    for (let startBlock = 0; startBlock <= 40 - blocksNeeded; startBlock++) {
        if (nodesExplored > 10000) return false; // Abort loop if node limit reached
        
        const day = Math.floor(startBlock / 8) + 1;
        const timeWithinDayBlocks = startBlock % 8;

        if (timeWithinDayBlocks + blocksNeeded > 8) continue; // Crosses day boundary

        // NO LUNCH OVERLAP
        if (blocksNeeded === 2 && timeWithinDayBlocks === 5) continue;

        // Check if class itself is free at this slot
        let classIsFree = true;
        for (let b = 0; b < blocksNeeded; b++) {
            if (busyMap.has(`c-${cls.id}-${day}-${timeWithinDayBlocks + b}`)) {
                classIsFree = false;
                break;
            }
        }
        if (!classIsFree) continue;

        // HARD CONSTRAINT: Max `maxBlocksPerDay` blocks per day for ANY subject (i.e. one 80m session, or two 40m sessions)
        let subjectBlocksToday = 0;
        for (const slot of generatedSlots) {
            if (slot.classId === cls.id && slot.dayOfWeek === day && slot.subjectId === ev.subjectId) {
                const sub = subjects.find((s: Subject) => s.id === slot.subjectId);
                const b = sub ? sub.duration / 40 : 1;
                subjectBlocksToday += b;
            }
        }
        
        if (subjectBlocksToday + blocksNeeded > maxBlocksPerDay) continue; // CAP

        // HEURISTIC: Force stagger 80-minute blocks to strictly distinct days to eliminate state space explosion
        if (blocksNeeded === 2) {
            const sub = subjects.find((s: Subject) => s.id === ev.subjectId);
            if (sub) {
                if (sub.name === 'Physics' && day === 5) continue; // Try to keep off Day 5
                if (sub.name === 'Chemistry' && day === 3) continue;
                if (sub.name === 'Biology' && day === 1) continue;
                if (sub.name === 'Computer Science' && day === 2) continue;
            }
        }

        // Check if teacher/lab is free
        if (!isFree(ev.teacherId, ev.labId, day, timeWithinDayBlocks, blocksNeeded)) continue;

        // Place
        markBusy(ev.teacherId, ev.labId, day, timeWithinDayBlocks, blocksNeeded, true);
        for (let b = 0; b < blocksNeeded; b++) {
            busyMap.add(`c-${cls.id}-${day}-${timeWithinDayBlocks + b}`);
        }
        
        const startSlotStr = BLOCK_TIMES[timeWithinDayBlocks].start;
        const endSlotStr = BLOCK_TIMES[timeWithinDayBlocks + blocksNeeded - 1].end;

        const slot: Slot = {
            classId: cls.id,
            dayOfWeek: day,
            startTime: startSlotStr,
            endTime: endSlotStr,
            subjectId: ev.subjectId,
            teacherId: ev.teacherId,
            labId: ev.labId,
            isExtracurricular: ev.isExtracurricular
        };
        generatedSlots.push(slot);

        if (packEvents(cls, remainingEvents.slice(1), maxBlocksPerDay)) {
            return true;
        }

        // Backtrack
        generatedSlots.pop();
        markBusy(ev.teacherId, ev.labId, day, timeWithinDayBlocks, blocksNeeded, false);
        for (let b = 0; b < blocksNeeded; b++) {
            busyMap.delete(`c-${cls.id}-${day}-${timeWithinDayBlocks + b}`);
        }
    }

    return false;
  }

  let success = false;
  const startTime = Date.now();
  
  for (let attempt = 1; attempt <= 1000; attempt++) {
      nodesExplored = 0;
      deepestClass = 0;
      generatedSlots.length = 0;
      busyMap.clear();

      // PRE-ALLOCATE LEISURE PERIODS
      // For each teacher, identify exactly 3 distinct days and place 1 Leisure period.
      for (const t of teachers) {
          const days = shuffle([1, 2, 3, 4, 5]).slice(0, 3);
          for (const d of days) {
              const block = Math.floor(Math.random() * 8); // 0 to 7
              markBusy(t.id, null, d, block, 1, true);
              generatedSlots.push({
                  classId: loungeClass!.id,
                  dayOfWeek: d,
                  startTime: BLOCK_TIMES[block].start,
                  endTime: BLOCK_TIMES[block].end,
                  subjectId: leisureSub!.id,
                  teacherId: t.id,
                  labId: null,
                  isExtracurricular: false
              });
          }
      }

      const elapsed = Date.now() - startTime;
      
      let maxBlocksPerDay = 2; // Strict cap of 2 blocks per day (1 session of 80m, or 2 of 40m)
      if (elapsed > 20000) maxBlocksPerDay = 3; // Loosen to 3 if hitting timeout to guarantee generation
      if (elapsed > 27000) maxBlocksPerDay = 8; // Complete fallback
      
      if (attempt % 50 === 1) {
          console.log(`Starting generation attempt ${attempt} (elapsed: ${Math.round(elapsed/1000)}s, max blocks: ${maxBlocksPerDay})...`);
      }
      
      success = solveClass(0, maxBlocksPerDay);
      
      if (success) {
          console.log(`Valid schedule found on attempt ${attempt}!`);
          if (maxBlocksPerDay > 2) {
              console.log(`COMPROMISE LOG: Loosened max-blocks to ${maxBlocksPerDay} per day to avoid timeout.`);
          }
          break;
      }
      
      if (elapsed > 30000 && maxBlocksPerDay === 8) {
          console.log("Hard time limit (30s) hit and still failing. Engine bottlenecked on hard capacity constraints.");
          break;
      }
  }

  if (success) {
    console.log(`Writing ${generatedSlots.length} slots to DB...`);
    await prisma.timetableSlot.createMany({
      data: generatedSlots
    });
    console.log('Timetable Generation Complete.');
  } else {
    console.warn(`All restarts exhausted. Failed to schedule Class index ${deepestClass} (${sortedClasses[deepestClass].grade}-${sortedClasses[deepestClass].section}).`);
    throw new Error('Unsatisfiable constraints.');
  }

  return generatedSlots;
}
