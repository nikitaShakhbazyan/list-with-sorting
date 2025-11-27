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

      </div>
    </main>
  );
}
