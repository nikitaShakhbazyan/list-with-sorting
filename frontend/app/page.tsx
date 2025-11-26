'use client';

import { useState, useEffect } from 'react';
import UnselectedList from '@/components/UnselectedList';
import SelectedList from '@/components/SelectedList';
import AddElement from '@/components/AddElement';

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Element Manager
        </h1>

        <AddElement onAdd={handleRefresh} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden h-[calc(100vh-250px)]">
            <UnselectedList
              onSelect={handleRefresh}
              refreshTrigger={refreshTrigger}
            />
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden h-[calc(100vh-250px)]">
            <SelectedList
              onDeselect={handleRefresh}
              refreshTrigger={refreshTrigger}
            />
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm text-gray-600">
          <p className="font-semibold mb-2">Instructions:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Click "Select" to move elements from left to right panel</li>
            <li>Click "Remove" to move elements back to left panel</li>
            <li>Drag and drop elements in the right panel to reorder (works with filtered list too)</li>
            <li>Use filter fields to search by ID</li>
            <li>Add new elements with custom IDs (processed every 10 seconds)</li>
            <li>Selection and sorting are automatically saved</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
