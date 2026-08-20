import { useState } from 'react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'classes' | 'notices'>('notices');

  return (
    <div className="max-w-6xl mx-auto p-8 bg-gray-50 min-h-screen text-gray-800 font-sans">
      <header className="mb-8">
        <h1 className="text-3xl font-light text-gray-900 tracking-tight">Admin Portal</h1>
        <p className="text-gray-500 mt-2">Manage school operations and notices.</p>
      </header>

      {/* Tabs */}
      <div className="flex space-x-6 border-b border-gray-200 mb-8 overflow-x-auto">
        {['users', 'classes', 'notices'].map((tab) => (
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
        {activeTab === 'users' && (
          <div>
            <h2 className="text-xl font-medium mb-6">User Management</h2>
            <p className="text-gray-500 text-sm">User CRUD interface will go here.</p>
          </div>
        )}

        {activeTab === 'classes' && (
          <div>
            <h2 className="text-xl font-medium mb-6">Class Management</h2>
            <p className="text-gray-500 text-sm">Class and timetable management interface will go here.</p>
          </div>
        )}

        {activeTab === 'notices' && (
          <div>
            <h2 className="text-xl font-medium mb-6">Notice Management</h2>
            
            <div className="bg-gray-50 p-6 rounded-sm border border-gray-200 mb-8">
              <h3 className="text-lg font-medium mb-4">Create New Notice</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input type="text" className="w-full border-gray-300 rounded-sm text-sm focus:ring-gray-500 focus:border-gray-500" placeholder="e.g. Exam Schedule Published" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea rows={4} className="w-full border-gray-300 rounded-sm text-sm focus:ring-gray-500 focus:border-gray-500" placeholder="Notice details..."></textarea>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                    <select className="w-full border-gray-300 rounded-sm text-sm focus:ring-gray-500 focus:border-gray-500">
                      <option>All Users</option>
                      <option>Students & Parents</option>
                      <option>Teachers Only</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Publish Date</label>
                    <input type="date" className="w-full border-gray-300 rounded-sm text-sm focus:ring-gray-500 focus:border-gray-500" />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <button className="bg-gray-800 text-white px-6 py-2 rounded-sm text-sm hover:bg-gray-700 transition-colors">
                    Publish Notice
                  </button>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-medium mb-4">Active Notices</h3>
            <div className="space-y-4">
              <div className="border border-gray-200 p-4 rounded-sm flex justify-between items-center">
                <div>
                  <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-sm mb-2 inline-block">All Users</span>
                  <h4 className="font-medium text-gray-900">Annual Sports Day</h4>
                  <p className="text-sm text-gray-500 mt-1">Published: Aug 18, 2026</p>
                </div>
                <div className="flex space-x-2">
                  <button className="text-sm text-gray-600 hover:text-gray-900 border border-gray-300 px-3 py-1 rounded-sm">Edit</button>
                  <button className="text-sm text-red-600 hover:text-red-800 border border-red-200 px-3 py-1 rounded-sm">Delete</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
