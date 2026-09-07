'use client';

import React from 'react';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Alert Banner Skeleton */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-200" />
          <div className="space-y-2">
            <div className="h-4 w-48 bg-slate-200 rounded" />
            <div className="h-3 w-72 bg-slate-200/80 rounded" />
          </div>
        </div>
        <div className="h-8 w-28 bg-slate-200 rounded-lg hidden sm:block" />
      </div>

      {/* 6 KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="h-3 w-20 bg-slate-200 rounded" />
              <div className="w-8 h-8 rounded-lg bg-slate-100" />
            </div>
            <div className="h-8 w-16 bg-slate-200 rounded mb-2.5" />
            <div className="h-2.5 w-full bg-slate-100 rounded border-t border-slate-100 pt-2" />
          </div>
        ))}
      </div>

      {/* Charts & Leaderboard Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Chart Skeleton (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-[360px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-1.5">
                <div className="h-4 w-44 bg-slate-200 rounded" />
                <div className="h-3 w-64 bg-slate-100 rounded" />
              </div>
              <div className="h-7 w-28 bg-slate-100 rounded-lg" />
            </div>
            <div className="h-10 w-full bg-slate-50 rounded-xl mb-4" />
          </div>

          {/* Bar Chart Bars Placeholder */}
          <div className="flex items-end justify-between gap-4 h-44 px-4 pb-2 border-b border-slate-100">
            {[45, 80, 60, 95, 70, 50, 85].map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-slate-100 rounded-t-md"
                  style={{ height: `${val}%` }}
                />
                <div className="h-2.5 w-8 bg-slate-100 rounded" />
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-2">
            <div className="h-3 w-32 bg-slate-100 rounded" />
            <div className="h-3 w-24 bg-slate-100 rounded" />
          </div>
        </div>

        {/* Right Leaderboard Skeleton (1 Col) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-[360px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-1.5">
                <div className="h-4 w-36 bg-slate-200 rounded" />
                <div className="h-3 w-48 bg-slate-100 rounded" />
              </div>
              <div className="w-8 h-8 rounded-lg bg-slate-100" />
            </div>

            {/* List of 4 skeleton driver items */}
            <div className="space-y-2.5">
              {[...Array(4)].map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-slate-200" />
                    <div className="w-7 h-7 rounded-full bg-slate-200" />
                    <div className="space-y-1">
                      <div className="h-3 w-24 bg-slate-200 rounded" />
                      <div className="h-2.5 w-16 bg-slate-100 rounded" />
                    </div>
                  </div>
                  <div className="h-3 w-10 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          </div>

          <div className="h-3 w-full bg-slate-100 rounded" />
        </div>
      </div>
    </div>
  );
};
