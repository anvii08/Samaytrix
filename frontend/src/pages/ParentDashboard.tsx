import { useState } from 'react';

const ParentDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'fees'>('overview');

  return (
    <div className="max-w-6xl mx-auto p-8 bg-gray-50 min-h-screen text-gray-800 font-sans">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-light text-gray-900 tracking-tight">Parent Portal</h1>
          <p className="text-gray-500 mt-2">Welcome, Parent of Student 123.</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex space-x-6 border-b border-gray-200 mb-8 overflow-x-auto">
        {['overview', 'attendance', 'fees'].map((tab) => (
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
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-xl font-medium mb-6">Student Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="border border-gray-100 p-6 rounded-sm bg-gray-50 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Overall Attendance</p>
                  <p className="text-2xl text-gray-900 font-light">95%</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-800 font-medium text-sm">Good</span>
                </div>
              </div>
              <div className="border border-gray-100 p-6 rounded-sm bg-gray-50 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Pending Fees</p>
                  <p className="text-2xl text-gray-900 font-light">$0.00</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-600 font-medium text-sm">Clear</span>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-medium mb-4">Recent Notices</h3>
            <div className="border-l-2 border-gray-800 pl-4 mb-4">
              <h4 className="font-medium text-gray-900">Parent-Teacher Meeting</h4>
              <p className="text-sm text-gray-600 mt-2">The upcoming PTM is scheduled for September 5th. Please book your slots via the school app.</p>
              <p className="text-xs text-gray-400 mt-2">Posted on: Aug 19, 2026</p>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div>
            <h2 className="text-xl font-medium mb-6">Attendance Record (Student 123)</h2>
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

        {activeTab === 'fees' && (
          <div>
            <h2 className="text-xl font-medium mb-6">Fee History</h2>
            <div className="space-y-4">
              <div className="border border-gray-200 p-4 rounded-sm flex justify-between items-center bg-gray-50">
                <div>
                  <h4 className="font-medium text-gray-900">Q2 Tuition Fee</h4>
                  <p className="text-sm text-gray-500 mt-1">Paid on: Jun 1, 2026</p>
                </div>
                <span className="text-sm font-medium text-gray-900">$500.00</span>
              </div>
              <div className="border border-gray-200 p-4 rounded-sm flex justify-between items-center bg-gray-50">
                <div>
                  <h4 className="font-medium text-gray-900">Q1 Tuition Fee</h4>
                  <p className="text-sm text-gray-500 mt-1">Paid on: Mar 1, 2026</p>
                </div>
                <span className="text-sm font-medium text-gray-900">$500.00</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;
