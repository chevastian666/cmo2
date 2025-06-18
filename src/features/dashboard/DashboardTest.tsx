/**
 * Simple test component for dashboard
 * By Cheva
 */

import React from 'react';

const DashboardTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <h1 className="text-3xl font-bold text-white mb-6">Dashboard Test</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl text-white mb-2">Widget 1</h2>
          <p className="text-gray-400">Test content</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl text-white mb-2">Widget 2</h2>
          <p className="text-gray-400">Test content</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl text-white mb-2">Widget 3</h2>
          <p className="text-gray-400">Test content</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardTest;