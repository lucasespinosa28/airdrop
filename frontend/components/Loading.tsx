"use client";
import React from "react";

export function Loading() {
  return (
    <div className="animate-pulse bg-gray-400 border border-blue-200 shadow rounded-md p-4 w-full">
      <div className="animate-pulse flex space-x-4">
        <div className="flex-1 space-y-6">
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="h-2 bg-slate-700 rounded col-span-2"></div>
              <div className="h-2 bg-slate-700 rounded col-span-1"></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-2 bg-slate-700 rounded col-span-1"></div>
              <div className="h-2 bg-slate-700 rounded col-span-2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
