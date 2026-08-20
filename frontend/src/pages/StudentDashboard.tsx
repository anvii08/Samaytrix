import { useState } from 'react';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'attendance' | 'homework' | 'notices' | 'fees'>('dashboard');

  return (
    <div className="max-w-6xl mx-auto p-8 bg-gray-50 min-h-screen text-gray-800 font-sans">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-light text-gray-900 tracking-tight">Student Portal</h1>
          <p className="text-gray-500 mt-2">Welcome back, Student 123.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Class: 10-A</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex space-x-6 border-b border-gray-200 mb-8 overflow-x-auto">
        {['dashboard', 'attendance', 'homework', 'notices', 'fees'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-3 text-sm font-medium uppercase tracking-wider whitespace-nowrap ${
              activeTab === tab
                ? 'border-b-2 border-gray-800 text-gray-900'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white shadow-sm border border-gray-100 rounded-sm p-6 min-h-[400px]">
        {activeTab === 'dashboard' && (
          <div>
            <h2 className="text-xl font-medium mb-6">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-gray-100 p-6 rounded-sm bg-gray-50">
                <p className="text-sm text-gray-500 mb-2">Today's Attendance</p>
                <p className="text-2xl text-green-600 font-light">Present</p>
              </div>
              <div className="border border-gray-100 p-6 rounded-sm bg-gray-50">
                <p className="text-sm text-gray-500 mb-2">Pending Homework</p>
                <p className="text-2xl text-gray-900 font-light">2 Tasks</p>
              </div>
              <div className="border border-gray-100 p-6 rounded-sm bg-gray-50">
                <p className="text-sm text-gray-500 mb-2">Fee Status</p>
                <p className="text-2xl text-gray-900 font-light">Paid</p>
              </div>
            </div>

            <div className="mt-10">
              <h3 className="text-lg font-medium mb-4">AI Tutor Assistant</h3>
              <div className="bg-gray-50 border border-gray-200 p-6 rounded-sm">
                <div className="h-40 border border-gray-200 bg-white p-4 overflow-y-auto mb-4 text-sm text-gray-600">
                  <p><strong>AI:</strong> Hello! Ask me any question based on the notes your teachers have uploaded.</p>
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder="Ask a question..." className="flex-1 border-gray-300 rounded-sm text-sm focus:ring-gray-500 focus:border-gray-500" />
                  <button className="bg-gray-800 text-white px-4 py-2 rounded-sm text-sm hover:bg-gray-700">Ask</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div>
            <h2 className="text-xl font-medium mb-6">Attendance Record</h2>
            <div className="divide-y divide-gray-100">
              {[
                { date: '2026-08-20', status: 'Present' },
                { date: '2026-08-19', status: 'Present' },
                { date: '2026-08-18', status: 'Absent' },
              ].map((record, i) => (
                <div key={i} className="py-4 flex justify-between items-center">
                  <span className="text-gray-700">{record.date}</span>
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    record.status === 'Present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {record.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'homework' && (
          <div>
            <h2 className="text-xl font-medium mb-6">Homework & Notes</h2>
            <div className="space-y-4">
              <div className="border border-gray-200 p-4 rounded-sm flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900">Chapter 4 Exercises (Physics)</h4>
                  <p className="text-sm text-gray-500 mt-1">Due: Tomorrow</p>
                </div>
                <button className="text-sm text-gray-600 hover:text-gray-900 border border-gray-300 px-3 py-1 rounded-sm">View</button>
              </div>
              <div className="border border-gray-200 p-4 rounded-sm flex justify-between items-center bg-gray-50">
                <div>
                  <h4 className="font-medium text-gray-900">Newton's Laws Notes (Physics)</h4>
                  <p className="text-sm text-gray-500 mt-1">Uploaded: Yesterday</p>
                </div>
                <button className="text-sm text-gray-600 hover:text-gray-900 border border-gray-300 px-3 py-1 rounded-sm bg-white">Read</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notices' && (
          <div>
            <h2 className="text-xl font-medium mb-6">School Notices</h2>
            <div className="space-y-6">
              <div className="border-l-2 border-gray-800 pl-4">
                <h4 className="font-medium text-gray-900">Annual Sports Day</h4>
                <p className="text-sm text-gray-600 mt-2">The Annual Sports Day will be held on September 15th. Please register for events with your class teacher.</p>
                <p className="text-xs text-gray-400 mt-2">Posted on: Aug 18, 2026</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'fees' && (
          <div>
            <h2 className="text-xl font-medium mb-6">Fee Management</h2>
            <div className="border border-gray-200 p-6 rounded-sm bg-gray-50 flex justify-between items-center">
              <div>
                <h4 className="text-gray-700">Q3 Tuition Fee</h4>
                <p className="text-2xl font-light text-gray-900 mt-1">$500.00</p>
                <p className="text-sm text-gray-500 mt-1">Due by: Sep 1, 2026</p>
              </div>
              <button className="bg-gray-800 text-white px-6 py-2 rounded-sm text-sm hover:bg-gray-700 transition-colors">
                Pay Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
