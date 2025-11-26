'use client';

import { useState, useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { ApiClient } from '@/lib/api';

interface UnselectedListProps {
  onSelect: (id: number) => void;
  refreshTrigger: number;
}

export default function UnselectedList({ onSelect, refreshTrigger }: UnselectedListProps) {
  const [elements, setElements] = useState<number[]>([]);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { ref, inView } = useInView({
    threshold: 0,
  });

  const loadElements = useCallback(async (pageNum: number, filterValue: string, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const response = await ApiClient.getElements(pageNum, 20, filterValue || undefined);

      if (append) {
        setElements(prev => [...prev, ...response.data]);
      } else {
        setElements(response.data);
      }

      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load elements');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    loadElements(1, filter, false);
  }, [filter, loadElements, refreshTrigger]);

  useEffect(() => {
    if (inView && !loading && page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadElements(nextPage, filter, true);
    }
  }, [inView, loading, page, totalPages, filter, loadElements]);

  const handleSelect = async (id: number) => {
    try {
      await ApiClient.selectElement(id);
      onSelect(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to select element');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold mb-3">All Elements</h2>
        <input
          type="text"
          placeholder="Filter by ID..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-2">
          {elements.map((id) => (
            <div
              key={id}
              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
            >
              <span className="font-mono">ID: {id}</span>
              <button
                onClick={() => handleSelect(id)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
              >
                Select
              </button>
            </div>
          ))}
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {!loading && page < totalPages && (
          <div ref={ref} className="h-10" />
        )}

        {!loading && elements.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No elements found
          </div>
        )}
      </div>
    </div>
  );
}
