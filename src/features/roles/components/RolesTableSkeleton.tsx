import React from 'react';

export const RolesTableSkeleton: React.FC = () => {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <div className="animate-pulse">
        {/* Header */}
        <div className="bg-gray-900/50 border-b border-gray-700 p-6">
          <div className="flex items-center gap-4">
            <div className="w-32 h-6 bg-gray-700 rounded"></div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-1">
                <div className="w-24 h-4 bg-gray-700 rounded mx-auto mb-2"></div>
                <div className="w-16 h-5 bg-gray-700 rounded mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Rows */}
        {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
          <div key={row} className="border-b border-gray-700 p-6">
            <div className="flex items-center gap-4">
              <div className="w-32 h-5 bg-gray-700 rounded"></div>
              {[1, 2, 3, 4].map((col) => (
                <div key={col} className="flex-1 flex justify-center gap-2">
                  {[1, 2, 3, 4].map((perm) => (
                    <div key={perm} className="w-6 h-6 bg-gray-700 rounded"></div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const RoleCardSkeleton: React.FC = () => {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <div className="animate-pulse">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-gray-700 rounded"></div>
            <div className="w-32 h-6 bg-gray-700 rounded"></div>
          </div>
          <div className="w-5 h-5 bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );
};