import React from 'react';
import { Group, Text, Badge, Stack } from '@mantine/core';
import { TeacherSection } from '@/utils/interface/dashboard.types';

interface SectionAssignmentsTabProps {
    section: TeacherSection;
}

export default function SectionAssignmentsTab({ section }: SectionAssignmentsTabProps) {
    if (!section.assignment_stat || section.assignment_stat.length === 0) {
        return <Text size="sm" c="dimmed" ta="center" py="xl">ไม่มีงานที่กำหนดส่งในเดือนนี้</Text>;
    }

    return (
        <Stack gap="sm" pb="md">
            {section.assignment_stat.map((work) => (
                <Group key={work.assignment_id} justify="space-between" wrap="nowrap" className="bg-gray-50 p-3 rounded-md border border-gray-100">
                    <Text size="sm" fw={600} lineClamp={1} style={{ flex: 1 }}>{work.title}</Text>
                    <Group gap="sm">
                        <Badge size="md" color="green" variant="dot" title="ส่งตรงเวลา">{work.on_time_count}</Badge>
                        <Badge size="md" color="yellow" variant="dot" title="ส่งช้า">{work.late_count}</Badge>
                        <Badge size="md" color="red" variant="dot" title="ยังไม่ส่ง">{work.missing_count}</Badge>
                    </Group>
                </Group>
            ))}
        </Stack>
    );
}
