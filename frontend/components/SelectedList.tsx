'use client';

import { useState, useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ApiClient } from '@/lib/api';
import SortableItem from './SortableItem';

interface SelectedListProps {
  onDeselect: (id: number) => void;
  refreshTrigger: number;
}

export default function SelectedList({ onDeselect, refreshTrigger }: SelectedListProps) {
  const [elements, setElements] = useState<number[]>([]);
  const [allElements, setAllElements] = useState<number[]>([]);
  const [displayElements, setDisplayElements] = useState<number[]>([]);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { ref, inView } = useInView({
    threshold: 0,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const ITEMS_PER_PAGE = 20;

  const loadElements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await ApiClient.getSelected(1, 1000000);
      setAllElements(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load selected elements');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadElements();
  }, [loadElements, refreshTrigger]);

  useEffect(() => {
    let filtered = allElements;

    if (filter) {
      const filterStr = filter.toLowerCase();
      filtered = allElements.filter(id => id.toString().includes(filterStr));
    }

    setElements(filtered);
    setPage(1);
  }, [allElements, filter]);

  useEffect(() => {
    const endIndex = page * ITEMS_PER_PAGE;
    setDisplayElements(elements.slice(0, endIndex));
  }, [elements, page]);

  useEffect(() => {
    if (inView && !loading && displayElements.length < elements.length) {
      setPage(prev => prev + 1);
    }
  }, [inView, loading, displayElements.length, elements.length]);

  const handleDeselect = async (id: number) => {
    try {
      await ApiClient.deselectElement(id);
      onDeselect(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deselect element');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = allElements.indexOf(Number(active.id));
    const newIndex = allElements.indexOf(Number(over.id));

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const newOrder = arrayMove(allElements, oldIndex, newIndex);
    setAllElements(newOrder);

    try {
      await ApiClient.updateSortOrder(newOrder);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update sort order');
      setAllElements(allElements);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold mb-3">Selected Elements</h2>
        <input
          type="text"
          placeholder="Filter by ID..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={displayElements}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {displayElements.map((id) => (
                <SortableItem
                  key={id}
                  id={id}
                  onDeselect={handleDeselect}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        )}

        {!loading && displayElements.length < elements.length && (
          <div ref={ref} className="h-10" />
        )}

        {!loading && elements.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No elements selected
          </div>
        )}
      </div>
    </div>
  );
}
