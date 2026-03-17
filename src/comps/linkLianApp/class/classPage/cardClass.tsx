// ─────────────────────────────────────────────
// comps/linkLianApp/class/CardClass.tsx
// Class card แสดงข้อมูล section + schedule + location
// id convention: cc-{element}-{sectionId}
// ─────────────────────────────────────────────

import React from 'react';
import { ClassFeedItem, ClassSchedule } from '@/utils/interface/class.types';
import { dayOfWeekToText, formatTime } from '@/utils/function/classHelper';

interface CardClassProps {
  data: ClassFeedItem;
  onTap?: () => void;
}

// Gradient palette หมุนเวียนตาม section_id
const CARD_GRADIENTS = [
  'from-[#FFE3BB] to-[#FFBC81]',   // orange warm
  'from-[#BDEAFF] to-[#5BB2FF]',   // blue cool
  'from-[#DBFCB7] to-[#7CE84A]',   // green fresh
  'from-[#FFF1B1] to-[#FFCE3D]',   // yellow sunny
  'from-[#F9D4C7] to-[#EB6A5E]',   // red soft
  'from-[#FFE3BB] to-[#DB763F]',   // orange deep
];

const bgImage = process.env.NEXT_PUBLIC_CLASS_DETAIL_BG_IMAGE;

function getGradient(sectionId: number): string {
  const safeIndex = Math.abs(sectionId) % CARD_GRADIENTS.length;
  return CARD_GRADIENTS[safeIndex];
}

function ScheduleText({ schedules, sectionId }: { schedules: ClassSchedule[]; sectionId: number }) {
  if (schedules.length === 0) {
    return (
      <span id={`cc-schedule-empty-${sectionId}`} className="text-[10px] text-gray-600/70">
        ยังไม่พบตารางเรียน
      </span>
    );
  }

  const uniqueSchedules = schedules.filter(
    (s, i, arr) =>
      arr.findIndex(
        (x) =>
          x.day_of_week === s.day_of_week &&
          x.start_time === s.start_time &&
          x.end_time === s.end_time
      ) === i
  );

  const sortedSchedules = [...uniqueSchedules].sort((a, b) => {
    const dayA = a.day_of_week === 0 ? 7 : a.day_of_week;
    const dayB = b.day_of_week === 0 ? 7 : b.day_of_week;
    if (dayA !== dayB) return dayA - dayB;
    const startA = a.start_time ?? '';
    const startB = b.start_time ?? '';
    return startA.localeCompare(startB);
  });

  return (
    <span id={`cc-schedule-${sectionId}`} className="line-clamp-1 text-[10px] text-gray-700/80">
      {sortedSchedules
        .slice(0, 3)
        .map((s) => `${dayOfWeekToText(s.day_of_week)} : [ ${formatTime(s.start_time)} - ${formatTime(s.end_time)} ]`)
        .join(' , ')}
    </span>
  );
}

export default function CardClass({ data, onTap }: CardClassProps) {
  const sid = data.section_id;
  const gradient = getGradient(sid);

  return (
    <div
      id={`cc-card-${sid}`}
      data-testid={`cc-card-${sid}`}
      onClick={onTap}
      style={
        bgImage
          ? {
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }
          : undefined
      }
      className={`group relative h-full cursor-pointer overflow-hidden rounded-2xl ${!bgImage ? `bg-gradient-to-br ${gradient}` : ''
        } p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]`}
    >
      <div id={`cc-header-${sid}`} className="mb-2.5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 id={`cc-title-${sid}`} className="line-clamp-1 text-4xl font-semibold tracking-tight text-[#1d1d1d]">
            {data.display_class_name || data.section_name || data.subject_code}
          </h3>
          <p id={`cc-subtitle-${sid}`} className="mt-1 line-clamp-1 text-xs text-[#1f1f1f]">
            {data.subject_name_th || data.subject_code}
          </p>
        </div>
      </div>

      <div className="border-t border-black/10 pt-2">
        <div
          id={`cc-schedule-row-${sid}`}
          className="flex items-center justify-between gap-2"
        >
          <ScheduleText schedules={data.schedules} sectionId={sid} />
        </div>
      </div>
    </div>
  );
}
