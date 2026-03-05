import React, { useEffect, useState } from "react";
import { decodeTeacherToken } from "@/utils/authToken";
import { IconMapPinFilled } from "@tabler/icons-react";
import { Card, Text, Stack, ScrollArea } from "@mantine/core";
import { getTeachingSchedule } from '@/utils/api/profile';
import { TeachingScheduleFields } from "@/utils/interface/profile.types";
import { timeFormatter } from "@/config/formatters";


const DAY_CONFIG: Record<number, { name: string, badgeBg: string, cardBorder: string, cardBg: string }> = {
    1: { name: 'วันจันทร์', badgeBg: 'bg-[#FBBF24]', cardBorder: 'border-yellow-300', cardBg: 'bg-grey-50' },
    2: { name: 'วันอังคาร', badgeBg: 'bg-[#F472B6]', cardBorder: 'border-pink-300', cardBg: 'bg-grey-50' },
    3: { name: 'วันพุธ', badgeBg: 'bg-[#4ADE80]', cardBorder: 'border-green-300', cardBg: 'bg-grey-50' },
    4: { name: 'วันพฤหัสบดี', badgeBg: 'bg-[#FB923C]', cardBorder: 'border-orange-300', cardBg: 'bg-grey-50' },
    5: { name: 'วันศุกร์', badgeBg: 'bg-[#60A5FA]', cardBorder: 'border-blue-300', cardBg: 'bg-grey-50' },
    6: { name: 'วันเสาร์', badgeBg: 'bg-[#A78BFA]', cardBorder: 'border-purple-300', cardBg: 'bg-grey-50' },
    7: { name: 'วันอาทิตย์', badgeBg: 'bg-[#F87171]', cardBorder: 'border-red-300', cardBg: 'bg-grey-50' },
};

const DEFAULT_DAY = { name: 'ไม่ระบุวัน', badgeBg: 'bg-gray-400', cardBorder: 'border-gray-300', cardBg: 'bg-grey-50' };

export default function TeachingSchedule() {
    const [schedule, setSchedule] = useState<TeachingScheduleFields[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const token = decodeTeacherToken();
                if (!token.user_id)
                    return;

                const res = await getTeachingSchedule(token.user_id);
                if (res?.success) {
                    setSchedule(res.data || []);
                }

                console.log('Teaching schedule data:', res.data);
            } catch (error) {
                console.error('Failed to fetch teaching schedule:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSchedule();
    }, []);

    const groupedSchedule = schedule.reduce((acc, curr) => {
        const day = curr.dayOfWeek;
        if (!acc[day]) {
            acc[day] = [];
        }
        acc[day].push(curr);
        return acc;
    }, {} as Record<number, TeachingScheduleFields[]>);

    const sortedDays = Object.keys(groupedSchedule).map(Number).sort((a, b) => a - b);

    return (
        <Card shadow="sm" padding="xl" radius="lg" bg="white" className="border border-gray-200"
            style={{ height: 'calc(100vh - 125px)', display: 'flex', flexDirection: 'column' }}
            id="teaching-schedule-card"
        >
            <Text size="xl" fw={700} mb="lg" className="text-gray-800" style={{ flexShrink: 0 }} id="teaching-schedule-title">
                ตารางสอน
            </Text>

            <ScrollArea style={{ flex: 1, minHeight: 0 }} type="auto" offsetScrollbars id="teaching-schedule-scrollarea">
                <Stack gap="xl" pr="xs">

                    {sortedDays.map((dayOfWeek) => {
                        const dayTheme = DAY_CONFIG[dayOfWeek] || DEFAULT_DAY;
                        const classesInDay = groupedSchedule[dayOfWeek];

                        return (
                            <Stack key={dayOfWeek} gap="sm">

                                <div className={`w-fit px-4 py-1.5 rounded-full text-white text-sm font-semibold ${dayTheme.badgeBg}`} id={`day-badge-${dayOfWeek}`}>
                                    {dayTheme.name}
                                </div>

                                {classesInDay.map((cls) => (
                                    <div key={cls.scheduleId} className={`border ${dayTheme.cardBorder} ${dayTheme.cardBg} rounded-xl p-4 shadow-sm`} id={`class-card-${cls.scheduleId}`}>

                                        <div className="flex justify-between items-start mb-2 gap-4" id={`class-header-${cls.scheduleId}`}>
                                            <Text fw={700} className="text-base leading-tight" id={`class-subject-${cls.subjectName}`}>
                                                {cls.subjectName}
                                            </Text>
                                            <Text fw={700} size="sm" className="shrink-0" id={`class-name-${cls.className}`}>
                                                {cls.className}
                                            </Text>
                                        </div>

                                        <Stack gap={4}>
                                            <Text size="sm" color="dimmed" id={`class-time-${cls.scheduleId}`}>
                                                {timeFormatter(cls.startTime)} - {timeFormatter(cls.endTime)}
                                            </Text>
                                            <div className="flex items-center gap-1.5 text-gray-500 truncate">
                                                <IconMapPinFilled size={14} className="shrink-0" />
                                                <Text size="sm" color="dimmed" id={`class-location-${cls.scheduleId}`}>
                                                    {cls.building && cls.building !== "-" ? cls.building : "ไม่ระบุสถานที่"}
                                                </Text>
                                            </div>
                                        </Stack>

                                    </div>
                                ))}
                            </Stack>
                        );
                    })}

                    {/* กรณีไม่มีข้อมูลตารางสอน */}
                    {sortedDays.length === 0 && !loading && (
                        <Text c="dimmed" ta="center" py="xl" id="no-schedule-text">
                            ไม่มีข้อมูลตารางสอน
                        </Text>
                    )}
                </Stack>
            </ScrollArea>
        </Card>
    );
}