// ─────────────────────────────────────────────
// comps/linkLianApp/class/CardPost.tsx
// Post card รองรับ announcement / assignment / question
// id convention: cp-{element}-{postId}
// ─────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
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
import { getSocialFeedUserId } from '@/hooks/useAuthIdentity';


interface CardPostProps {
    post: PostItem;
    onTap?: () => void;
    onEdit?: (post: PostItem) => void;
    onDeleted?: (postId: number) => void;
    minimal?: boolean;
    highlighted?: boolean;
}

function getCurrentUserId(): number | null {
    return getSocialFeedUserId();
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

    if (post.is_anonymous || !post.user.profile_pic) {
        return (
            <div
                id={`cp-avatar-${pid}`}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-700"
            >
                {post.is_anonymous ? (
                    <svg className="h-5 w-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                            clipRule="evenodd"
                        />
                    </svg>
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

const getSizeFromQuery = (url: string): number | null => {
    try {
        const params = new URL(url).searchParams;
        const candidates = ['size', 'file_size', 'filesize', 'contentLength'];
        for (const key of candidates) {
            const value = Number(params.get(key));
            if (Number.isFinite(value) && value > 0) return value;
        }
        return null;
    } catch {
        return null;
    }
};

const formatFileSize = (bytes: number | null): string => {
    if (!bytes || bytes <= 0) return '-';
    const units = ['B', 'KB', 'MB', 'GB'];
    let value = bytes;
    let idx = 0;
    while (value >= 1024 && idx < units.length - 1) {
        value /= 1024;
        idx += 1;
    }
    return `${value >= 100 || idx === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[idx]}`;
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
    const [fileSize, setFileSize] = useState<number | null>(() => getSizeFromQuery(file.file_url));
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewError, setPreviewError] = useState(false);
    const [pdfFrameLoaded, setPdfFrameLoaded] = useState(false);
    const [pdfRenderMode, setPdfRenderMode] = useState<'direct' | 'google'>('direct');

    useEffect(() => {
        const sizeFromQuery = getSizeFromQuery(file.file_url);
        if (sizeFromQuery) {
            setFileSize(sizeFromQuery);
            return;
        }

        let isMounted = true;
        const controller = new AbortController();

        fetch(file.file_url, {
            method: 'HEAD',
            signal: controller.signal,
        })
            .then((res) => {
                const size = Number(res.headers.get('content-length'));
                if (isMounted && Number.isFinite(size) && size > 0) {
                    setFileSize(size);
                    return;
                }
                return fetchPostAttachmentBlob(file.file_url, getFileName(file)).then((blob) => {
                    if (isMounted && blob && blob.size > 0) {
                        setFileSize(blob.size);
                    }
                });
            })
            .catch(() => {
                void fetchPostAttachmentBlob(file.file_url, getFileName(file))
                    .then((blob) => {
                        if (isMounted && blob && blob.size > 0) {
                            setFileSize(blob.size);
                            return;
                        }
                        if (isMounted) setFileSize(null);
                    })
                    .catch(() => {
                        if (isMounted) setFileSize(null);
                    });
            });

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [file.file_url]);

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

    const handleDownload = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        void triggerPostAttachmentDownload(file.file_url, getFileName(file)).catch((err) => {
            console.error('[CardPost] download failed', err);
        });
    };

    const handleOpenPreview = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const targetUrl = previewUrl ?? file.file_url;
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
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
        <div
            id={`cp-attachment-side-${postId}`}
            className="block overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
        >
            <div id={`cp-attachment-side-cover-${postId}`} className="relative aspect-[16/10] w-full overflow-hidden bg-white">
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
                        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gray-100 text-gray-600">
                            <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs font-semibold">{previewError ? 'โหลดภาพตัวอย่างไม่สำเร็จ' : 'กำลังโหลดภาพ...'}</span>
                        </div>
                    )
                ) : attachmentKind === 'pdf' ? (
                    <div className="relative h-full w-full bg-gray-100">
                        {pdfPreviewUrl ? (
                            <>
                                <iframe
                                    src={pdfIframeUrl}
                                    title={getFileName(file)}
                                    className="absolute inset-0 h-full w-full bg-white"
                                    onLoad={() => setPdfFrameLoaded(true)}
                                />
                                <div className="absolute inset-0 z-10" />
                                <div className="absolute bottom-0 right-0 top-0 z-20 w-3 bg-white" />
                            </>
                        ) : null}
                        {!pdfPreviewUrl && (
                            <div className="absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-2 text-gray-700">
                                <svg className="h-10 w-10 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 3a2 2 0 012-2h5.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V17a2 2 0 01-2 2H6a2 2 0 01-2-2V3zm5 1a1 1 0 00-1 1v1a1 1 0 102 0V5a1 1 0 00-1-1zm-1 6a1 1 0 000 2h4a1 1 0 100-2H8zm0 3a1 1 0 000 2h4a1 1 0 100-2H8z" clipRule="evenodd" />
                                </svg>
                                <span className="text-xs font-semibold">{previewError ? 'ไม่สามารถแสดงตัวอย่าง PDF' : 'กำลังโหลด PDF...'}</span>
                            </div>
                        )}
                    </div>
                ) : attachmentKind === 'link' ? (
                    <div className="relative h-full w-full">
                        {youtubeThumbnail ? (
                            <img
                                src={youtubeThumbnail}
                                alt={getFileName(file)}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        ) : null}
                    </div>
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gray-100 text-gray-600">
                        <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a3 3 0 016 0v4a1 1 0 11-2 0V7a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs font-semibold uppercase">{file.file_type || 'FILE'}</span>
                    </div>
                )}

                {/* dots indicator */}
                {attachments.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/35 px-2 py-1">
                        {attachments.map((_, index) => (
                            <span
                                key={`${postId}-${index}`}
                                className={`h-1.5 w-1.5 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-white/45'}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div
                className="space-y-1 px-3 py-3 text-white"
                style={{ backgroundColor: AppColors.primaryPalette[300] }}
            >
                <p id={`cp-attachment-side-name-${postId}`} className="truncate text-sm font-semibold text-black">
                    {getFileName(file)}
                </p>
                <div className="flex items-center justify-between pt-1">
                    <button
                        className="rounded-full bg-white/95 p-3 shadow transition-transform duration-150 hover:scale-110 hover:bg-white active:scale-95"
                        onClick={(e) => {
                            void handleDownload(e);
                        }}
                        aria-label="Download attachment"
                    >
                        <svg className="h-5 w-5 text-gray-800" fill="none" stroke="currentColor" strokeWidth={2.3} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2h16v-2" />
                        </svg>
                    </button>

                    <button
                        className="rounded-full bg-white/95 p-3 shadow transition-transform duration-150 hover:scale-110 hover:bg-white active:scale-95"
                        onClick={handleOpenPreview}
                        aria-label="Expand preview"
                    >
                        <svg className="h-5 w-5 text-gray-800" fill="none" stroke="currentColor" strokeWidth={2.3} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                        </svg>
                    </button>
                </div>
                <p id={`cp-attachment-side-size-${postId}`} className="text-xs text-white/90">
                    {formatFileSize(fileSize)}
                </p>
                {attachments.length > 1 && (
                    <p id={`cp-attachment-side-more-${postId}`} className="text-[11px] font-medium text-white/95">
                        ไฟล์ {currentIndex + 1}/{attachments.length}
                    </p>
                )}
            </div>
        </div>
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
    const currentUserId = getCurrentUserId();
    const isOwner = currentUserId === post.user.user_sys_id;
    const pid = post.post_id;

    if (!isOwner) return null;

    const handleDelete = async () => {
        if (!confirm('ต้องการลบโพสต์นี้หรือไม่?')) return;
        setIsDeleting(true);
        try {
            const res = await deletePost(currentUserId!, pid, post.post_content_id);
            if (res.success) onDeleted?.(pid);
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
                            onClick={(e) => { e.stopPropagation(); handleDelete(); }}
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
        </div>
    );
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
                                {post.content}
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
                <button
                    id={`cp-comment-btn-${pid}`}
                    aria-label="เปิดความคิดเห็น"
                    onClick={(e) => { e.stopPropagation(); onTap?.(); }}
                    className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-amber-700 transition-colors hover:bg-amber-50"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    ความคิดเห็น
                </button>
            </div>
        </div>
    );
}