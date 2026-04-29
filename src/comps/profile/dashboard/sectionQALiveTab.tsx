import React from 'react';
import { useRouter } from 'next/router';
import { Badge, Group, Paper, Stack, Text, ThemeIcon, ActionIcon, Tooltip } from '@mantine/core';
import { IconFileText, IconArrowRight } from '@tabler/icons-react'; 
import { AppColors } from '@/constants/colors';
import { TeacherSection } from '@/utils/interface/dashboard.types';
import { formatSecondsToHourMinute } from '@/config/formatters';

interface SectionQATabProps {
    section: TeacherSection;
}

export default function SectionQATab({ section }: SectionQATabProps) {
    const primary = AppColors.primaryPalette;
    const router = useRouter();

    const handleGoToLiveHistory = (qaLiveId: number) => {
        router.push({
            pathname: '/classes/qa_live',
            query: {
                sectionId: section.section_id,
                qaLiveId: qaLiveId,
                mode: 'history',
                subjectName: section.subject_name,
                className: section.section_name
            }
        });
    };

    if (!section.qa_live_insight || section.qa_live_insight.total_live_count <= 0) {
        return <Text size="sm" c="dimmed" ta="center" py="xl">ไม่มีการไลฟ์ในเดือนนี้</Text>;
    }

    return (
        <Stack gap="md" pb="md">
            {section.qa_live_insight.lives?.map((live, index) => (
                <Paper key={live.qa_live_id} withBorder p="md" radius="md" shadow="xs">
                    <Stack gap="sm">
                        
                        <Group justify="space-between" align="flex-start" wrap="nowrap">
                            <div>
                                <Text fw={700} size="md" c="gray.8" lineClamp={1}>
                                    {live.title || `ไลฟ์ครั้งที่ ${section.qa_live_insight!.lives.length - index}`}
                                </Text>
                                <Text size="sm" c="dimmed" mt={4}>
                                    วันที่: {new Date(live.started_at).toLocaleDateString('th-TH')} | ความยาว: {formatSecondsToHourMinute(live.duration_second)}
                                </Text>
                            </div>
                            
                            <Group gap="sm" style={{ flexShrink: 0 }}>
                                <Badge color="orange" variant="light" size="lg">
                                    {live.total_question} คำถาม
                                </Badge>
                                
                                <Tooltip 
                                    label="ดูประวัติไลฟ์" 
                                    withArrow 
                                    position="top" 
                                    color="orange.7"
                                >
                                    <ActionIcon 
                                        variant="subtle" 
                                        color="orange" 
                                        size="lg" 
                                        onClick={() => handleGoToLiveHistory(live.qa_live_id)}
                                    >
                                        <IconArrowRight size={18} />
                                    </ActionIcon>
                                </Tooltip>
                            </Group>
                        </Group>

                        {live.top_questioned_file && live.top_questioned_file.length > 0 && (
                            <Paper withBorder p="sm" radius="sm" bg="gray.0" mt="xs">
                                <Stack gap="xs">
                                    <Text size="xs" fw={700} c="dimmed">ไฟล์ที่ถูกถามมากที่สุด</Text>

                                    {live.top_questioned_file.slice(0, 2).map((file) => (
                                        <Stack key={file.attachment_id} gap="xs">
                                            <Group wrap="nowrap" gap="xs">
                                                <ThemeIcon color={primary[500]} size="sm" variant="light">
                                                    <IconFileText size={14} />
                                                </ThemeIcon>
                                                <Text size="sm" fw={600} lineClamp={1}>
                                                    {file.attachment_name || 'ไม่มีชื่อไฟล์'}
                                                </Text>
                                            </Group>

                                            <Stack gap="xs" pl="xl">
                                                {file.top_page.slice(0, 2).map((page) => (
                                                    <Group key={page.page_number} justify="space-between" wrap="nowrap" bg="white" p="xs" style={{ borderRadius: '6px', border: '1px solid #eee' }}>
                                                        <Text size="sm" c="dimmed">หน้าที่ {page.page_number}</Text>
                                                        <Badge size="md" color="orange" variant="outline" fw={700}>
                                                            {page.question_count} คำถาม
                                                        </Badge>
                                                    </Group>
                                                ))}
                                            </Stack>
                                        </Stack>
                                    ))}
                                </Stack>
                            </Paper>
                        )}
                    </Stack>
                </Paper>
            ))}
        </Stack>
    );
}