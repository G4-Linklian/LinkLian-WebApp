import React from 'react';
import { Modal, Group, Text, Badge, Stack, ScrollArea, Tabs, Button } from '@mantine/core';
import { IconFileText, IconBroadcast, IconExternalLink } from '@tabler/icons-react';
import { TeacherSection } from '@/utils/interface/dashboard.types';
import { AppColors } from '@/constants/colors';
import SectionAssignmentsTab from './sectionAssignmentsTab';
import SectionQATab from './sectionQALiveTab';

interface SectionDetailModalProps {
    section: TeacherSection | null;
    opened: boolean;
    onClose: () => void;
    onGoToClass: (section: TeacherSection) => void;
}

export default function SectionDetailModal({
    section,
    opened,
    onClose,
    onGoToClass,
}: SectionDetailModalProps) {
    const primary = AppColors.primaryPalette;

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={
                <Group gap="sm">
                    <Text fw={700} size="lg">{section?.subject_name}</Text>
                    <Badge variant="dot" color={primary[700]}>{section?.section_name}</Badge>
                </Group>
            }
            size="lg"
            radius="lg"
            padding="xl"
            centered
        >
            {section && (
                <Stack gap="md">
                    <ScrollArea
                        h={400}
                        offsetScrollbars
                        className="[&::-webkit-scrollbar]:hidden"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        <Tabs defaultValue="assignments" color={primary[700]}>
                            <Tabs.List grow>
                                <Tabs.Tab value="assignments" leftSection={<IconFileText size={14} />}>
                                    การส่งงาน
                                </Tabs.Tab>
                                <Tabs.Tab value="qa" leftSection={<IconBroadcast size={14} />}>
                                    ไลฟ์และคำถาม
                                </Tabs.Tab>
                            </Tabs.List>

                            <Tabs.Panel value="assignments" pt="md">
                                <SectionAssignmentsTab section={section} />
                            </Tabs.Panel>

                            <Tabs.Panel value="qa" pt="md">
                                <SectionQATab section={section} />
                            </Tabs.Panel>
                        </Tabs>
                    </ScrollArea>

                    <Button
                        variant="filled"
                        color={primary[200]}
                        styles={{ label: { color: primary[700] } }}
                        mt="sm"
                        radius="md"
                        rightSection={<IconExternalLink size={16} color={primary[700]} />}
                        onClick={() => onGoToClass(section)}
                    >
                        ไปที่ห้องเรียน
                    </Button>
                </Stack>
            )}
        </Modal>
    );
}