'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
  id: number;
  onDeselect: (id: number) => void;
}

export default function SortableItem({ id, onDeselect }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
      onClick={() => onDeselect(id)}
    >
      <div className="flex items-center gap-3">
        <div
          className="cursor-move"
          {...attributes}
          {...listeners}
        >
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M4 8h16M4 16h16"></path>
          </svg>
        </div>
        <span className="font-mono">ID: {id}</span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDeselect(id);
        }}
        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
      >
        Remove
      </button>
    </div>
  );
}
