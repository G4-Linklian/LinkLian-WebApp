import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Card, Text, Group, Stack, Grid, Button, ThemeIcon } from '@mantine/core';
import { IconFileText, IconChartBar, IconBroadcast } from '@tabler/icons-react';
import { TeacherSection } from '@/utils/interface/dashboard.types';
import { AppColors } from '@/constants/colors';
import SectionDetailModal from './sectionDetailModal';

interface Props {
    sections: TeacherSection[];
}

export default function SectionOverview({ sections }: Props) {
    const router = useRouter();
    const primary = AppColors.primaryPalette;

    const [selectedSection, setSelectedSection] = useState<TeacherSection | null>(null);

    const handleGoToClass = (section: TeacherSection) => {
        router.push({
            pathname: '/classes/classDetail',
            query: {
                sectionId: section.section_id,
                subjectName: section.subject_name,
                className: section.section_name,
            },
        });
    };

    if (!sections || sections.length === 0) {
        return null;
    }

    return (
        <Stack gap="md" mt="xl">
            <Text size="xl" fw={700} className="text-gray-800">ภาพรวมรายห้องเรียน</Text>

            <Grid gutter="md">
                {sections.map((section) => {
                    const totalAssignments = section.assignment_stat?.length || 0;
                    // 🌟 แก้ไข: ดึงจำนวนครั้งของไลฟ์จาก total_live_count โครงสร้างใหม่ได้เลย
                    const totalLives = section.qa_live_insight?.total_live_count || 0;

                    return (
                        <Grid.Col span={{ base: 12, md: 6, lg: 6 }} key={section.section_id}>
                            <Card shadow="sm" padding="lg" radius="lg" withBorder className="hover:shadow-md transition-shadow">
                                <Group justify="space-between" mb="sm" align="flex-start">
                                    <div>
                                        <Text fw={700} size="lg" c={primary[700]}>{section.section_name}</Text>
                                        <Text size="sm" c="dimmed">{section.subject_name}</Text>
                                    </div>
                                </Group>

                                <Group gap="md" mt="sm">
                                    <Group gap="xs">
                                        <ThemeIcon size="sm" variant="light" color="gray">
                                            <IconFileText size={14} />
                                        </ThemeIcon>
                                        <Text size="sm" fw={500}>{totalAssignments} งาน</Text>
                                    </Group>

                                    <Group gap="xs">
                                        <ThemeIcon size="sm" variant="light" color="gray">
                                            <IconBroadcast size={14} />
                                        </ThemeIcon>
                                        <Text size="sm" fw={500}>{totalLives} ครั้ง</Text>
                                    </Group>
                                </Group>

                                <Group justify="flex-end" mt="md">
                                    <Button
                                        variant="filled"
                                        color={primary[200]}
                                        styles={{ label: { color: primary[700] } }}
                                        size="sm"
                                        radius="md"
                                        leftSection={<IconChartBar size={16} color={primary[700]} />}
                                        onClick={() => setSelectedSection(section)}
                                    >
                                        ดูรายละเอียด
                                    </Button>
                                </Group>
                            </Card>
                        </Grid.Col>
                    );
                })}
            </Grid>

            <SectionDetailModal
                section={selectedSection}
                opened={!!selectedSection}
                onClose={() => setSelectedSection(null)}
                onGoToClass={handleGoToClass}
            />
        </Stack>
    );
}