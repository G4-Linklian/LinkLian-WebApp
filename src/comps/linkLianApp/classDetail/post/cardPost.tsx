// ─────────────────────────────────────────────
// comps/linkLianApp/class/CardPost.tsx
// Post card รองรับ announcement / assignment / question
// id convention: cp-{element}-{postId}
// ─────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import { ActionIcon, Box, Button, Group, Loader, Modal, Paper, Text, Title } from '@mantine/core';
import { IconDownload, IconExternalLink, IconFileTypePdf, IconMessageCircle, IconPaperclip, IconPhoto, IconPointFilled, IconUser, IconUserOff } from '@tabler/icons-react';
import { PostItem, PostAttachment } from '@/utils/interface/class.types';
import {
    POST_TYPE_LABEL,
    POST_TYPE_COLOR,
    formatDateTime,
    formatDueDate,
    getRoleLabel,
    getInitial,
    isImageType,
    isPdfType,
    isLinkType,
} from '@/utils/function/classHelper';
import { deletePost } from '@/utils/api/social-feed/post';
import { fetchPostAttachmentBlob, triggerPostAttachmentDownload } from '@/utils/api/social-feed/download';
import { AppColors } from '@/constants/colors';
import { decodeRegistrationToken, decodeTeacherToken, decodeToken } from '@/utils/authToken';


interface CardPostProps {
    post: PostItem;
    onTap?: () => void;
    onEdit?: (post: PostItem) => void;
    onDeleted?: (postId: number) => void;
    minimal?: boolean;
    highlighted?: boolean;
}

const parseTokenNumber = (value: unknown): number | null => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function getCurrentUserId(): number | null {
    try {
        const tokens = [
            decodeTeacherToken(),
            decodeRegistrationToken(),
            decodeToken(),
        ].filter(Boolean);

        for (const token of tokens) {
            const userId = parseTokenNumber((token as any)?.user_sys_id);
            if (userId) return userId;

            const fallbackId = parseTokenNumber((token as any)?.user_id);
            if (fallbackId) return fallbackId;
        }

        return null;
    } catch {
        return null;
    }
}

// ── PostTypeTag ───────────────────────────────
function PostTypeTag({ postType, postId }: { postType: string; postId: number }) {
    const color = POST_TYPE_COLOR[postType as keyof typeof POST_TYPE_COLOR] ?? {
        bg: '#F3F4F6',
        text: '#374151',
    };
    const label = POST_TYPE_LABEL[postType as keyof typeof POST_TYPE_LABEL] ?? postType;

    return (
        <span
            id={`cp-type-tag-${postId}`}
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
            style={{ backgroundColor: color.bg, color: color.text }}
        >
            {label}
        </span>
    );
}

// ── AssignmentTags ────────────────────────────
function AssignmentTags({ post }: { post: PostItem }) {
    const pid = post.post_id;
    const tagStyle = {
        backgroundColor: AppColors.primaryPalette[100],
        color: AppColors.primaryPalette[700],
    };
    return (
        <>
            {post.due_date && (
                <span
                    id={`cp-due-date-tag-${pid}`}
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                    style={tagStyle}
                >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatDueDate(post.due_date)}
                </span>
            )}
            {post.max_score != null && (
                <span
                    id={`cp-score-tag-${pid}`}
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                    style={tagStyle}
                >
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {post.max_score % 1 === 0 ? post.max_score.toFixed(0) : post.max_score} คะแนน
                </span>
            )}
            {post.is_group != null && (
                <span
                    id={`cp-group-tag-${pid}`}
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                    style={tagStyle}
                >
                    {post.is_group ? (
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                    ) : (
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                    )}
                    {post.is_group ? 'งานกลุ่ม' : 'งานเดี่ยว'}
                </span>
            )}
        </>
    );
}

// ── ProfileAvatar ─────────────────────────────
function ProfileAvatar({ post }: { post: PostItem }) {
    const pid = post.post_id;

    if (post.is_user_deleted) {
        return (
            <div
                id={`cp-avatar-${pid}`}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400"
            >
                <IconUserOff size={20} stroke={1.8} />
            </div>
        );
    }

    if (post.is_anonymous || !post.user.profile_pic) {
        return (
            <div
                id={`cp-avatar-${pid}`}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-700"
            >
                {post.is_anonymous ? (
                    <IconUser size={20} stroke={1.8} />
                ) : (
                    getInitial(post.user.display_name)
                )}
            </div>
        );
    }

    return (
        <img
            id={`cp-avatar-${pid}`}
            src={post.user.profile_pic}
            alt={post.user.display_name}
            className="h-10 w-10 shrink-0 rounded-full object-cover"
        />
    );
}

const getFileName = (file: PostAttachment): string => {
    if (file.original_name && file.original_name.trim()) return file.original_name;
    try {
        const path = new URL(file.file_url).pathname;
        return decodeURIComponent(path.split('/').pop() ?? 'ไฟล์แนบ');
    } catch {
        return file.file_url.split('/').pop() ?? 'ไฟล์แนบ';
    }
};

const getYouTubeThumbnail = (rawUrl: string): string | null => {
    try {
        const url = new URL(rawUrl);
        if (url.hostname.includes('youtu.be')) {
            const id = url.pathname.replace('/', '').trim();
            return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
        }
        if (url.hostname.includes('youtube.com')) {
            const id = url.searchParams.get('v');
            return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
        }
        return null;
    } catch {
        return null;
    }
};

const getHostLabel = (rawUrl: string): string => {
    try {
        return new URL(rawUrl).hostname.replace(/^www\./, '');
    } catch {
        return 'external link';
    }
};

type AttachmentKind = 'image' | 'pdf' | 'link' | 'other';

const resolveAttachmentKind = (file: PostAttachment): AttachmentKind => {
    const type = (file.file_type || '').toLowerCase();
    const url = (file.file_url || '').toLowerCase();
    const originalName = (file.original_name || '').toLowerCase();
    const source = `${url} ${originalName}`;

    if (isLinkType(type)) return 'link';
    if (isPdfType(type) || source.includes('.pdf')) return 'pdf';

    const looksLikeImageByExt =
        source.includes('.jpg') ||
        source.includes('.jpeg') ||
        source.includes('.png') ||
        source.includes('.gif') ||
        source.includes('.webp') ||
        source.includes('.bmp') ||
        source.includes('.svg');

    if (isImageType(type) || looksLikeImageByExt) return 'image';
    return 'other';
};


function AttachmentSidePreview({
    attachments,
    postId,
    currentIndex,
    onPrev,
    onNext,
}: {
    attachments: PostAttachment[];
    postId: number;
    currentIndex: number;
    onPrev: () => void;
    onNext: () => void;
}) {
    const file = attachments[currentIndex] ?? attachments[0];
    const attachmentKind = resolveAttachmentKind(file);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewError, setPreviewError] = useState(false);
    const [pdfFrameLoaded, setPdfFrameLoaded] = useState(false);
    const [pdfRenderMode, setPdfRenderMode] = useState<'direct' | 'google'>('direct');

    useEffect(() => {
        if (attachmentKind !== 'image' && attachmentKind !== 'pdf') {
            setPreviewUrl(null);
            setPreviewError(false);
            return;
        }

        let isMounted = true;
        let nextObjectUrl: string | null = null;

        setPreviewUrl(null);
        setPreviewError(false);

        fetchPostAttachmentBlob(file.file_url, getFileName(file))
            .then((blob) => {
                if (!isMounted) return;
                if (!blob) {
                    setPreviewError(true);
                    setPreviewUrl(file.file_url);
                    return;
                }
                nextObjectUrl = URL.createObjectURL(blob);
                setPreviewUrl(nextObjectUrl);
            })
            .catch((err) => {
                console.error('[CardPost] preview failed', err);
                if (isMounted) {
                    setPreviewError(true);
                    setPreviewUrl(file.file_url);
                }
            });

        return () => {
            isMounted = false;
            if (nextObjectUrl) {
                URL.revokeObjectURL(nextObjectUrl);
            }
        };
    }, [attachmentKind, file.file_url, file.original_name]);

    useEffect(() => {
        setPdfFrameLoaded(false);
        setPdfRenderMode('direct');
    }, [file.file_url, currentIndex]);

    useEffect(() => {
        if (attachmentKind !== 'pdf') return;
        if (pdfFrameLoaded) return;
        if (!file.file_url.startsWith('http')) return;

        const timeoutId = window.setTimeout(() => {
            setPdfRenderMode((prev) => (prev === 'direct' ? 'google' : prev));
        }, 1500);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [attachmentKind, file.file_url, pdfFrameLoaded]);

    const handleDownload = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await triggerPostAttachmentDownload(file.file_url, getFileName(file));
        } catch (err) {
            console.error('[CardPost] download failed', err);
        }
    };

    const youtubeThumbnail = attachmentKind === 'link' ? getYouTubeThumbnail(file.file_url) : null;
    const hostLabel = getHostLabel(file.file_url);
    const pdfPreviewUrl = previewUrl ?? file.file_url;
    const googleViewerUrl =
        file.file_url.startsWith('http')
            ? `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(file.file_url)}`
            : null;
    const pdfIframeUrl =
        pdfRenderMode === 'google' && googleViewerUrl
            ? googleViewerUrl
            : `${pdfPreviewUrl}#page=1&view=FitH&toolbar=0&navpanes=0&scrollbar=0`;

    return (
        <Paper
            id={`cp-attachment-side-${postId}`}
            radius="md"
            withBorder
            className="block overflow-hidden border-gray-200 bg-gray-50"
        >
            <Box id={`cp-attachment-side-cover-${postId}`} className="relative aspect-[16/10] w-full overflow-hidden bg-white">
                {attachmentKind === 'image' ? (
                    previewUrl ? (
                        <img
                            src={previewUrl}
                            alt={getFileName(file)}
                            className="h-full w-full object-cover"
                            onError={() => {
                                setPreviewError(true);
                                setPreviewUrl(null);
                            }}
                        />
                    ) : (
                        <Box className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gray-100 text-gray-600">
                            {previewError ? <IconPhoto size={40} stroke={1.8} /> : <Loader size="md" color="gray" />}
                            <Text size="xs" fw={600}>{previewError ? 'โหลดภาพตัวอย่างไม่สำเร็จ' : 'กำลังโหลดภาพ...'}</Text>
                        </Box>
                    )
                ) : attachmentKind === 'pdf' ? (
                    <Box className="relative h-full w-full bg-gray-100">
                        {pdfPreviewUrl ? (
                            <>
                                <iframe
                                    src={pdfIframeUrl}
                                    title={getFileName(file)}
                                    className="absolute inset-0 h-full w-full bg-white"
                                    onLoad={() => setPdfFrameLoaded(true)}
                                />
                                <Box className="absolute inset-0 z-10" />
                                <Box className="absolute bottom-0 right-0 top-0 z-20 w-3 bg-white" />
                            </>
                        ) : null}
                        {!pdfPreviewUrl && (
                            <Box className="absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-2 text-gray-700">
                                {previewError ? <IconFileTypePdf size={40} className="text-red-500" stroke={1.8} /> : <Loader size="md" color="gray" />}
                                <Text size="xs" fw={600}>{previewError ? 'ไม่สามารถแสดงตัวอย่าง PDF' : 'กำลังโหลด PDF...'}</Text>
                            </Box>
                        )}
                    </Box>
                ) : attachmentKind === 'link' ? (
                    <a
                        href={file.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="relative flex h-full w-full items-center justify-center bg-blue-50 hover:bg-blue-100 transition-colors"
                    >
                        {youtubeThumbnail ? (
                            <img
                                src={youtubeThumbnail}
                                alt={getFileName(file)}
                                className="h-full w-full object-cover"
                                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-blue-500">
                                <IconExternalLink size={32} stroke={1.6} />
                                <Text size="xs" c="blue.6" fw={500}>{hostLabel}</Text>
                            </div>
                        )}
                    </a>
                ) : (
                    <Box className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gray-100 text-gray-600">
                        <IconPaperclip size={40} stroke={1.8} />
                        <Text size="xs" fw={600} tt="uppercase">{file.file_type || 'FILE'}</Text>
                    </Box>
                )}

                {attachments.length > 1 && (
                    <Group className="absolute bottom-2 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/35 px-2 py-1" gap={6}>
                        {attachments.map((_, index) => (
                            <IconPointFilled
                                key={`${postId}-${index}`}
                                size={8}
                                className={index === currentIndex ? 'text-white' : 'text-white/45'}
                            />
                        ))}
                    </Group>
                )}
            </Box>

            <Box
                className="space-y-1 px-3 py-3"
                style={{ backgroundColor: AppColors.primaryPalette[300] }}
            >
                <Text id={`cp-attachment-side-name-${postId}`} className="truncate" size="sm" fw={600} c="black">
                    {getFileName(file)}
                </Text>
                <Group justify="space-between" className="pt-1" wrap="nowrap">
                    {attachmentKind === 'link' ? (
                        <ActionIcon
                            component="a"
                            href={file.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                            aria-label="เปิดลิงก์"
                            radius="xl"
                            variant="unstyled"
                            styles={{
                                root: {
                                    backgroundColor: AppColors.primaryPalette[500],
                                    color: '#fff',
                                    '&:hover': { backgroundColor: AppColors.primaryPalette[300] },
                                },
                            }}
                            className="shadow transition-all duration-150 hover:scale-110 active:scale-95"
                        >
                            <IconExternalLink size={18} stroke={2.2} />
                        </ActionIcon>
                    ) : (
                        <ActionIcon
                            onClick={(e) => { void handleDownload(e); }}
                            aria-label="Download attachment"
                            radius="xl"
                            variant="unstyled"
                            styles={{
                                root: {
                                    backgroundColor: AppColors.primaryPalette[500],
                                    color: '#fff',
                                    '&:hover': { backgroundColor: AppColors.primaryPalette[300] },
                                },
                            }}
                            className="shadow transition-all duration-150 hover:scale-110 active:scale-95"
                        >
                            <IconDownload size={18} stroke={2.2} />
                        </ActionIcon>
                    )}

                </Group>
                {attachments.length > 1 && (
                    <Text id={`cp-attachment-side-more-${postId}`} size="11px" fw={500} c="white">
                        ไฟล์ {currentIndex + 1}/{attachments.length}
                    </Text>
                )}
            </Box>
        </Paper>
    );
}

// ── MoreMenu ──────────────────────────────────
function MoreMenu({
    post,
    onEdit,
    onDeleted,
}: {
    post: PostItem;
    onEdit?: (post: PostItem) => void;
    onDeleted?: (postId: number) => void;
}) {
    const [open, setOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmDeleteOpened, setConfirmDeleteOpened] = useState(false);
    const currentUserId = getCurrentUserId();
    const isOwner = currentUserId === post.user.user_sys_id;
    const pid = post.post_id;

    if (!isOwner) return null;

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await deletePost(currentUserId!, pid, post.post_content_id);
            if (res.success) {
                onDeleted?.(pid);
                setConfirmDeleteOpened(false);
            }
        } catch (err) {
            console.error('[CardPost] delete error:', err);
        } finally {
            setIsDeleting(false);
            setOpen(false);
        }
    };

    return (
        <div id={`cp-more-menu-wrapper-${pid}`} className="relative">
            <button
                id={`cp-more-btn-${pid}`}
                aria-label="ตัวเลือกเพิ่มเติม"
                aria-haspopup="true"
                aria-expanded={open}
                onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
                className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div
                        id={`cp-more-dropdown-${pid}`}
                        className="absolute right-0 top-full z-50 mt-1 w-36 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl"
                    >
                        {onEdit && (
                            <button
                                id={`cp-edit-btn-${pid}`}
                                onClick={(e) => { e.stopPropagation(); setOpen(false); onEdit(post); }}
                                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-amber-50"
                            >
                                <svg className="h-4 w-4 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                แก้ไขโพสต์
                            </button>
                        )}
                        <button
                            id={`cp-delete-btn-${pid}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDeleteOpened(true);
                                setOpen(false);
                            }}
                            disabled={isDeleting}
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                        >
                            {isDeleting ? (
                                <span
                                    id={`cp-delete-spinner-${pid}`}
                                    className="h-4 w-4 animate-spin rounded-full border-2 border-red-300 border-t-red-600"
                                />
                            ) : (
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            )}
                            ลบโพสต์
                        </button>
                    </div>
                </>
            )}

            <Modal
                opened={confirmDeleteOpened}
                onClose={() => {
                    if (isDeleting) return;
                    setConfirmDeleteOpened(false);
                }}
                centered
                zIndex={12000}
                radius="lg"
                padding="lg"
                size="md"
                className="text-center flex flex-col justify-center items-center"
                overlayProps={{ backgroundOpacity: 0.45, blur: 3 }}
                withCloseButton={false}
            >
                <Title
                    order={2}
                    className="text-center font-semibold"
                    size="xl"
                    mb="md"
                    mt="lg"
                >
                    ยืนยันการลบ
                </Title>
                <Text size="sm" c="dimmed" ta="center">
                    ต้องการลบโพสต์นี้หรือไม่?
                </Text>
                <Group mt="lg" justify="flex-end" gap="sm">
                    <Button
                        variant="default"
                        radius="md"
                        onClick={() => setConfirmDeleteOpened(false)}
                        disabled={isDeleting}
                    >
                        ยกเลิก
                    </Button>
                    <Button
                        color="red"
                        radius="md"
                        onClick={(e) => {
                            e.stopPropagation();
                            void handleDelete();
                        }}
                        loading={isDeleting}
                    >
                        ยืนยันการลบ
                    </Button>
                </Group>
            </Modal>
        </div>
    );
}

// ── renderTextWithLinks ───────────────────────
const INLINE_URL_REGEX = /(https?:\/\/[^\s]+)/g;

function renderTextWithLinks(text: string): React.ReactNode {
    // split with capturing group → odd indices are the captured URL parts
    return text.split(INLINE_URL_REGEX).map((part, i) => {
        if (i % 2 === 1) {
            return (
                <a
                    key={i}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="break-all text-blue-600 underline hover:text-blue-800"
                >
                    {part}
                </a>
            );
        }
        return part;
    });
}

// ── CardPost ──────────────────────────────────
export default function CardPost({
    post,
    onTap,
    onEdit,
    onDeleted,
    minimal = false,
    highlighted = false,
}: CardPostProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [attachmentIndex, setAttachmentIndex] = useState(0);
    const pid = post.post_id;
    const shouldTruncate = post.content.length > 200;
    const attachmentCount = post.attachments?.length ?? 0;

    return (
        <div
            id={`cp-card-${pid}`}
            data-testid={`cp-card-${pid}`}
            onClick={onTap}
            className={`group mb-6 mx-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white transition-shadow duration-200 hover:shadow-lg hover:shadow-amber-100/60 ${onTap ? 'cursor-pointer' : ''} ${highlighted ? 'ring-2 ring-amber-400 ring-offset-2' : ''}`}
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
        >
            {/* Body */}
            <div id={`cp-body-${pid}`} className="p-6">

                {/* Tags + more menu row */}
                <div id={`cp-header-row-${pid}`} className="flex flex-wrap items-center justify-between gap-2">
                    <div id={`cp-tags-${pid}`} className="flex flex-wrap items-center gap-1.5">
                        <PostTypeTag postType={post.post_type} postId={pid} />
                        {post.post_type === 'assignment' && <AssignmentTags post={post} />}
                    </div>
                    {!minimal && <MoreMenu post={post} onEdit={onEdit} onDeleted={onDeleted} />}
                </div>

                {/* Profile row */}
                <div id={`cp-profile-row-${pid}`} className="mt-3 flex items-center gap-3">
                    <ProfileAvatar post={post} />
                    <div id={`cp-author-info-${pid}`} className="min-w-0 flex-1">
                        <p id={`cp-author-name-${pid}`} className="truncate text-sm font-semibold text-gray-800">
                            {post.user.display_name ?? 'ไม่ทราบชื่อ'}
                        </p>
                        {!post.is_anonymous && post.user.role_name && (
                            <p id={`cp-author-role-${pid}`} className="text-xs text-gray-400">
                                {getRoleLabel(post.user.role_name)}
                            </p>
                        )}
                    </div>
                </div>

                <div id={`cp-timestamp-${pid}`} className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatDateTime(post.created_at)}
                </div>

                {/* ── เนื้อหาอยู่บน ไฟล์อยู่ล่าง ── */}
                <div className="mt-2 flex flex-col gap-3">
                    <div>
                        {/* Title */}
                        {post.title && (
                            <h3 id={`cp-title-${pid}`} className="mt-3 text-xl font-extrabold text-gray-900">
                                {post.title}
                            </h3>
                        )}

                        {/* Content */}
                        <div id={`cp-content-wrapper-${pid}`} className="mt-2">
                            <p
                                id={`cp-content-${pid}`}
                                className={`text-sm leading-relaxed text-gray-700 ${!isExpanded && shouldTruncate ? 'line-clamp-4' : ''}`}
                            >
                                {renderTextWithLinks(post.content)}
                            </p>
                            {shouldTruncate && (
                                <button
                                    id={`cp-expand-btn-${pid}`}
                                    aria-expanded={isExpanded}
                                    onClick={(e) => { e.stopPropagation(); setIsExpanded((v) => !v); }}
                                    className="mt-1 text-sm font-medium text-amber-600 hover:text-amber-700"
                                >
                                    {isExpanded ? 'ซ่อน' : '...เพิ่มเติม'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Attachments — เนื้อหาอยู่กลาง ปุ่มซ้าย/ขวาชิดขอบ card */}
                    {post.attachments && post.attachments.length > 0 && (
                        <div id={`cp-attachments-${pid}`} className="flex items-center gap-2">
                            {/* ปุ่มซ้าย */}
                            {attachmentCount > 1 ? (
                                <button
                                    type="button"
                                    aria-label="ไฟล์ก่อนหน้า"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAttachmentIndex((prev) => (prev === 0 ? attachmentCount - 1 : prev - 1)); }}
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white shadow transition-transform duration-150 hover:scale-110 active:scale-95"
                                    style={{ backgroundColor: AppColors.primaryPalette[300] }}
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                            ) : (
                                <div className="w-8 shrink-0" />
                            )}

                            {/* Preview — กลาง */}
                            <div className="w-2/3 mx-auto">
                                <AttachmentSidePreview
                                    attachments={post.attachments}
                                    postId={pid}
                                    currentIndex={attachmentIndex}
                                    onPrev={() => setAttachmentIndex((prev) => (prev === 0 ? attachmentCount - 1 : prev - 1))}
                                    onNext={() => setAttachmentIndex((prev) => (prev + 1) % attachmentCount)}
                                />
                            </div>

                            {/* ปุ่มขวา */}
                            {attachmentCount > 1 ? (
                                <button
                                    type="button"
                                    aria-label="ไฟล์ถัดไป"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAttachmentIndex((prev) => (prev + 1) % attachmentCount); }}
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white shadow transition-transform duration-150 hover:scale-110 active:scale-95"
                                    style={{ backgroundColor: AppColors.primaryPalette[300] }}
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            ) : (
                                <div className="w-8 shrink-0" />
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom bar */}
            <div id={`cp-bottom-bar-${pid}`} className="mt-3 flex items-center justify-end gap-2 border-t border-gray-50 px-6 py-2.5">
                <Button
                    id={`cp-comment-btn-${pid}`}
                    aria-label="เปิดความคิดเห็น"
                    onClick={(e) => { e.stopPropagation(); onTap?.(); }}
                    variant="subtle"
                    color="orange"
                    radius="xl"
                    size="compact-sm"
                    leftSection={<IconMessageCircle size={16} stroke={1.8} />}
                >
                    ความคิดเห็น
                </Button>
            </div>
        </div>
    );
}
