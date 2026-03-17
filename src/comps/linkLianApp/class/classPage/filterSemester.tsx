// ─────────────────────────────────────────────
// comps/linkLianApp/class/FilterSemester.tsx
// Dropdown เลือก semester
// id convention: fs-{element}
// ─────────────────────────────────────────────

import React from 'react';
import { SemesterOption } from '@/hooks/social-feed/useClassfeed';
import { useDropdown } from '@/hooks/useDropdown';

interface FilterSemesterProps {
    semesters: SemesterOption[];
    activeSemesterId: number | null;
    onChange: (semesterId: number) => void;
    isLoading?: boolean;
}

export default function FilterSemester({
    semesters,
    activeSemesterId,
    onChange,
    isLoading = false,
}: FilterSemesterProps) {
    const { ref, open, setOpen } = useDropdown<HTMLDivElement>();
    const active = semesters.find((s) => s.semester_id === activeSemesterId);

    return (
        <div id="fs-wrapper" ref={ref} className="relative">
            {/* Trigger button */}
            <button
                id="fs-trigger"
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                disabled={isLoading}
                className="flex items-center gap-2 rounded-full border border-[#FFBC81] bg-[#FFF2DD] px-3.5 py-1.5 text-sm font-medium text-[#B7552B] transition-colors duration-200 hover:bg-[#FFE3BB] disabled:opacity-50"
            >
                {isLoading ? (
                    <span
                        id="fs-spinner"
                        className="h-4 w-4 animate-spin rounded-full border-2 border-[#FFBC81] border-t-[#DB763F]"
                    />
                ) : (
                    <svg className="h-3.5 w-3.5 text-[#DB763F]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                )}
                <span id="fs-label">
                    {activeSemesterId && active
                        ? `ภาคเรียน ${active.semester}`
                        : 'เลือกภาคเรียน'}
                </span>
                <svg
                    id="fs-chevron"
                    className={`h-3.5 w-3.5 text-[#DB763F] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown list */}
            {open && semesters.length > 0 && (
                <ul
                    id="fs-dropdown"
                    role="listbox"
                    aria-label="semester options"
                    className="absolute right-0 top-full z-50 mt-2 min-w-[160px] overflow-hidden rounded-2xl border border-[#FFE3BB] bg-white shadow-lg"
                >
                    {semesters.map((s) => {
                        const isActive = s.semester_id === activeSemesterId;
                        return (
                            <li key={s.semester_id} role="option" aria-selected={isActive}>
                                <button
                                    id={`fs-option-${s.semester_id}`}
                                    onClick={() => {
                                        onChange(s.semester_id);
                                        setOpen(false);
                                    }}
                                    className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-sm transition-colors duration-150 ${isActive
                                            ? 'bg-[#FFF2DD] font-semibold text-[#B7552B]'
                                            : 'text-gray-700 hover:bg-[#FFF2DD]'
                                        }`}
                                >
                                    <span id={`fs-option-label-${s.semester_id}`}>
                                        ภาคเรียน {s.semester}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        {s.status === 'open' && (
                                            <span
                                                id={`fs-option-open-badge-${s.semester_id}`}
                                                className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"
                                            >
                                                เปิด
                                            </span>
                                        )}
                                        {isActive && (
                                            <svg
                                                id={`fs-option-check-${s.semester_id}`}
                                                className="h-4 w-4 text-[#DB763F]"
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
                                    </div>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
