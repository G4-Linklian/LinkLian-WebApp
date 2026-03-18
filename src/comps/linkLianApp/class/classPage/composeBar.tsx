// ─────────────────────────────────────────────
// comps/linkLianApp/class/ComposerBar.tsx
// Composer bar สำหรับเลือกคลาสและเปิดสร้างโพสต์
// id convention: cb-{element}
// ─────────────────────────────────────────────

import React from 'react';
import { ClassFeedItem } from '@/utils/interface/class.types';
import { useDropdown } from '@/hooks/useDropdown';

type PostTarget = number | 'all' | null;

interface ComposerBarProps {
    classList: ClassFeedItem[];
    postTarget: PostTarget;
    onTargetChange: (target: PostTarget) => void;
    onOpenCreate: () => void;
}

export default function ComposerBar({
    classList,
    postTarget,
    onTargetChange,
    onOpenCreate,
}: ComposerBarProps) {
    const { ref: dropdownRef, open: showDropdown, setOpen: setShowDropdown } =
        useDropdown<HTMLDivElement>();

    const postTargetLabel = (() => {
        if (postTarget === 'all') return 'โพสต์ทุกคลาส';
        if (!postTarget) return 'เลือกคลาส';
        const current = classList.find((item) => item.section_id === postTarget);
        return current ? `${current.subject_name_th} • ${current.display_class_name}` : 'เลือกคลาส';
    })();

    return (
        <div id="cb-wrapper" className="mb-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                {/* Class selector */}
                <div ref={dropdownRef} className="relative w-full md:w-[260px]">
                    <button
                        id="cb-class-select-trigger"
                        aria-haspopup="listbox"
                        aria-expanded={showDropdown}
                        onClick={() => setShowDropdown((prev) => !prev)}
                        className="flex h-10 w-full items-center justify-between rounded-xl border border-[#FFBC81] bg-[#FFF2DD] px-3 text-xs font-medium text-[#B7552B] transition-colors hover:bg-[#FFE3BB]"
                    >
                        <span className="truncate">{postTargetLabel}</span>
                        <svg
                            className={`h-4 w-4 text-[#DB763F] transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.5}
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {showDropdown && (
                        <ul
                            id="cb-class-select-menu"
                            role="listbox"
                            aria-label="class options"
                            className="absolute left-0 right-0 top-[44px] z-20 rounded-xl border border-[#FFE3BB] bg-white p-1 shadow-lg"
                        >
                            {/* ตัวเลือก: โพสต์ทุกคลาส */}
                            <li role="option" aria-selected={postTarget === 'all'}>
                                <button
                                    id="cb-class-option-all"
                                    onClick={() => {
                                        onTargetChange('all');
                                        setShowDropdown(false);
                                    }}
                                    className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                                        postTarget === 'all'
                                            ? 'bg-[#FFF2DD] font-semibold text-[#B7552B]'
                                            : 'text-gray-700 hover:bg-[#FFF2DD]'
                                    }`}
                                >
                                    {postTarget === 'all' && (
                                        <svg className="mr-1.5 h-3.5 w-3.5 text-[#DB763F]" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                    โพสต์ทุกคลาส
                                </button>
                            </li>

                            {/* ตัวเลือก: แต่ละคลาส */}
                            {classList.map((item) => {
                                const selected = postTarget === item.section_id;
                                return (
                                    <li key={item.section_id} role="option" aria-selected={selected}>
                                        <button
                                            id={`cb-class-option-${item.section_id}`}
                                            onClick={() => {
                                                onTargetChange(item.section_id);
                                                setShowDropdown(false);
                                            }}
                                            className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                                                selected
                                                    ? 'bg-[#FFF2DD] font-semibold text-[#B7552B]'
                                                    : 'text-gray-700 hover:bg-[#FFF2DD]'
                                            }`}
                                        >
                                            {selected && (
                                                <svg className="mr-1.5 h-3.5 w-3.5 text-[#DB763F]" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                            {item.subject_name_th} • {item.display_class_name}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {/* Post input trigger */}
                <div className="flex flex-1 items-center gap-2">
                    <button
                        id="cb-post-input"
                        onClick={onOpenCreate}
                        disabled={postTarget === null}
                        className="flex h-9 flex-1 items-center rounded-xl border border-[#FFBC81] bg-[#FFF2DD] px-4 text-left text-sm text-[#DB763F] transition-colors hover:bg-[#FFE3BB] disabled:opacity-50"
                    >
                        พิมพ์เพื่อเริ่มสร้างโพสต์ในห้องเรียนนี้...
                    </button>
                </div>
            </div>
        </div>
    );
}
