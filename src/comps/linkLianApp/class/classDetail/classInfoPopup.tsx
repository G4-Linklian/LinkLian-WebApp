import React from 'react';
import { AppColors } from '@/constants/colors';
import { ClassInfoData, ClassSchedule } from '@/utils/interface/class.types';
import { dayOfWeekToText, formatTime } from '@/utils/function/classHelper';

interface ClassInfoPopupProps {
  classInfo: ClassInfoData | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
}

function ScheduleItem({ schedule, index }: { schedule: ClassSchedule; index: number }) {
  const location = [
    schedule.building?.building_name || '',
    schedule.room?.room_number ? `ห้อง ${schedule.room.room_number}` : '',
  ].filter(Boolean).join(' ');

  return (
    <div id={`cip-schedule-item-${index}`} className="mb-2 flex items-start gap-2 text-sm" key={index}>
      <span className="mt-0.5" style={{ color: AppColors.primaryPalette[600] }}>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </span>
      <p className="text-sm" style={{ color: AppColors.primaryPalette[800] }}>
        {dayOfWeekToText(schedule.day_of_week)} {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
        {location ? ` (${location})` : ''}
      </p>
    </div>
  );
}

export default function ClassInfoPopup({
  classInfo,
  isLoading,
  error,
  onClose,
}: ClassInfoPopupProps) {
  const uniqueLocations = Array.from(
    new Set(
      (classInfo?.schedules ?? [])
        .map((s) => [s.building?.building_name, s.room?.room_number ? `ห้อง ${s.room.room_number}` : ''].filter(Boolean).join(' '))
        .filter((x) => x.length > 0),
    ),
  );

  return (
    <div id="cip-overlay" className="fixed inset-x-0 bottom-0 top-[60px] z-[9100] bg-black/35 p-3 backdrop-blur-[1px] md:p-6">
      <div id="cip-modal" className="mx-auto flex h-full w-full max-w-3xl flex-col overflow-hidden rounded-2xl p-6 shadow-2xl" style={{ backgroundColor: AppColors.primaryPalette[100] }}>
        <button
          id="cip-close-btn"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-600 hover:bg-black/5"
          aria-label="ปิดข้อมูลห้องเรียน"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {isLoading && (
          <div id="cip-loading" className="flex h-[85%] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-200 border-t-amber-500" />
          </div>
        )}

        {!isLoading && error && (
          <div id="cip-error" className="flex h-[85%] items-center justify-center text-sm" style={{ color: AppColors.dangerPalette[500] }}>
            {error}
          </div>
        )}

        {!isLoading && !error && (
          <div id="cip-content" className="h-[85%] overflow-y-auto pr-1">
            <section id="cip-location-section" className="mb-5">
              <h3 className="mb-2 text-lg font-bold" style={{ color: AppColors.primaryPalette[900] }}>สถานที่</h3>
              {uniqueLocations.length === 0 ? (
                <p id="cip-location-empty" className="text-sm" style={{ color: AppColors.primaryPalette[800] }}>ไม่ระบุ</p>
              ) : (
                <div id="cip-location-list">
                  {uniqueLocations.map((location, idx) => (
                    <p id={`cip-location-item-${idx}`} key={`${location}-${idx}`} className="mb-1 text-sm" style={{ color: AppColors.primaryPalette[800] }}>
                      • {location}
                    </p>
                  ))}
                </div>
              )}
            </section>

            <section id="cip-schedule-section" className="mb-5">
              <h3 className="mb-2 text-lg font-bold" style={{ color: AppColors.primaryPalette[900] }}>ตารางเรียน</h3>
              {(classInfo?.schedules?.length ?? 0) === 0 ? (
                <p id="cip-schedule-empty" className="text-sm" style={{ color: AppColors.primaryPalette[600] }}>ไม่มีตารางเรียน</p>
              ) : (
                <div id="cip-schedule-list">
                  {classInfo?.schedules.map((schedule, idx) => (
                    <ScheduleItem schedule={schedule} index={idx} key={`${schedule.day_of_week}-${schedule.start_time}-${schedule.end_time}-${idx}`} />
                  ))}
                </div>
              )}
            </section>

            <section id="cip-member-section" className="mb-5">
              <h3 className="mb-2 text-lg font-bold" style={{ color: AppColors.primaryPalette[900] }}>สมาชิก</h3>
              {(classInfo?.members?.length ?? 0) === 0 ? (
                <p id="cip-member-empty" className="text-sm" style={{ color: AppColors.primaryPalette[600] }}>ไม่มีสมาชิก</p>
              ) : (
                <div id="cip-member-list" className="max-h-[200px] overflow-y-auto rounded-lg border p-2" style={{ borderColor: AppColors.primaryPalette[200] }}>
                  {classInfo?.members.map((member, idx) => (
                    <div id={`cip-member-item-${idx}`} key={member.user_sys_id} className="mb-2 last:mb-0">
                      <p className="text-sm font-medium" style={{ color: AppColors.primaryPalette[800] }}>{idx + 1}. {member.display_name || 'ไม่ระบุชื่อ'}</p>
                      {member.student_code && (
                        <p className="pl-4 text-xs" style={{ color: AppColors.primaryPalette[600] }}>รหัส: {member.student_code}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section id="cip-educator-section">
              <h3 className="mb-2 text-lg font-bold" style={{ color: AppColors.primaryPalette[900] }}>ผู้สอน</h3>
              {(classInfo?.educators?.length ?? 0) === 0 ? (
                <p id="cip-educator-empty" className="text-sm" style={{ color: AppColors.primaryPalette[600] }}>ไม่มีข้อมูลผู้สอน</p>
              ) : (
                <div id="cip-educator-list">
                  {classInfo?.educators.map((educator, idx) => (
                    <div id={`cip-educator-item-${idx}`} key={educator.user_sys_id} className="mb-2 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium" style={{ color: AppColors.primaryPalette[800] }}>{educator.display_name || 'ไม่ระบุชื่อ'}</p>
                      </div>
                      {educator.is_main_teacher && (
                        <span className="shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold" style={{ backgroundColor: AppColors.primaryPalette[200], color: AppColors.primaryPalette[700] }}>
                          ครูผู้สอนหลัก
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
