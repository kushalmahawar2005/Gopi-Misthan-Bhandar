'use client';

import React from 'react';

interface TableSkeletonProps {
  columns: number;
  rows?: number;
}

export default function TableSkeleton({ columns, rows = 10 }: TableSkeletonProps) {
  return (
    <div className="animate-pulse">
      {/* Desktop Table Skeleton */}
      <div className="hidden md:block">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 flex gap-4">
            {Array.from({ length: columns }).map((_, i) => (
              <div key={i} className="h-3 bg-gray-200 rounded flex-1" />
            ))}
          </div>
          {/* Rows */}
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="px-6 py-4 flex gap-4 border-b border-gray-100 last:border-b-0"
            >
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div
                  key={colIndex}
                  className="h-4 bg-gray-100 rounded flex-1"
                  style={{ maxWidth: colIndex === 0 ? '120px' : undefined }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Cards Skeleton */}
      <div className="block md:hidden space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
              <div className="h-8 w-8 bg-gray-100 rounded" />
            </div>
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
