'use client';

import { useState } from 'react';
import { ApiClient } from '@/lib/api';

interface AddElementProps {
  onAdd: () => void;
}

export default function AddElement({ onAdd }: AddElementProps) {
  const [newId, setNewId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const id = parseInt(newId);

    if (isNaN(id)) {
      setError('Please enter a valid number');
      return;
    }

    try {
      setLoading(true);
      const response = await ApiClient.addElement(id);
      setSuccess(response.message || 'Element added to queue');
      setNewId('');

      setTimeout(() => {
        onAdd();
      }, 10500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add element');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border-b border-gray-200 bg-gray-50">
      <h3 className="text-lg font-semibold mb-3">Add New Element</h3>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="number"
          value={newId}
          onChange={(e) => setNewId(e.target.value)}
          placeholder="Enter ID..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !newId}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? 'Adding...' : 'Add'}
        </button>
      </form>

      {error && (
        <div className="mt-2 p-2 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-2 p-2 bg-green-100 text-green-700 rounded text-sm">
          {success}
        </div>
      )}
    </div>
  );
}
