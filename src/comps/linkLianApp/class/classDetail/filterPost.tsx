// ─────────────────────────────────────────────
// comps/linkLianApp/class/FilterPost.tsx
// Pill dropdown กรอง post type
// id convention: fp-{element}
// ─────────────────────────────────────────────

import React from 'react';
import { PostType } from '@/utils/interface/class.types';
import { POST_TYPE_LABEL } from '@/utils/function/classHelper';
import { useDropdown } from '@/hooks/useDropdown';

export type FilterPostOption = PostType | 'all';

interface FilterPostProps {
  value: FilterPostOption;
  onChange: (value: FilterPostOption) => void;
}

const OPTIONS: { value: FilterPostOption; label: string; color: string }[] = [
  { value: 'all',          label: 'ทั้งหมด',                      color: 'text-gray-700'  },
  { value: 'announcement', label: POST_TYPE_LABEL.announcement,   color: 'text-amber-700' },
  { value: 'assignment',   label: POST_TYPE_LABEL.assignment,     color: 'text-blue-700'  },
  { value: 'question',     label: POST_TYPE_LABEL.question,       color: 'text-green-700' },
];

export default function FilterPost({ value, onChange }: FilterPostProps) {
  const { ref, open, setOpen } = useDropdown<HTMLDivElement>();
  const active = OPTIONS.find((o) => o.value === value) ?? OPTIONS[0];

  return (
    <div id="fp-wrapper" ref={ref} className="relative">
      {/* Trigger */}
      <button
        id="fp-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full bg-amber-200/80 px-4 py-2 text-sm font-medium text-amber-900 transition-colors duration-200 hover:bg-amber-300/80"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
        </svg>
        <span id="fp-label">{active.label}</span>
        <svg
          id="fp-chevron"
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <ul
          id="fp-dropdown"
          role="listbox"
          aria-label="post type filter options"
          className="absolute left-0 top-full z-50 mt-2 min-w-[130px] overflow-hidden rounded-2xl border border-amber-200/60 bg-white shadow-xl shadow-amber-100/50"
        >
          {OPTIONS.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <li key={opt.value} role="option" aria-selected={isSelected}>
                <button
                  id={`fp-option-${opt.value}`}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors duration-150 ${
                    isSelected ? 'bg-amber-50 font-semibold' : 'hover:bg-amber-50/50'
                  } ${opt.color}`}
                >
                  <span id={`fp-option-label-${opt.value}`}>{opt.label}</span>
                  {isSelected && (
                    <svg
                      id={`fp-option-check-${opt.value}`}
                      className="h-4 w-4 text-amber-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
