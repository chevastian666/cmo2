import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const CriticalAlertsSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-gray-600" />
          <div className="h-6 w-32 bg-gray-800 rounded" />
        </div>
        <div className="h-4 w-16 bg-gray-800 rounded" />
      </div>

      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-lg border-2 border-gray-800 bg-gray-900/50">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-5 h-5 bg-gray-700 rounded mt-0.5" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-24 bg-gray-700 rounded" />
                    <div className="h-3 w-16 bg-gray-800 rounded" />
                  </div>
                  <div className="h-4 w-full bg-gray-800 rounded" />
                  <div className="h-3 w-32 bg-gray-800 rounded" />
                </div>
              </div>
              <div className="h-8 w-20 bg-gray-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AlertItemSkeleton: React.FC = () => {
  return (
    <div className="p-4 rounded-lg border-2 border-gray-800 bg-gray-900/50 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-5 h-5 bg-gray-700 rounded mt-0.5" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-4 w-24 bg-gray-700 rounded" />
              <div className="h-3 w-16 bg-gray-800 rounded" />
            </div>
            <div className="h-4 w-full bg-gray-800 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};