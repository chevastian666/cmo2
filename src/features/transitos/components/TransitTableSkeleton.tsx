import React from 'react';

export const TransitTableSkeleton: React.FC = () => {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900/50 border-b border-gray-700">
            <tr>
              {Array.from({ length: 9 }).map((_, i) => (
                <th key={i} className="px-4 py-3 text-left">
                  <div className="h-4 bg-gray-700 rounded animate-pulse w-20"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {Array.from({ length: 10 }).map((_, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-700/50 transition-colors">
                {Array.from({ length: 9 }).map((_, colIndex) => (
                  <td key={colIndex} className="px-4 py-3">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                      {colIndex === 2 && (
                        <div className="h-3 bg-gray-700 rounded animate-pulse w-16"></div>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="px-4 py-3 border-t border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-4 bg-gray-700 rounded animate-pulse w-48"></div>
          <div className="h-8 bg-gray-700 rounded animate-pulse w-32"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-8 bg-gray-700 rounded animate-pulse w-20"></div>
          <div className="flex gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-8 bg-gray-700 rounded animate-pulse w-8"></div>
            ))}
          </div>
          <div className="h-8 bg-gray-700 rounded animate-pulse w-20"></div>
        </div>
      </div>
    </div>
  );
};