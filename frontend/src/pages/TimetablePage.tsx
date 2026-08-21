import { useEffect, useState } from 'react';

interface TimetableSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subject: { name: string; color?: string };
  teacher?: { user: { name: string } };
  class?: { grade: number; section: string };
  lab?: { name: string };
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = [
  { start: '08:30', end: '09:10' },
  { start: '09:10', end: '09:50' },
  { start: '09:50', end: '10:30' },
  { start: '10:30', end: '11:10' },
  { start: '11:10', end: '11:50' },
  { start: '11:50', end: '12:30' },
  { start: '12:30', end: '13:30', isBreak: true, label: 'LUNCH BREAK' },
  { start: '13:30', end: '14:10' },
  { start: '14:10', end: '14:50' }
];

const TimetablePage = () => {
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const role = localStorage.getItem('role');

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
        
        const response = await fetch(`${apiUrl}/api/timetable/my`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to fetch timetable');
        }

        const data = await response.json();
        setTimetable(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, []);

  const getSlot = (dayIdx: number, startTime: string) => {
    // dayOfWeek in DB is 1 (Monday) to 5 (Friday)
    return timetable.find(t => t.dayOfWeek === dayIdx + 1 && t.startTime === startTime);
  };

  if (loading) {
    return <div className="p-8 text-text-muted">Loading timetable...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }


  return (
    <div className="max-w-7xl mx-auto p-8 bg-gray-50 min-h-screen text-gray-800 font-sans">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-light text-gray-900 tracking-tight">Weekly Timetable</h1>
          <p className="text-gray-500 mt-2">Here is your schedule for the week.</p>
        </div>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 w-32">Time</th>
                {DAYS.map(day => (
                  <th key={day} className="px-6 py-4 min-w-[160px]">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {TIME_SLOTS.map((time, idx) => (
                <tr key={idx} className={time.isBreak ? "bg-gray-50" : "hover:bg-gray-50/50 transition-colors"}>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-medium">
                    {time.start} - {time.end}
                  </td>
                  
                  {time.isBreak ? (
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-400 font-medium tracking-widest text-xs">
                      {time.label}
                    </td>
                  ) : (
                    DAYS.map((_, dayIdx) => {
                      const slot = getSlot(dayIdx, time.start);
                      return (
                        <td key={dayIdx} className="px-6 py-4 border-l border-gray-100">
                          {slot ? (
                            <div className="flex flex-col gap-1">
                              <span className="font-semibold text-primary">{slot.subject?.name}</span>
                              {role === 'Student' && slot.teacher && (
                                <span className="text-xs text-gray-500">Prof. {slot.teacher.user?.name || 'Unknown'}</span>
                              )}
                              {role === 'Teacher' && slot.class && (
                                <span className="text-xs text-gray-500">Class {slot.class.grade}-{slot.class.section}</span>
                              )}
                              {slot.lab && (
                                <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full w-max mt-1">
                                  {slot.lab.name}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                      );
                    })
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TimetablePage;
