import { useState } from 'react';

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'homework' | 'notes'>('attendance');
  const [selectedClass, setSelectedClass] = useState('10-A');
  const [attendance, setAttendance] = useState<{ [key: string]: 'Present' | 'Absent' | null }>({});

  const students = [
    { id: '1', name: 'Alice Smith' },
    { id: '2', name: 'Bob Johnson' },
    { id: '3', name: 'Charlie Brown' },
  ];

  const handleAttendanceChange = (studentId: string, status: 'Present' | 'Absent') => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  return (
    <div className="max-w-6xl mx-auto p-8 bg-gray-50 min-h-screen text-gray-800 font-sans">
      <header className="mb-8">
        <h1 className="text-3xl font-light text-gray-900 tracking-tight">Teacher Portal</h1>
        <p className="text-gray-500 mt-2">Manage your classes, attendance, and materials.</p>
      </header>

      {/* Tabs */}
      <div className="flex space-x-6 border-b border-gray-200 mb-8">
        {['attendance', 'homework', 'notes'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-3 text-sm font-medium uppercase tracking-wider ${
              activeTab === tab
                ? 'border-b-2 border-gray-800 text-gray-900'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white shadow-sm border border-gray-100 rounded-sm p-6">
        {activeTab === 'attendance' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium">Mark Attendance</h2>
              <select 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
                className="border-gray-300 rounded-sm text-sm focus:ring-gray-500 focus:border-gray-500"
              >
                <option value="10-A">Class 10-A (Science)</option>
                <option value="9-B">Class 9-B (Maths)</option>
              </select>
            </div>
            
            <div className="divide-y divide-gray-100">
              {students.map(student => (
                <div key={student.id} className="py-4 flex justify-between items-center">
                  <span className="text-gray-700">{student.name}</span>
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => handleAttendanceChange(student.id, 'Present')}
                      className={`px-4 py-1 text-sm rounded-sm transition-colors ${
                        attendance[student.id] === 'Present' 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Present
                    </button>
                    <button 
                      onClick={() => handleAttendanceChange(student.id, 'Absent')}
                      className={`px-4 py-1 text-sm rounded-sm transition-colors ${
                        attendance[student.id] === 'Absent' 
                          ? 'bg-red-600 text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Absent
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex justify-end">
              <button className="bg-gray-800 text-white px-6 py-2 rounded-sm text-sm hover:bg-gray-700 transition-colors">
                Save Attendance
              </button>
            </div>
          </div>
        )}

        {activeTab === 'homework' && (
          <div>
            <h2 className="text-xl font-medium mb-6">Assign Homework</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
                <select className="w-full border-gray-300 rounded-sm text-sm focus:ring-gray-500 focus:border-gray-500">
                  <option>10-A</option>
                  <option>9-B</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" className="w-full border-gray-300 rounded-sm text-sm focus:ring-gray-500 focus:border-gray-500" placeholder="e.g. Chapter 4 Exercises" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={4} className="w-full border-gray-300 rounded-sm text-sm focus:ring-gray-500 focus:border-gray-500" placeholder="Details..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input type="date" className="w-full border-gray-300 rounded-sm text-sm focus:ring-gray-500 focus:border-gray-500" />
              </div>
              <div className="flex justify-end pt-4">
                <button className="bg-gray-800 text-white px-6 py-2 rounded-sm text-sm hover:bg-gray-700 transition-colors">
                  Assign
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div>
            <h2 className="text-xl font-medium mb-6">Upload Notes to Knowledge Base</h2>
            <p className="text-sm text-gray-500 mb-6">These notes will be ingested by the AI Tutor to help students.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topic / Title</label>
                <input type="text" className="w-full border-gray-300 rounded-sm text-sm focus:ring-gray-500 focus:border-gray-500" placeholder="e.g. Newton's Laws of Motion" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea rows={6} className="w-full border-gray-300 rounded-sm text-sm focus:ring-gray-500 focus:border-gray-500" placeholder="Paste study material here..."></textarea>
              </div>
              <div className="flex justify-end pt-4">
                <button className="bg-gray-800 text-white px-6 py-2 rounded-sm text-sm hover:bg-gray-700 transition-colors">
                  Upload to AI Tutor
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
