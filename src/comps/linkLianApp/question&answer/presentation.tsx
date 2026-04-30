import React, { useState, useEffect, useRef, Component, ErrorInfo, ReactNode } from "react";
import { Card, Group, Stack, Text, Button, NumberInput } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { pdfjs } from "react-pdf";

const Document = dynamic(
    () => import("react-pdf").then((mod) => {
        mod.pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
        return mod.Document;
    }),
    { ssr: false }
);

const Page = dynamic(
    () => import("react-pdf").then((mod) => mod.Page),
    { ssr: false }
);

interface ErrorBoundaryProps {
    children: ReactNode;
    fileSource: string;
    fallback: ReactNode;
}

class PdfErrorBoundary extends Component<ErrorBoundaryProps, { hasError: boolean }> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(_: Error) {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("ระงับ Error จากไฟล์ PDF สำเร็จ ป้องกันเว็บพัง:", error);
    }

    componentDidUpdate(prevProps: ErrorBoundaryProps) {
        if (prevProps.fileSource !== this.props.fileSource) {
            this.setState({ hasError: false });
        }
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }
        return this.props.children;
    }
}

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

const pdfOptions = {
    cMapUrl: "/cmaps/",
    cMapPacked: true,
    standardFontDataUrl: "/standard_fonts/",
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
    const [pdfPageCount, setPdfPageCount] = useState<number | undefined>(undefined);
    const [pageWidth, setPageWidth] = useState<number | undefined>(undefined);
    const [pageHeight, setPageHeight] = useState<number | undefined>(undefined);
    const [pageAspectRatio, setPageAspectRatio] = useState<number | undefined>(undefined);
    const [isClient, setIsClient] = useState(false);
    const previewRef = useRef<HTMLDivElement | null>(null);

    const [inputPage, setInputPage] = useState<string | number>(1);

    const fileSource = fileUrl || "";
    const displayType = `${fileType || ""} ${fileName || ""} ${fileSource}`.toLowerCase();

    const canPreviewImage = Boolean(fileSource) && isImage(displayType);
    const canPreviewPdf = Boolean(fileSource) && isPdf(displayType) && !canPreviewImage;
    const hasSource = Boolean(fileSource);

    const normalizedTotalPages = pdfPageCount && pdfPageCount > 0
        ? pdfPageCount
        : canPreviewImage
            ? 1
            : undefined;

    const isAtLastPage = normalizedTotalPages
        ? currentPage >= normalizedTotalPages
        : false;

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        setCurrentPage(1);
        setPdfPageCount(undefined);
    }, [fileSource]);

    useEffect(() => {
        if (!previewRef.current) return;
        const updateWidth = () => {
            const nextWidth = previewRef.current?.clientWidth || 0;
            const nextHeight = previewRef.current?.clientHeight || 0;
            setPageWidth(nextWidth > 0 ? nextWidth : undefined);
            setPageHeight(nextHeight > 0 ? nextHeight : undefined);
        };

        updateWidth();

        const observer = new ResizeObserver(updateWidth);
        observer.observe(previewRef.current);

        return () => {
            observer.disconnect();
        };
    }, []);

    const resolvedPageWidth = (() => {
        if (!pageWidth) return undefined;
        if (!pageHeight || !pageAspectRatio) return pageWidth;
        const fitWidth = pageHeight * pageAspectRatio;
        return Math.min(pageWidth, fitWidth);
    })();

    useEffect(() => {
        if (!normalizedTotalPages) return;
        if (currentPage <= normalizedTotalPages) return;
        setCurrentPage(normalizedTotalPages);
        onPageChange?.(normalizedTotalPages, normalizedTotalPages);
    }, [currentPage, normalizedTotalPages, onPageChange]);

    useEffect(() => {
        if (!requestedPage || requestedPage < 1) return;
        const safePage = normalizedTotalPages
            ? Math.min(requestedPage, normalizedTotalPages)
            : requestedPage;
        setCurrentPage(safePage);
        onPageChange?.(safePage, normalizedTotalPages ?? 0);
    }, [requestedPage, jumpKey, normalizedTotalPages, onPageChange]);

    useEffect(() => {
        setInputPage(currentPage);
    }, [currentPage]);

    const goToPage = (page: number) => {
        const safePage = Math.max(1, page);
        const boundedPage = normalizedTotalPages
            ? Math.min(safePage, normalizedTotalPages)
            : safePage;
        if (boundedPage === currentPage) return;
        setCurrentPage(boundedPage);
        onPageChange?.(boundedPage, normalizedTotalPages ?? 0);
    };

    const handlePageSubmit = () => {
        const pageNum = Number(inputPage);
        if (!isNaN(pageNum) && pageNum >= 1) {
            goToPage(pageNum);
            setInputPage(pageNum);
        } else {
            setInputPage(currentPage);
        }
    };

    const ErrorFallbackUI = (
        <Stack align="center" justify="center" h="100%" px="md" gap={8}>
            <Text size="sm" c="red" ta="center">ไม่สามารถแสดงไฟล์นี้ได้</Text>
        </Stack>
    );

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
                ref={previewRef}
            >
                {canPreviewImage && (
                    <div className="absolute inset-0 overflow-y-auto rounded-2xl">
                        <img
                            src={fileSource}
                            alt={fileName}
                            className="w-full h-auto block"
                        />
                    </div>
                )}

                {canPreviewPdf && isClient && (
                    <PdfErrorBoundary fileSource={fileSource} fallback={ErrorFallbackUI}>
                        <Document
                            key={fileSource}
                            file={fileSource}
                            options={pdfOptions}
                            onLoadSuccess={(pdf: { numPages: number }) => {
                                setPdfPageCount(pdf.numPages || undefined);
                                onPageChange?.(1, pdf.numPages || 0);
                            }}
                            onLoadError={(error: Error) => {
                                setPdfPageCount(undefined);
                                console.error("Failed to load PDF document.", fileSource);
                            }}
                            loading={
                                <Text size="sm" c="dimmed">กำลังโหลดไฟล์ PDF...</Text>
                            }
                            error={ErrorFallbackUI}
                        >
                            <Page
                                pageNumber={currentPage}
                                width={resolvedPageWidth}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                                onLoadSuccess={(page) => {
                                    if (!pageAspectRatio) {
                                        const { width, height } = page.getViewport({ scale: 1 });
                                        if (height > 0) {
                                            setPageAspectRatio(width / height);
                                        }
                                    }
                                }}
                            />
                        </Document>
                    </PdfErrorBoundary>
                )}

                {!canPreviewImage && !canPreviewPdf && hasSource && (
                    <Stack align="center" justify="center" h="100%" px="md" gap={8}>
                        <Text size="sm" c="dimmed" ta="center">ไม่สามารถแสดงไฟล์นี้ได้</Text>
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

                    <Group gap="xs" align="center">
                        <Text fw={600} c="dimmed">หน้า</Text>
                        <NumberInput
                            value={inputPage}
                            onChange={setInputPage}
                            onBlur={handlePageSubmit}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handlePageSubmit();
                            }}
                            min={1}
                            max={normalizedTotalPages || 1}
                            hideControls
                            size="sm"
                            w={70}
                            styles={{ input: { textAlign: 'center', fontWeight: 600 } }}
                        />
                        {normalizedTotalPages && (
                            <Text fw={600} c="dimmed">/ {normalizedTotalPages}</Text>
                        )}
                    </Group>

                    <Button
                        variant="default"
                        rightSection={<IconChevronRight size={16} />}
                        disabled={isAtLastPage}
                        onClick={() => goToPage(currentPage + 1)}
                    >
                        ถัดไป
                    </Button>
                </Group>
            )}
        </Card>
    );
}