import React from "react";
import { Accordion, ActionIcon, Badge, Card, Group, Stack, Text, TextInput, ThemeIcon, Tooltip } from "@mantine/core";
import { IconFileText, IconLayoutSidebarLeftCollapse, IconSearch } from "@tabler/icons-react";
import { AppColors } from "@/constants/colors";

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
    activeAttachmentId?: number;
    searchKeyword: string;
    onSearchKeywordChange: (value: string) => void;
    onCloseMaterialPanel: () => void;
    onSelectMaterial: (postId?: number) => void;
    onSelectAttachment: (postId?: number, attachment?: MaterialAttachment) => void;
}

const getFileNameFromUrl = (url?: string) => {
    if (!url) return "ไฟล์แนบ";
    const raw = url.split("/").pop() || "ไฟล์แนบ";
    return decodeURIComponent(raw);
};

export default function MaterialList({
    materials,
    activeMaterialId,
    activeAttachmentId,
    searchKeyword,
    onSearchKeywordChange,
    onCloseMaterialPanel,
    onSelectMaterial,
    onSelectAttachment,
}: MaterialListProps) {
    return (
        <Card
            shadow="sm"
            padding="lg"
            radius="lg"
            bg="white"
            className="border border-gray-200"
            style={{ 
                height: "100%", 
                width: "100%", 
                display: "flex", 
                flexDirection: "column", 
                minHeight: 0,
                overflow: "hidden",
            }}
        >
            <Group justify="space-between" mb="md" wrap="nowrap">
                <Text fw={700} size="lg">
                    บทเรียน ({materials.length})
                </Text>
                <Tooltip label="ซ่อนบทเรียน">
                    <ActionIcon
                        variant="default"
                        size="lg"
                        onClick={onCloseMaterialPanel}
                    >
                        <IconLayoutSidebarLeftCollapse size={18} />
                    </ActionIcon>
                </Tooltip>
            </Group>

            <TextInput
                leftSection={<IconSearch size={16} />}
                placeholder="ค้นหาไฟล์..."
                value={searchKeyword}
                onChange={(event) => onSearchKeywordChange(event.currentTarget.value)}
                radius="xl"
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
                                    onClick={() => onSelectMaterial(material.post_id)}
                                    className={`${isActive ? "border" : "bg-white"}`}
                                    style={isActive ? { backgroundColor: AppColors.primaryPalette[100], borderColor: AppColors.primaryPalette[200] } : undefined}
                                >
                                    <Group justify="space-between" wrap="nowrap">
                                        <Group gap="xs" wrap="nowrap">
                                            <ThemeIcon
                                                variant={isActive ? "filled" : "light"}
                                                color={isActive ? AppColors.primaryPalette[500] : "gray"}
                                                size="sm"
                                            >
                                                <IconFileText size={12} />
                                            </ThemeIcon>
                                            <Text size="sm" fw={isActive ? 700 : 500} lineClamp={1}>
                                                {material.post_title || "ไม่ระบุชื่อโพสต์"}
                                            </Text>
                                        </Group>
                                        <Badge size="sm" radius="xl" color={AppColors.primaryPalette[500]} variant="filled">
                                            {attachments.length}
                                        </Badge>
                                    </Group>
                                </Accordion.Control>
                                <Accordion.Panel>
                                    <Stack gap={6}>
                                        {attachments.length > 0 ? (
                                            attachments.map((attachment) => {
                                                const isActiveAttachment =
                                                    isActive && activeAttachmentId != null && attachment.attachment_id === activeAttachmentId;

                                                return (
                                                <button
                                                    key={attachment.attachment_id || attachment.file_url}
                                                    type="button"
                                                    onClick={() => onSelectAttachment(material.post_id, attachment)}
                                                    className={`w-full rounded-md px-1.5 py-1 text-left transition-colors ${isActiveAttachment ? "" : "hover:bg-gray-50"}`}
                                                    style={isActiveAttachment ? { backgroundColor: AppColors.primaryPalette[100] } : undefined}
                                                >
                                                <Group gap="xs" wrap="nowrap">
                                                    <ThemeIcon variant={isActiveAttachment ? "filled" : "light"} color={isActiveAttachment ? AppColors.primaryPalette[500] : "gray"} size="xs">
                                                        <IconFileText size={10} />
                                                    </ThemeIcon>
                                                    <Text size="sm" fw={isActiveAttachment ? 600 : 400} lineClamp={1}>
                                                        {attachment.original_name || getFileNameFromUrl(attachment.file_url)}
                                                    </Text>
                                                </Group>
                                                </button>
                                            )})
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
