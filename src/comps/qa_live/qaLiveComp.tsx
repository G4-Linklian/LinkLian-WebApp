import React, { useEffect, useMemo, useState } from "react";
import { ActionIcon, Badge, Button, Grid, Group, Paper, Select, Stack, Tooltip, Text } from "@mantine/core";
import {
    IconLayoutSidebarLeftExpand,
    IconLayoutSidebarRightExpand,
    IconPlayerStopFilled,
    IconSquare,
} from "@tabler/icons-react";
import MaterialList from "./materialList";
import PresentationPanel from "./presentation";
import QuestionPanel from "./questionPanel";
import { searchSectionFiles } from "@/utils/api/qna";

interface QaLiveMaterialItem {
    post_id?: number;
    section_id?: number;
    post_title?: string;
    post_content?: {
        post_content_id?: number;
        title?: string;
        created_at?: string;
    };
    attachments?: {
        attachment_id?: number;
        file_url?: string;
        file_type?: string;
        original_name?: string;
    }[];
}

const comments = [
    {
        id: 1,
        name: "Kanokporn",
        time: "10:10",
        message: "Quality score < 20 ดึงทิ้งได้เลยคะ?",
        color: "green",
    },
    {
        id: 2,
        name: "Panida",
        time: "10:14",
        message: "Phred score 30 หมายความว่า accuracy 99.9% ใช่มั้ยคะ",
        color: "orange",
    },
];

export default function QaLiveComp() {
    const [showMaterialPanel, setShowMaterialPanel] = useState(true);
    const [showQuestionPanel, setShowQuestionPanel] = useState(true);
    const [materials, setMaterials] = useState<QaLiveMaterialItem[]>([]);
    const [activeMaterialId, setActiveMaterialId] = useState<number | undefined>(undefined);

    useEffect(() => {
        const fetchSectionFiles = async () => {
            try {
                const res = await searchSectionFiles({ section_id: 1, offset: 0, limit: 20 });
                if (res?.success) {
                    const rawData = Array.isArray(res.data) ? (res.data as QaLiveMaterialItem[]) : [];
                    const mapped = rawData.map((item) => ({
                        ...item,
                        post_title: item.post_content?.title || "",
                        attachments: Array.isArray(item.attachments) ? item.attachments : [],
                    }));
                    console.log("Fetched section files:", res, mapped);

                    setMaterials(mapped);
                    setActiveMaterialId(mapped[0]?.post_id);
                } else {
                    setMaterials([]);
                    setActiveMaterialId(undefined);
                }
            } catch (error) {
                console.error("Failed to fetch section files:", error);
                setMaterials([]);
                setActiveMaterialId(undefined);
            }
        };

        fetchSectionFiles();
    }, []);

    const centerSpan = useMemo(() => {
        if (showMaterialPanel && showQuestionPanel) return 5;
        if (showMaterialPanel || showQuestionPanel) return 8;
        return 12;
    }, [showMaterialPanel, showQuestionPanel]);

    const activeMaterial = useMemo(
        () => materials.find((item) => item.post_id === activeMaterialId) || materials[0],
        [materials, activeMaterialId]
    );

    const presentationPostTitle = activeMaterial?.post_title || activeMaterial?.post_content?.title || "ไม่พบชื่อโพสต์";
    const presentationFileName = (() => {
        const attachment = activeMaterial?.attachments?.[0];
        if (attachment?.original_name) return attachment.original_name;

        const fileUrl = attachment?.file_url;
        if (!fileUrl) return "ไม่พบชื่อไฟล์";
        const rawName = fileUrl.split("/").pop() || "ไม่พบชื่อไฟล์";
        return decodeURIComponent(rawName);
    })();

    return (
        <div className="w-full  bg-gray-50 overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>
            <div className="mx-auto pt-6" style={{ width: "94%", height: "100%" }}>
                <Paper radius="xl" p="lg" className="border border-gray-200" bg="#F8FAFC" style={{ height: "calc(100% - 4px)" }}>
                    <Stack h="100%" gap="md">
                        <Group justify="space-between" wrap="wrap">
                            <Group>
                                <Badge color="red" variant="light" size="lg" radius="xl" leftSection={<IconSquare size={8} fill="currentColor" />}>
                                    LIVE
                                </Badge>
                                <Text fw={700} size="lg">
                                    Q&A Live Session - Week 2: Data Preprocessing
                                </Text>
                            </Group>

                            <Group gap="xs">
                                <Paper radius="md" p={4} withBorder bg="white">
                                    <Group gap={6} wrap="nowrap">
                                        {!showMaterialPanel && (
                                            <Tooltip label="แสดงรายการไฟล์">
                                                <ActionIcon
                                                    variant="default"
                                                    size="lg"
                                                    onClick={() => setShowMaterialPanel(true)}
                                                >
                                                    <IconLayoutSidebarLeftExpand size={18} />
                                                </ActionIcon>
                                            </Tooltip>
                                        )}
                                        {!showQuestionPanel && (
                                            <Tooltip label="แสดงคอมเมนต์">
                                                <ActionIcon
                                                    variant="default"
                                                    size="lg"
                                                    onClick={() => setShowQuestionPanel(true)}
                                                >
                                                    <IconLayoutSidebarRightExpand size={18} />
                                                </ActionIcon>
                                            </Tooltip>
                                        )}
                                    </Group>
                                </Paper>

                                <Button variant="default" leftSection={<IconPlayerStopFilled size={14} />}>
                                    หยุด Live
                                </Button>
                            </Group>
                        </Group>

                        <Grid
                            gutter="md"
                            align="stretch"
                            style={{ flex: 1, minHeight: 0 }}
                            styles={{ inner: { height: '100%' } }}
                        >
                            {showMaterialPanel && (
                                <Grid.Col span={{ base: 12, md: 3 }} style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
                                    <MaterialList
                                        materials={materials}
                                        activeMaterialId={activeMaterialId}
                                        showMaterialPanel={showMaterialPanel}
                                        onToggleMaterialPanel={() => setShowMaterialPanel((prev) => !prev)}
                                    />
                                </Grid.Col>
                            )}

                            <Grid.Col span={{ base: 12, md: centerSpan }} style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
                                <PresentationPanel
                                    chapterTitle={presentationPostTitle}
                                    fileName={presentationFileName}
                                    currentPage={1}
                                    totalPages={8}
                                />
                            </Grid.Col>

                            {showQuestionPanel && (
                                <Grid.Col span={{ base: 12, md: 4 }} style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
                                    <QuestionPanel
                                        fileName="Ch2_Quality_Control"
                                        comments={comments}
                                        showQuestionPanel={showQuestionPanel}
                                        onToggleQuestionPanel={() => setShowQuestionPanel((prev) => !prev)}
                                    />
                                </Grid.Col>
                            )}
                        </Grid>
                    </Stack>
                </Paper>
            </div>
        </div>
    );
}
