import React, { useState, useEffect } from "react";
import { Card, Group, Stack, Text, Button } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

interface PresentationPanelProps {
    chapterTitle: string;
    fileName: string;
    fileUrl?: string;
    fileType?: string;
    onPageChange?: (page: number, totalPages: number) => void;
    requestedPage?: number;
    jumpKey?: number;
}

const isImage = (value?: string) => {
    const text = (value || "").toLowerCase();
    return text.includes("image") || /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/.test(text);
};

const isPdf = (value?: string) => {
    const text = (value || "").toLowerCase();
    return text.includes("pdf") || text.endsWith(".pdf");
};

export default function PresentationPanel({
    chapterTitle,
    fileName,
    fileUrl,
    fileType,
    onPageChange,
    requestedPage,
    jumpKey,
}: PresentationPanelProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [iframeKey, setIframeKey] = useState(0); 

    const fileSource = fileUrl || "";
    const displayType = `${fileType || ""} ${fileName || ""} ${fileSource}`.toLowerCase();
    const canPreviewImage = Boolean(fileSource) && isImage(displayType);
    const canPreviewPdf = Boolean(fileSource) && isPdf(displayType);
    const hasSource = Boolean(fileSource);

    useEffect(() => {
        setCurrentPage(1);
    }, [fileUrl]);

    useEffect(() => {
        if (!requestedPage || requestedPage < 1) return;
        setCurrentPage(requestedPage);
        setIframeKey(k => k + 1); 
        onPageChange?.(requestedPage, 0); 
    }, [requestedPage, jumpKey]);

    const goToPage = (page: number) => {
        const safePage = Math.max(1, page);
        setCurrentPage(safePage);
        setIframeKey(k => k + 1); 
        onPageChange?.(safePage, 0);
    };

    const pdfIframeUrl = fileSource
        ? `${fileSource}#page=${currentPage}&toolbar=0&navpanes=0&scrollbar=0&view=Fit&pageLayout=SinglePage`
        : "";

    return (
        <Card
            shadow="sm"
            padding="lg"
            radius="lg"
            bg="white"
            className="border border-gray-200"
            style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}
        >
            <Group justify="space-between" mb="sm" wrap="nowrap">
                <Text fw={700} c="#DB763F" size="lg" lineClamp={2}>
                    {chapterTitle}
                </Text>
                <Text c="dimmed" size="sm" lineClamp={1}>
                    {fileName}
                </Text>
            </Group>

            <div
                className="rounded-2xl border border-gray-200 bg-gray-50"
                style={{
                    flex: 1,
                    minHeight: 0,
                    overflow: "hidden", 
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "relative",
                }}
            >
                {canPreviewImage && (
                    <img src={fileSource} alt={fileName} className="h-full w-full rounded-2xl object-contain" />
                )}

                {canPreviewPdf && (
                    <iframe
                        key={iframeKey}
                        src={pdfIframeUrl}
                        title={fileName}
                        scrolling="no"
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            border: "none",
                            borderRadius: "1rem",
                            pointerEvents: "none", 
                            userSelect: "none"
                        }}
                    />
                )}

                {!canPreviewImage && !canPreviewPdf && hasSource && (
                    <Stack align="center" justify="center" h="100%" px="md" gap={8}>
                        <Text size="sm" c="dimmed" ta="center">ไฟล์นี้ไม่รองรับการพรีวิวในหน้านี้</Text>
                        <Button component="a" href={fileSource} target="_blank" rel="noopener noreferrer" variant="light" color="orange">
                            เปิดไฟล์
                        </Button>
                    </Stack>
                )}

                {!hasSource && (
                    <Stack align="center" justify="center" h="100%" px="md" gap={8}>
                        <Text size="sm" c="dimmed" ta="center">ยังไม่มีไฟล์ให้แสดง</Text>
                    </Stack>
                )}
            </div>

            {canPreviewPdf && (
                <Group justify="space-between" mt="md" wrap="nowrap">
                    <Button
                        variant="default"
                        leftSection={<IconChevronLeft size={16} />}
                        disabled={currentPage <= 1}
                        onClick={() => goToPage(currentPage - 1)}
                    >
                        ก่อนหน้า
                    </Button>
                    
                    <Text fw={600} c="dimmed">
                        หน้า {currentPage}
                    </Text>
                    
                    <Button
                        variant="default"
                        rightSection={<IconChevronRight size={16} />}
                        onClick={() => goToPage(currentPage + 1)}
                    >
                        ถัดไป
                    </Button>
                </Group>
            )}
        </Card>
    );
}