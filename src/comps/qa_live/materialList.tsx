import React from "react";
import { Accordion, ActionIcon, Badge, Card, Group, Stack, Text, TextInput, ThemeIcon, Tooltip } from "@mantine/core";
import { IconFileText, IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand, IconSearch } from "@tabler/icons-react";

interface MaterialAttachment {
    attachment_id?: number;
    file_url?: string;
    file_type?: string;
    original_name?: string;
}

interface MaterialItem {
    post_id?: number;
    post_title?: string;
    attachments?: MaterialAttachment[];
}

interface MaterialListProps {
    materials: MaterialItem[];
    activeMaterialId?: number;
    showMaterialPanel: boolean;
    onToggleMaterialPanel: () => void;
}

const getFileNameFromUrl = (url?: string) => {
    if (!url) return "ไฟล์แนบ";
    const raw = url.split("/").pop() || "ไฟล์แนบ";
    return decodeURIComponent(raw);
};

export default function MaterialList({
    materials,
    activeMaterialId,
    showMaterialPanel,
    onToggleMaterialPanel,
}: MaterialListProps) {
    return (
        <Card
            shadow="sm"
            padding="lg"
            radius="lg"
            bg="white"
            className="border border-gray-200"
            style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}
        >
            <Group justify="space-between" mb="md" wrap="nowrap">
                <Text fw={700} size="lg">
                    บทเรียน ({materials.length})
                </Text>
                <Tooltip label={showMaterialPanel ? "ซ่อนรายการไฟล์" : "แสดงรายการไฟล์"}>
                    <ActionIcon
                        variant="default"
                        size="lg"
                        onClick={onToggleMaterialPanel}
                    >
                        {showMaterialPanel ? <IconLayoutSidebarLeftCollapse size={18} /> : <IconLayoutSidebarLeftExpand size={18} />}
                    </ActionIcon>
                </Tooltip>
            </Group>

            <TextInput
                leftSection={<IconSearch size={16} />}
                placeholder="ค้นหาไฟล์..."
                mb="md"
            />

            <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                <Accordion variant="separated" radius="md">
                    {materials.map((material) => {
                        const isActive = material.post_id === activeMaterialId;
                        const attachments = material.attachments || [];

                        return (
                            <Accordion.Item key={material.post_id} value={`post-${material.post_id}`}>
                                <Accordion.Control
                                    className={`${isActive ? "bg-blue-50 border border-blue-200" : "bg-white"}`}
                                >
                                    <Group justify="space-between" wrap="nowrap">
                                        <Group gap="xs" wrap="nowrap">
                                            <ThemeIcon
                                                variant={isActive ? "filled" : "light"}
                                                color={isActive ? "blue" : "gray"}
                                                size="sm"
                                            >
                                                <IconFileText size={12} />
                                            </ThemeIcon>
                                            <Text size="sm" fw={isActive ? 700 : 500} lineClamp={1}>
                                                {material.post_title || "ไม่ระบุชื่อโพสต์"}
                                            </Text>
                                        </Group>
                                        <Badge size="sm" radius="xl" color="blue" variant="filled">
                                            {attachments.length}
                                        </Badge>
                                    </Group>
                                </Accordion.Control>
                                <Accordion.Panel>
                                    <Stack gap={6}>
                                        {attachments.length > 0 ? (
                                            attachments.map((attachment) => (
                                                <Group key={attachment.attachment_id || attachment.file_url} gap="xs" wrap="nowrap">
                                                    <ThemeIcon variant="light" color="gray" size="xs">
                                                        <IconFileText size={10} />
                                                    </ThemeIcon>
                                                    <Text size="sm" lineClamp={1}>
                                                        {attachment.original_name || getFileNameFromUrl(attachment.file_url)}
                                                    </Text>
                                                </Group>
                                            ))
                                        ) : (
                                            <Text size="sm" c="dimmed">ไม่มีไฟล์แนบ</Text>
                                        )}
                                    </Stack>
                                </Accordion.Panel>
                            </Accordion.Item>
                        );
                    })}
                </Accordion>
            </div>
        </Card>
    );
}
