import React, { useMemo, useState } from "react";
import {
    ActionIcon,
    Avatar,
    Badge,
    Button,
    Card,
    Group,
    Select,
    Stack,
    Text,
    TextInput,
    Tooltip,
} from "@mantine/core";
import {
    IconArrowBigUpLineFilled,
    IconCircleCheckFilled,
    IconCornerDownRight,
    IconLayoutSidebarRightCollapse,
    IconLayoutSidebarRightExpand,
    IconMessageCircle,
    IconSend2,
    IconUser,
} from "@tabler/icons-react";

interface QaQuestion {
    qa_question_id: number;
    qa_live_id: number;
    question: string;
    asker: {
        user_sys_id: number | null;
        first_name: string;
        last_name: string;
        profile_pic: string | null;
    };
    post_id: number;
    attachment_id: number;
    slide_number?: number;
    status: string;
    upvote_count: number;
    has_upvoted?: boolean;
    created_at: string;
    flag_valid: boolean;
    file_name?: string;
    is_anonymous?: boolean;
}

interface QuestionPanelProps {
    fileName: string;
    currentSlide: number;
    questions?: QaQuestion[];
    showQuestionPanel: boolean;
    currentUserId?: number;
    currentUserProfile?: {
        first_name?: string;
        last_name?: string;
        profile_pic?: string | null;
    } | null;
    fileFilterOptions?: Array<{ value: string; label: string }>;
    selectedFileFilter?: string;
    onFileFilterChange?: (value: string) => void;
    onToggleQuestionPanel: () => void;
    onSendQuestion?: (payload: {
        question: string;
        isAnonymous: boolean;
        fileName: string;
        slideNumber?: number;
    }) => Promise<void>;
    onJumpToQuestion?: (question: QaQuestion) => void;
    onUpvoteQuestion?: (questionId: number) => void;
    isLiveOwner?: boolean; 
    onMarkAsAnswered?: (questionId: number, currentStatus: string) => void;
    isReadOnly?: boolean;
}

const formatTime = (isoString: string) => {
    try {
        const date = new Date(isoString);
        if (Number.isNaN(date.getTime())) return "-";
        return date.toLocaleTimeString("th-TH", { hour: "numeric", minute: "numeric" });
    } catch {
        return "-";
    }
};

export default function QuestionPanel({
    fileName,
    currentSlide,
    questions = [],
    showQuestionPanel,
    currentUserId,
    currentUserProfile,
    fileFilterOptions,
    selectedFileFilter = "all",
    onFileFilterChange,
    onToggleQuestionPanel,
    onSendQuestion,
    onJumpToQuestion,
    onUpvoteQuestion,
    onMarkAsAnswered,
    isLiveOwner,
    isReadOnly = false,
}: QuestionPanelProps) {
    const [questionText, setQuestionText] = useState("");
    const [isSending, setIsSending] = useState(false);

    const displayName = (q: QaQuestion) => {
        const askerName = `${q.asker?.first_name || ""} ${q.asker?.last_name || ""}`.trim();
        if (askerName) return askerName;

        const isCurrentUserQuestion = currentUserId != null && q.asker?.user_sys_id === currentUserId;
        if (isCurrentUserQuestion) {
            const profileName = `${currentUserProfile?.first_name || ""} ${currentUserProfile?.last_name || ""}`.trim();
            if (profileName) return profileName;
        }

        return "ผู้ใช้ไม่ระบุตัวตน";
    };

    const answeredStatuses = useMemo(() => new Set(["ANSWERED", "RESOLVED", "DONE"]), []);

    const sortedQuestions = useMemo(() => {
        return [...questions].sort((a, b) => {
            if (b.upvote_count !== a.upvote_count) {
                return b.upvote_count - a.upvote_count; 
            }
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        });
    }, [questions]);

    const hasQuestions = sortedQuestions.length > 0;

    const handleSend = async () => {
        if (isReadOnly) return;
        const message = questionText.trim();
        if (!message || !onSendQuestion) return;

        setIsSending(true);
        try {
            await onSendQuestion({
                question: message,
                isAnonymous: false,
                fileName,
                slideNumber: currentSlide,
            });
            setQuestionText("");
        } catch (error) {
            console.error("Failed to send question:", error);
        } finally {
            setIsSending(false);
        }
    };

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
                <Group gap={6}>
                    <Text fw={700} size="lg">
                        คำถามและความคิดเห็น
                    </Text>
                </Group>
                <Group gap="xs" wrap="nowrap">
                    <Badge variant="light" color="orange" radius="xl" size="lg">
                        {hasQuestions ? sortedQuestions.length : 0}
                    </Badge>
                    <Tooltip label={showQuestionPanel ? "ซ่อนคำถาม" : "แสดงคำถาม"}>
                        <ActionIcon variant="default" size="lg" onClick={onToggleQuestionPanel}>
                            {showQuestionPanel ? <IconLayoutSidebarRightCollapse size={18} /> : <IconLayoutSidebarRightExpand size={18} />}
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Group>

            <Stack gap={8} mb="md">
                <Text c="dimmed" size="sm">
                    แสดงคำถามและความคิดเห็นต่อ:
                </Text>
                <Select
                    data={(fileFilterOptions && fileFilterOptions.length > 0)
                        ? fileFilterOptions
                        : [
                            { value: "all", label: "บทเรียนทั้งหมด" },
                            { value: "current", label: `ไฟล์ที่เปิดอยู่ (${fileName})` },
                        ]}
                    value={selectedFileFilter}
                    onChange={(value) => onFileFilterChange?.(value || "all")}
                    radius="xl"
                    searchable
                    nothingFoundMessage="ไม่พบไฟล์"
                    comboboxProps={{ withinPortal: false }}
                />
            </Stack>

            <Stack gap="sm" style={{ flex: 1, overflowY: "auto" }}>
                {hasQuestions ? (
                    sortedQuestions.map((q) => {
                        const name = displayName(q);
                        const color = "orange";
                        const isUpvotedByCurrentUser = q.has_upvoted === true;
                        const isAnonymousQuestion = q.is_anonymous === true;
                        const isCurrentUserQuestion = currentUserId != null && q.asker?.user_sys_id === currentUserId;

                        const avatarSrc = isAnonymousQuestion
                            ? undefined
                            : q.asker?.profile_pic || (isCurrentUserQuestion ? currentUserProfile?.profile_pic || undefined : undefined);

                        const isAnswered = answeredStatuses.has((q.status || "").toUpperCase());

                        return (
                            <Group key={q.qa_question_id} align="flex-start" wrap="nowrap" style={{ width: "100%", minWidth: 0 }}>
                                <Avatar
                                    src={avatarSrc}
                                    color={isAnonymousQuestion ? "gray" : color}
                                    radius="xl"
                                >
                                    {isAnonymousQuestion ? (
                                        <IconUser size={24} stroke={1.5} />
                                    ) : (
                                        name.charAt(0).toUpperCase()
                                    )}
                                </Avatar>
                                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3" style={{ width: "100%", minWidth: 0 }}>
                                    <Group gap="xs" justify="space-between" wrap="nowrap" style={{ minWidth: 0 }}>
                                        <Group gap="xs" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
                                            <Text fw={500} size="xs" c="dimmed" truncate>{name}</Text>
                                            {isAnswered && (
                                                <Tooltip label="ตอบแล้ว">
                                                    <IconCircleCheckFilled size={16} color="#16A34A" />
                                                </Tooltip>
                                            )}
                                            <Text c="dimmed" size="xs" style={{ flexShrink: 0 }}>{formatTime(q.created_at)}</Text>
                                        </Group>

                                        <Button
                                            size="compact-xs"
                                            radius="xl"
                                            variant={isUpvotedByCurrentUser ? "light" : "subtle"}
                                            color={isUpvotedByCurrentUser ? "orange" : "gray"}
                                            leftSection={<IconArrowBigUpLineFilled size={14} />}
                                            onClick={() => onUpvoteQuestion?.(q.qa_question_id)}
                                            styles={{ label: { fontSize: "12px" } }}
                                        >
                                            {q.upvote_count > 0 ? q.upvote_count : "โหวต"}
                                        </Button>
                                    </Group>

                                    <Text
                                        size="sm"
                                        fw={600}
                                        c="dark.8"
                                        mt={8}
                                        mb={8}
                                        style={{
                                            lineHeight: 1.6,
                                            whiteSpace: "pre-wrap",
                                            overflowWrap: "anywhere",
                                            wordBreak: "break-word",
                                        }}
                                    >
                                        {q.question}
                                    </Text>

                                    <Stack gap={4} mt={6}>
                                        <Text size="xs" c="dimmed" lineClamp={1} style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}>
                                            {q.file_name || "ไม่ระบุชื่อไฟล์"}
                                            {q.slide_number ? ` • หน้า ${q.slide_number}` : ""}
                                        </Text>

                                        {(q.slide_number || isLiveOwner) && (
                                            <Group wrap="nowrap" justify="space-between" w="100%">
                                                {q.slide_number ? (
                                                    <Button
                                                        size="compact-xs"
                                                        variant="subtle"
                                                        color="orange"
                                                        px={4}
                                                        leftSection={<IconCornerDownRight size={14} />}
                                                        onClick={() => onJumpToQuestion?.(q)}
                                                    >
                                                        ไปที่หน้านี้
                                                    </Button>
                                                ) : <div />} 
                                                
                                                {isLiveOwner && (
                                                    <Button
                                                        size="compact-xs"
                                                        radius="xl"
                                                        variant={isAnswered ? "filled" : "light"}
                                                        color="green"
                                                        ml="auto"
                                                        leftSection={<IconCircleCheckFilled size={14} />}
                                                        onClick={() => onMarkAsAnswered?.(q.qa_question_id, q.status)}
                                                        styles={{ label: { fontSize: "11px", fontWeight: 500 } }}
                                                    >
                                                        {isAnswered ? "ตอบแล้ว" : "ตอบคำถาม"}
                                                    </Button>
                                                )}
                                            </Group>
                                        )}
                                    </Stack>
                                </div>
                            </Group>
                        );
                    })
                ) : null}
            </Stack>

            <Group mt="md" mb="xs" justify="flex-end" wrap="nowrap">
                <Text c="dimmed" size="xs">ไฟล์ {fileName} • หน้า {currentSlide}</Text>
            </Group>

            {!isReadOnly ? (
                <Group wrap="nowrap" align="center">
                    <TextInput
                        placeholder="พิมพ์ข้อความ..."
                        value={questionText}
                        onChange={(event) => setQuestionText(event.currentTarget.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                event.preventDefault();
                                void handleSend();
                            }
                        }}
                        style={{ flex: 1 }}
                        radius="xl"
                    />
                    <ActionIcon
                        size={42}
                        radius="xl"
                        variant="filled"
                        color="orange"
                        onClick={() => {
                            void handleSend();
                        }}
                        loading={isSending}
                        disabled={!questionText.trim()}
                    >
                        <IconSend2 size={18} />
                    </ActionIcon>
                </Group>
            ) : (
                <Text size="xs" c="dimmed" ta="center">
                    ไม่สามารถพิมพ์คอมเมนต์ได้
                </Text>
            )}
        </Card>
    );
}