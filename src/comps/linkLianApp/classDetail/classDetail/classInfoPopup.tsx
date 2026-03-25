import React from 'react';
import { Alert, Badge, Loader, Modal, Paper, ScrollArea, Stack, Text, ThemeIcon } from '@mantine/core';
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
      <ThemeIcon variant="light" color="blue" radius="xl" size="sm" mt={2}>
        <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </ThemeIcon>
      <Text size="sm" style={{ color: AppColors.primaryPalette[800] }}>
        {dayOfWeekToText(schedule.day_of_week)} {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
        {location ? ` (${location})` : ''}
      </Text>
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
    <Modal
      opened
      onClose={onClose}
      zIndex={11000}
      title="ข้อมูลห้องเรียน"
      centered
      size="lg"
      radius="xl"
      overlayProps={{ backgroundOpacity: 0.35, blur: 1 }}
      styles={{
        content: { backgroundColor: AppColors.primaryPalette[100] },
        body: { paddingTop: 8 },
      }}
    >
      {isLoading && (
        <div id="cip-loading" className="flex h-[240px] items-center justify-center">
          <Loader color="orange" />
        </div>
      )}

      {!isLoading && error && (
        <Alert id="cip-error" color="red" variant="light">
          {error}
        </Alert>
      )}

      {!isLoading && !error && (
        <ScrollArea.Autosize id="cip-content" mah="70vh" offsetScrollbars>
          <Stack gap="lg">
            <section id="cip-location-section">
              <Text fw={700} size="lg" mb="sm" style={{ color: AppColors.primaryPalette[900] }}>สถานที่</Text>
              {uniqueLocations.length === 0 ? (
                <Text id="cip-location-empty" size="sm" style={{ color: AppColors.primaryPalette[800] }}>ไม่ระบุ</Text>
              ) : (
                <Stack id="cip-location-list" gap="xs">
                  {uniqueLocations.map((location, idx) => (
                    <Text id={`cip-location-item-${idx}`} key={`${location}-${idx}`} size="sm" style={{ color: AppColors.primaryPalette[800] }}>
                      • {location}
                    </Text>
                  ))}
                </Stack>
              )}
            </section>

            <section id="cip-schedule-section">
              <Text fw={700} size="lg" mb="sm" style={{ color: AppColors.primaryPalette[900] }}>ตารางเรียน</Text>
              {(classInfo?.schedules?.length ?? 0) === 0 ? (
                <Text id="cip-schedule-empty" size="sm" style={{ color: AppColors.primaryPalette[600] }}>ไม่มีตารางเรียน</Text>
              ) : (
                <div id="cip-schedule-list">
                  {classInfo?.schedules.map((schedule, idx) => (
                    <ScheduleItem schedule={schedule} index={idx} key={`${schedule.day_of_week}-${schedule.start_time}-${schedule.end_time}-${idx}`} />
                  ))}
                </div>
              )}
            </section>

            <section id="cip-member-section">
              <Text fw={700} size="lg" mb="sm" style={{ color: AppColors.primaryPalette[900] }}>สมาชิก</Text>
              {(classInfo?.members?.length ?? 0) === 0 ? (
                <Text id="cip-member-empty" size="sm" style={{ color: AppColors.primaryPalette[600] }}>ไม่มีสมาชิก</Text>
              ) : (
                <Paper id="cip-member-list" withBorder radius="sm" p="sm" style={{ borderColor: AppColors.primaryPalette[200] }}>
                  <Stack gap="xs">
                    {classInfo?.members.map((member, idx) => (
                      <div id={`cip-member-item-${idx}`} key={member.user_sys_id}>
                        <Text size="sm" fw={500} style={{ color: AppColors.primaryPalette[800] }}>
                          {idx + 1}. {member.display_name || 'ไม่ระบุชื่อ'}
                        </Text>
                        {member.student_code && (
                          <Text pl="md" size="xs" style={{ color: AppColors.primaryPalette[600] }}>
                            รหัส: {member.student_code}
                          </Text>
                        )}
                      </div>
                    ))}
                  </Stack>
                </Paper>
              )}
            </section>

            <section id="cip-educator-section">
              <Text fw={700} size="lg" mb="sm" style={{ color: AppColors.primaryPalette[900] }}>ผู้สอน</Text>
              {(classInfo?.educators?.length ?? 0) === 0 ? (
                <Text id="cip-educator-empty" size="sm" style={{ color: AppColors.primaryPalette[600] }}>ไม่มีข้อมูลผู้สอน</Text>
              ) : (
                <Stack id="cip-educator-list" gap="sm">
                  {classInfo?.educators.map((educator, idx) => (
                    <div id={`cip-educator-item-${idx}`} key={educator.user_sys_id} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <Text truncate size="sm" fw={500} style={{ color: AppColors.primaryPalette[800] }}>
                          {educator.display_name || 'ไม่ระบุชื่อ'}
                        </Text>
                      </div>
                      {educator.is_main_teacher && (
                        <Badge variant="light" color="blue" radius="md">
                          ครูผู้สอนหลัก
                        </Badge>
                      )}
                    </div>
                  ))}
                </Stack>
              )}
            </section>
          </Stack>
        </ScrollArea.Autosize>
      )}
    </Modal>
  );
}
