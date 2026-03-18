// ─────────────────────────────────────────────
// comps/linkLianApp/class/CreatePost.tsx
// Component สร้าง / แก้ไข post
// id convention: crp-{element}
// ─────────────────────────────────────────────

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useCreatePost } from '@/hooks/social-feed/useCreatepost';
import { uploadFileStorage } from '@/utils/api/fileStorage';
import { getPostById } from '@/utils/api/social-feed/post';
import { PostItem, PostType } from '@/utils/interface/class.types';
import { POST_TYPE_LABEL } from '@/utils/function/classHelper';
import { AppColors } from '@/constants/colors';

const POST_TYPES: PostType[] = ['announcement', 'assignment'];

const resolveUploadedFileType = (file: File, uploadedFileUrl?: string): string => {
  const mimeType = (file.type || '').toLowerCase();
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'jpeg';
  if (mimeType.includes('png')) return 'png';
  if (mimeType.includes('gif')) return 'gif';
  if (mimeType.includes('webp')) return 'webp';
  if (mimeType.includes('word')) return 'doc';
  if (mimeType.includes('excel') || mimeType.includes('sheet')) return 'xls';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'ppt';

  const source = `${file.name} ${uploadedFileUrl ?? ''}`.toLowerCase();
  if (source.includes('.pdf')) return 'pdf';
  if (source.includes('.jpeg') || source.includes('.jpg')) return 'jpeg';
  if (source.includes('.png')) return 'png';
  if (source.includes('.gif')) return 'gif';
  if (source.includes('.webp')) return 'webp';
  if (source.includes('.docx')) return 'docx';
  if (source.includes('.doc')) return 'doc';
  if (source.includes('.xlsx')) return 'xlsx';
  if (source.includes('.xls')) return 'xls';
  if (source.includes('.pptx')) return 'pptx';
  if (source.includes('.ppt')) return 'ppt';

  return mimeType || 'file';
};

// ── Toast Notification ────────────────────────
function Toast({
  type,
  message,
  onDismiss,
}: {
  type: 'success' | 'error';
  message: string;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const id = window.setTimeout(onDismiss, 3500);
    return () => window.clearTimeout(id);
  }, [onDismiss]);

  const isSuccess = type === 'success';
  return (
    <div
      id="crp-toast"
      className="animate-in slide-in-from-top-2 fade-in absolute left-1/2 top-4 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl px-5 py-3 shadow-lg duration-300"
      style={{
        backgroundColor: isSuccess ? AppColors.successPalette[100] : AppColors.dangerPalette[100],
        color: isSuccess ? AppColors.successPalette[700] : AppColors.dangerPalette[500],
        border: `1px solid ${isSuccess ? AppColors.successPalette[300] : AppColors.dangerPalette[300]}`,
        minWidth: '220px',
      }}
    >
      {isSuccess ? (
        <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      )}
      <span className="text-sm font-semibold">{message}</span>
      <button onClick={onDismiss} className="ml-1 opacity-60 hover:opacity-100">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ── PostTypeSelector ──────────────────────────
function PostTypeSelector({ value, onChange }: { value: PostType; onChange: (v: PostType) => void }) {
  return (
    <div id="crp-type-selector" className="flex gap-2">
      {POST_TYPES.map((type) => {
        const isSelected = value === type;
        const selectedStyle =
          type === 'announcement'
            ? {
                backgroundColor: AppColors.warningPalette[100],
                color: AppColors.warningPalette[700],
                border: `1px solid ${AppColors.warningPalette[300]}`,
              }
            : {
                backgroundColor: AppColors.primaryPalette[100],
                color: AppColors.primaryPalette[700],
                border: `1px solid ${AppColors.primaryPalette[300]}`,
              };
        return (
          <button
            key={type}
            id={`crp-type-btn-${type}`}
            aria-pressed={isSelected}
            onClick={() => onChange(type)}
            className="flex-1 rounded-full py-2 text-xs font-semibold transition-all duration-200"
            style={
              isSelected
                ? selectedStyle
                : { backgroundColor: AppColors.gray, color: '#555555' }
            }
          >
            {POST_TYPE_LABEL[type]}
          </button>
        );
      })}
    </div>
  );
}

interface CreatePostProps {
  sectionId:          number;
  sectionIds?:        number[];
  subjectName?:       string;
  editPostId?:        number;
  editPostContentId?: number;
  initialPostType?:   PostType;
  allowAnonymous?:    boolean;
  onClose?:           () => void;
  onSubmitted?:       () => void;
}

const CreatePost = ({
  sectionId,
  sectionIds,
  subjectName,
  editPostId,
  editPostContentId: _editPostContentId,
  initialPostType,
  allowAnonymous = true,
  onClose,
  onSubmitted,
}: CreatePostProps) => {
  const router    = useRouter();
  const isEditing = !!editPostId;
  const fileInputRef     = useRef<HTMLInputElement>(null);
  const localBlobUrlsRef = useRef<string[]>([]);

  const [editingPost,     setEditingPost]     = useState<PostItem | null>(null);
  const [loadingEditPost, setLoadingEditPost] = useState(false);
  const [editPostError,   setEditPostError]   = useState<string | null>(null);
  const [uploadError,     setUploadError]     = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!isEditing || !editPostId || Number.isNaN(editPostId)) return;
    let isMounted = true;
    setLoadingEditPost(true);
    setEditPostError(null);
    getPostById(editPostId)
      .then((res) => {
        if (!isMounted) return;
        if (!res.success || !res.data) { setEditPostError('ไม่สามารถโหลดข้อมูลโพสต์สำหรับแก้ไขได้'); return; }
        setEditingPost(res.data);
      })
      .catch(() => { if (isMounted) setEditPostError('ไม่สามารถโหลดข้อมูลโพสต์สำหรับแก้ไขได้'); })
      .finally(() => { if (isMounted) setLoadingEditPost(false); });
    return () => { isMounted = false; };
  }, [isEditing, editPostId]);

  useEffect(() => {
    return () => {
      localBlobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      localBlobUrlsRef.current = [];
    };
  }, []);

  const {
    postType, setPostType,
    title, setTitle,
    content, setContent,
    dueDate, setDueDate,
    maxScore, setMaxScore,
    isGroup, setIsGroup,
    isAnonymous, setIsAnonymous,
    attachments, setAttachments, addAttachment, removeAttachment,
    isLoading, error, hasContent,
    submit, reset,
  } = useCreatePost({
    mode: isEditing ? 'edit' : 'create',
    sectionId,
    sectionIds,
    editingPost,
    initialPostType,
    allowAnonymous,
  });

  const dueDateValue = useMemo(() => {
    if (!dueDate) return '';
    const local = new Date(dueDate.getTime() - dueDate.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 16);
  }, [dueDate]);

  const closeForm = () => {
    if (onClose) { onClose(); return; }
    router.back();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files ?? []).forEach(async (file) => {
      const localUrl = URL.createObjectURL(file);
      localBlobUrlsRef.current.push(localUrl);
      const tempAttachment = {
        file_url: localUrl,
        file_type: file.type,
        original_name: file.name,
        local_file: file,
        preview_url: localUrl,
        is_uploading: true,
      };
      setUploadError(null);
      addAttachment(tempAttachment);
      try {
        const uploadRes = await uploadFileStorage(file, 'social-feed', 'fileattachment');
        const uploadedFileUrl = uploadRes?.files?.[0]?.fileUrl;
        if (!uploadedFileUrl) throw new Error('Failed to upload file');
        setAttachments((prev) =>
          prev.map((attachment) =>
            attachment.preview_url === localUrl
              ? { file_url: uploadedFileUrl, file_type: resolveUploadedFileType(file, uploadedFileUrl), original_name: file.name, preview_url: localUrl }
              : attachment,
          ),
        );
      } catch (error) {
        console.error('[CreatePost] upload attachment failed', error);
        setUploadError(`อัปโหลดไฟล์ "${file.name}" ไม่สำเร็จ`);
        setAttachments((prev) =>
          prev.map((attachment) =>
            attachment.preview_url === localUrl
              ? { ...attachment, is_uploading: false, upload_error: 'upload_failed' }
              : attachment,
          ),
        );
      }
    });
    e.target.value = '';
  };

  const handleAddLink = () => {
    const url = prompt('วาง URL ที่ต้องการแนบ:');
    if (url?.trim()) addAttachment({ file_url: url.trim(), file_type: 'link', original_name: url.trim() });
  };

  const handleSubmit = async () => {
    const result = await submit();
    if (result.success) {
      setToast({ type: 'success', message: isEditing ? 'บันทึกโพสต์สำเร็จ' : 'โพสต์สำเร็จแล้ว!' });
      setTimeout(() => {
        onSubmitted?.();
        closeForm();
      }, 1200);
    } else {
      setToast({ type: 'error', message: error ?? 'เกิดข้อผิดพลาด กรุณาลองใหม่' });
    }
  };

  return (
    <div id="crp-page" className="relative flex h-full w-full flex-col bg-white text-black">

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onDismiss={() => setToast(null)}
        />
      )}

      {/* Header */}
<div id="crp-header" className="flex shrink-0 items-center justify-between border-b border-gray-100 px-8 py-8">
        <div id="crp-type-section" className="max-w-[320px] flex-1">
          <PostTypeSelector value={postType} onChange={setPostType} />
        </div>
        <button
          id="crp-close-btn"
          aria-label="ปิด"
          onClick={() => {
            if (hasContent && !confirm('ต้องการออกโดยไม่บันทึกหรือไม่?')) return;
            reset();
            closeForm();
          }}
          className="ml-3 flex h-8 w-8 items-center justify-center rounded-full transition-colors"
          style={{ color: AppColors.dangerPalette[500], backgroundColor: AppColors.dangerPalette[100] }}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Context */}
      {subjectName && (
<div id="crp-context-bar" className="flex shrink-0 items-center gap-2 px-8 py-8 text-xs text-gray-500">
          <svg className="h-4 w-4 text-amber-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
          </svg>
          <span id="crp-context-label">{subjectName}</span>
        </div>
      )}

      {/* Errors */}
      {editPostError && (
        <div id="crp-edit-error" className="mx-4 mt-2 shrink-0 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{editPostError}</div>
      )}
      {uploadError && (
        <div id="crp-upload-error" className="mx-4 mt-2 shrink-0 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{uploadError}</div>
      )}

      {/* Form — scrollable, padded bottom for fixed bar */}
      <div id="crp-form" className="flex-1 overflow-y-auto px-8 pb-20 pt-3">
        {isEditing && loadingEditPost && (
          <div id="crp-edit-loading" className="mb-4 flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-500">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
            กำลังโหลดโพสต์เดิม...
          </div>
        )}

        {/* Title */}
        {(postType === 'announcement' || postType === 'assignment') && (
          <div id="crp-title-section" className="mb-3">
            <input
              id="crp-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="หัวข้อโพสต์"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-2xl font-semibold text-gray-700 outline-none placeholder:text-gray-300 focus:border-amber-300"
            />
          </div>
        )}

        {/* Content */}
        <div id="crp-content-section" className="mb-3">
          <textarea
            id="crp-content-input"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              postType === 'question'   ? 'เขียนคำถามที่ต้องการถาม...' :
              postType === 'assignment' ? 'อธิบายรายละเอียดของงาน...' :
              'รายละเอียดของโพสต์...'
            }
            rows={6}
            className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 outline-none placeholder:text-gray-400 focus:border-amber-300"
          />
        </div>

        {/* Assignment fields */}
        {postType === 'assignment' && (
          <div
            id="crp-assignment-fields"
            className="mb-3 rounded-2xl p-4"
            style={{ backgroundColor: AppColors.primaryPalette[100], border: `1px solid ${AppColors.primaryPalette[200]}` }}
          >
            <p
              id="crp-assignment-fields-label"
              className="mb-3 text-xs font-semibold uppercase tracking-wide"
              style={{ color: AppColors.primaryPalette[600] }}
            >
              รายละเอียดงาน
            </p>

            <div id="crp-due-date-section" className="mb-3">
              <label
                id="crp-due-date-label"
                htmlFor="crp-due-date-input"
                className="mb-1 block text-xs font-medium"
                style={{ color: AppColors.primaryPalette[700] }}
              >
                วันส่งงาน
              </label>
              <input
                id="crp-due-date-input"
                type="datetime-local"
                value={dueDateValue}
                onChange={(e) => setDueDate(e.target.value ? new Date(e.target.value) : null)}
                className="w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none"
                style={{ borderColor: AppColors.primaryPalette[300] }}
              />
            </div>

            <div id="crp-score-section" className="mb-3">
              <label
                id="crp-score-label"
                htmlFor="crp-score-input"
                className="mb-1 block text-xs font-medium"
                style={{ color: AppColors.primaryPalette[700] }}
              >
                คะแนนเต็ม
              </label>
              <input
                id="crp-score-input"
                type="number"
                min={0}
                step={0.5}
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value ? Number(e.target.value) : 0)}
                placeholder="เช่น 100"
                className="w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none"
                style={{ borderColor: AppColors.primaryPalette[300] }}
              />
            </div>

            <div id="crp-group-section" className="flex items-center justify-between">
              <label
                id="crp-group-label"
                className="text-xs font-medium"
                style={{ color: AppColors.primaryPalette[700] }}
              >
                งานกลุ่ม
              </label>
              <button
                id="crp-group-toggle"
                role="switch"
                aria-checked={isGroup}
                onClick={() => setIsGroup(!isGroup)}
                className="relative h-6 w-11 rounded-full transition-colors duration-200"
                style={{ backgroundColor: isGroup ? AppColors.primaryPalette[500] : AppColors.gray }}
              >
                <span
                  id="crp-group-toggle-thumb"
                  className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${isGroup ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Anonymous */}
        {allowAnonymous && (
          <div id="crp-anon-section" className="mb-3 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5">
            <div>
              <p id="crp-anon-label" className="text-sm font-medium text-gray-700">ไม่ระบุตัวตน</p>
              <p className="text-xs text-gray-400">ชื่อของคุณจะไม่แสดงในโพสต์นี้</p>
            </div>
            <button
              id="crp-anon-toggle"
              role="switch"
              aria-checked={isAnonymous}
              onClick={() => setIsAnonymous(!isAnonymous)}
              className="relative h-6 w-11 rounded-full transition-colors duration-200"
              style={{ backgroundColor: isAnonymous ? AppColors.primaryPalette[500] : AppColors.gray }}
            >
              <span
                id="crp-anon-toggle-thumb"
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${isAnonymous ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>
        )}

        {/* Attachments list */}
        {attachments.length > 0 && (
          <div id="crp-attachments-section" className="mb-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              ไฟล์แนบ ({attachments.length})
            </p>
            <div id="crp-attachments-list" className="flex flex-col gap-2">
              {attachments.map((att, i) => (
                <div
                  key={i}
                  id={`crp-attachment-item-${i}`}
                  className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2"
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: AppColors.primaryPalette[100], color: AppColors.primaryPalette[600] }}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </div>
                  <p id={`crp-attachment-name-${i}`} className="min-w-0 flex-1 truncate text-xs text-gray-700">
                    {att.original_name ?? att.preview_url ?? att.file_url}
                  </p>
                  {att.is_uploading && (
                    <span className="shrink-0 text-[11px] font-medium" style={{ color: AppColors.primaryPalette[600] }}>
                      กำลังอัปโหลด...
                    </span>
                  )}
                  {att.upload_error && (
                    <span className="shrink-0 text-[11px] font-medium text-red-500">อัปโหลดไม่สำเร็จ</span>
                  )}
                  <button
                    id={`crp-attachment-remove-${i}`}
                    aria-label={`ลบไฟล์แนบ ${i + 1}`}
                    onClick={() => removeAttachment(i)}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-500 hover:bg-red-100 hover:text-red-500"
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <input
          id="crp-file-input"
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,application/pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Bottom action bar — fixed, attachment ซ้าย Post ขวา */}
      <div
        id="crp-bottom-bar" className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-gray-100 bg-white px-8 py-8"
      >
        {/* Attachment buttons — ซ้าย */}
        <div
          id="crp-attachment-bar"
          className="flex items-center gap-1 rounded-xl px-2 py-1"
          style={{ backgroundColor: AppColors.primaryPalette[100] }}
        >
          <button
            id="crp-add-image-btn"
            aria-label="แนบรูปภาพ"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/60"
            style={{ color: AppColors.primaryPalette[700] }}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            id="crp-add-file-btn"
            aria-label="แนบไฟล์"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/60"
            style={{ color: AppColors.primaryPalette[700] }}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <button
            id="crp-add-link-btn"
            aria-label="แนบลิงก์"
            onClick={handleAddLink}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/60"
            style={{ color: AppColors.primaryPalette[700] }}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </button>
        </div>

        {/* Submit button — ขวา */}
        <button
          id="crp-submit-btn"
          aria-label={isEditing ? 'บันทึก' : 'โพสต์'}
          onClick={handleSubmit}
          disabled={isLoading || !hasContent || (isEditing && !editingPost) || attachments.some((att) => att.is_uploading)}
          className="rounded-xl px-6 py-2 text-sm font-semibold text-white shadow transition-opacity disabled:opacity-40"
          style={{ backgroundColor: AppColors.primaryPalette[500] }}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              {isEditing ? 'กำลังบันทึก...' : 'กำลังโพสต์...'}
            </span>
          ) : (
            isEditing ? 'บันทึก' : 'โพสต์'
          )}
        </button>
      </div>
    </div>
  );
};

export default CreatePost;