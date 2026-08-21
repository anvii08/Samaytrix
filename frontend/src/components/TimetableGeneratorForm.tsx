import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface MasterData {
  school: any;
  classes: any[];
  subjects: any[];
  teachers: any[];
  labs: any[];
}

const TimetableGeneratorForm = () => {
  const [data, setData] = useState<MasterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Form State
  const [schoolStart, setSchoolStart] = useState('08:30');
  const [schoolEnd, setSchoolEnd] = useState('14:50');
  const [lunchStart, setLunchStart] = useState('12:30');
  const [lunchEnd, setLunchEnd] = useState('13:30');
  
  // classId -> subjectIds
  const [classSubjects, setClassSubjects] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
        const res = await fetch(`${apiUrl}/api/timetable/config`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch config');
        const json = await res.json();
        setData(json);

        if (json.school) {
          setSchoolStart(json.school.startTime || '08:30');
          setSchoolEnd(json.school.endTime || '14:50');
        }

        // Initialize class subjects from seed logic
        const initialMap: Record<string, string[]> = {};
        json.classes.forEach((cls: any) => {
            // Apply heuristic default if possible
            const grade = cls.grade;
            let expectedNames: string[] = [];
            if (grade >= 1 && grade <= 5) {
                expectedNames = ['English', 'Hindi', 'Maths', 'Social Science', 'Science', 'IT', 'Computer', 'Punjabi', 'Sanskrit', 'Games', 'Yoga', 'Music', 'Dance'];
            } else if (grade >= 6 && grade <= 8) {
                expectedNames = ['English', 'Hindi', 'Maths', 'Social Science', 'Science', 'Punjabi', 'Sanskrit', 'IT', 'Computer', 'Games', 'Yoga', 'Music', 'Dance'];
            } else {
                expectedNames = ['English', 'Hindi', 'Maths', 'Social Science', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Games', 'Yoga', 'Music', 'Dance'];
            }
            const defaultSubjects = json.subjects
                .filter((s: any) => expectedNames.includes(s.name))
                .map((s: any) => s.id);
            
            initialMap[cls.id] = defaultSubjects;
        });
        setClassSubjects(initialMap);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const toggleSubject = (clsId: string, subId: string) => {
    setClassSubjects(prev => {
      const list = prev[clsId] || [];
      if (list.includes(subId)) {
        return { ...prev, [clsId]: list.filter(id => id !== subId) };
      } else {
        return { ...prev, [clsId]: [...list, subId] };
      }
    });
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError('');
      setSuccess('');
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      
      const payload = {
        schoolStartTime: schoolStart,
        schoolEndTime: schoolEnd,
        lunchStartTime: lunchStart,
        lunchEndTime: lunchEnd,
        classSubjects
      };

      const res = await fetch(`${apiUrl}/api/timetable/generate`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to generate');
      
      setSuccess(`Timetable generated successfully! Generated ${json.count} slots.`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="text-gray-500">Loading configuration data...</div>;
  if (!data) return <div className="text-red-500">Error loading data.</div>;

  return (
    <div className="space-y-8">
      
      {/* Timings */}
      <section className="bg-white p-6 border border-gray-200 rounded-sm shadow-sm">
        <h3 className="text-lg font-medium mb-4 text-gray-900 border-b pb-2">School Timings</h3>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">School Start</label>
            <input type="time" value={schoolStart} onChange={e => setSchoolStart(e.target.value)} className="w-full border-gray-300 rounded-sm p-2 text-sm focus:border-gray-500 focus:ring-gray-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">School End</label>
            <input type="time" value={schoolEnd} onChange={e => setSchoolEnd(e.target.value)} className="w-full border-gray-300 rounded-sm p-2 text-sm focus:border-gray-500 focus:ring-gray-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Lunch Start</label>
            <input type="time" value={lunchStart} onChange={e => setLunchStart(e.target.value)} className="w-full border-gray-300 rounded-sm p-2 text-sm focus:border-gray-500 focus:ring-gray-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Lunch End</label>
            <input type="time" value={lunchEnd} onChange={e => setLunchEnd(e.target.value)} className="w-full border-gray-300 rounded-sm p-2 text-sm focus:border-gray-500 focus:ring-gray-500" />
          </div>
        </div>
      </section>

      {/* Per Class Subjects */}
      <section className="bg-white p-6 border border-gray-200 rounded-sm shadow-sm">
        <h3 className="text-lg font-medium mb-4 text-gray-900 border-b pb-2">Per-Class Subject Assignment</h3>
        <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2">
          {data.classes.filter(c => c.section !== 'LOUNGE').map(cls => (
            <div key={cls.id} className="border border-gray-100 p-4 rounded-sm bg-gray-50">
              <h4 className="font-medium text-gray-800 mb-3">Class {cls.grade}-{cls.section}</h4>
              <div className="flex flex-wrap gap-2">
                {data.subjects.filter(s => s.name !== 'Leisure').map(sub => {
                  const isSelected = (classSubjects[cls.id] || []).includes(sub.id);
                  return (
                    <label key={sub.id} className={`flex items-center space-x-2 px-3 py-1.5 rounded border text-sm cursor-pointer transition-colors ${isSelected ? 'bg-gray-800 border-gray-800 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => toggleSubject(cls.id, sub.id)}
                        className="hidden"
                      />
                      <span>{sub.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Teacher Summary (Read-Only) */}
      <section className="bg-white p-6 border border-gray-200 rounded-sm shadow-sm">
        <h3 className="text-lg font-medium mb-4 text-gray-900 border-b pb-2">Teacher Assignment Summary (Read-Only)</h3>
        <div className="max-h-[250px] overflow-y-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 sticky top-0 shadow-sm">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-700 border-b">Teacher Name</th>
                <th className="px-4 py-3 font-medium text-gray-700 border-b">Assigned Subjects</th>
                <th className="px-4 py-3 font-medium text-gray-700 border-b">Target Classes (JSON)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.teachers.map(t => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">{t.name}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.subjects.map((ts: any) => data.subjects.find(s => s.id === ts.subjectId)?.name).join(', ')}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs font-mono break-all">
                    {t.assignedClasses}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Labs Summary (Read-Only) */}
      <section className="bg-white p-6 border border-gray-200 rounded-sm shadow-sm">
        <h3 className="text-lg font-medium mb-4 text-gray-900 border-b pb-2">Lab Summary (Read-Only)</h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {data.labs.map(l => (
            <li key={l.id} className="p-4 bg-gray-50 border border-gray-200 rounded-sm text-sm">
              <span className="font-medium text-gray-900 block mb-1">{l.name}</span> 
              <span className="text-gray-500">{l.type.toUpperCase()} - Capacity: {l.capacity}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Action Bar */}
      <div className="flex flex-col items-end space-y-4 pt-4 border-t border-gray-200">
        {error && <div className="text-red-700 bg-red-50 px-4 py-3 rounded-sm border border-red-200 w-full text-sm font-medium">{error}</div>}
        {success && (
          <div className="text-green-800 bg-green-50 px-4 py-4 rounded-sm border border-green-200 w-full flex justify-between items-center shadow-sm">
            <span className="font-medium">{success}</span>
            <button onClick={() => navigate('/timetable')} className="text-sm font-semibold underline text-green-700 hover:text-green-900">
              View Generated Timetable &rarr;
            </button>
          </div>
        )}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className={`px-8 py-3 rounded-sm text-white font-medium shadow-sm transition-all ${
            generating ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800 hover:shadow-md'
          }`}
        >
          {generating ? 'Engine Running (10-25s)...' : 'Generate Timetable'}
        </button>
      </div>

    </div>
  );
};

export default TimetableGeneratorForm;
