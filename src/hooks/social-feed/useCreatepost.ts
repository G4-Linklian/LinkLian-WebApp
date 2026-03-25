// ─────────────────────────────────────────────
// hooks/useCreatePost.ts
// Hook สำหรับ create / edit post
// ─────────────────────────────────────────────

import { useState, useCallback, useEffect, Dispatch, SetStateAction } from 'react';
import { createPost, updatePost } from '@/utils/api/social-feed/post';
import { CreatePostAttachment, PostItem, PostType } from '@/utils/interface/class.types';
import { decodeRegistrationToken, decodeTeacherToken, decodeToken } from '@/utils/authToken';

export type CreatePostMode = 'create' | 'edit';

const parseTokenNumber = (value: unknown): number | null => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const getSocialFeedUserId = (): number | null => {
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
};

interface UseCreatePostOptions {
  mode: CreatePostMode;
  sectionId?: number;
  sectionIds?: number[];
  editingPost?: PostItem | null;
  initialPostType?: PostType;
  allowAnonymous?: boolean;
}

interface UseCreatePostReturn {
  // form state
  title: string;
  setTitle: (v: string) => void;
  content: string;
  setContent: (v: string) => void;
  postType: PostType;
  setPostType: (v: PostType) => void;
  attachments: CreatePostAttachment[];
  setAttachments: Dispatch<SetStateAction<CreatePostAttachment[]>>;
  addAttachment: (a: CreatePostAttachment) => void;
  removeAttachment: (index: number) => void;
  // assignment
  dueDate: Date | null;
  setDueDate: (d: Date | null) => void;
  maxScore: number;
  setMaxScore: (n: number) => void;
  isGroup: boolean;
  setIsGroup: (v: boolean) => void;
  isAnonymous: boolean;
  setIsAnonymous: (v: boolean) => void;
  // submit
  isLoading: boolean;
  error: string | null;
  hasContent: boolean;
  submit: () => Promise<{ success: boolean; data?: any }>;
  reset: () => void;
}

export const useCreatePost = ({
  mode,
  sectionId,
  sectionIds,
  editingPost,
  initialPostType,
  allowAnonymous = true,
}: UseCreatePostOptions): UseCreatePostReturn => {
  const [title, setTitle] = useState(editingPost?.title ?? '');
  const [content, setContent] = useState(editingPost?.content ?? '');
  const [postType, setPostType] = useState<PostType>(
    editingPost?.post_type ?? initialPostType ?? 'announcement',
  );
  const [attachments, setAttachments] = useState<CreatePostAttachment[]>(
    editingPost?.attachments?.map((a) => ({
      file_url: a.file_url,
      file_type: a.file_type,
      original_name: a.original_name ?? undefined,
    })) ?? [],
  );
  const [dueDate, setDueDate] = useState<Date | null>(
    editingPost?.due_date ? new Date(editingPost.due_date) : null,
  );
  const [maxScore, setMaxScore] = useState(editingPost?.max_score ?? 100);
  const [isGroup, setIsGroup] = useState(editingPost?.is_group ?? false);
  const [isAnonymous, setIsAnonymous] = useState(editingPost?.is_anonymous ?? false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editingPost) return;
    setTitle(editingPost.title ?? '');
    setContent(editingPost.content ?? '');
    setPostType(editingPost.post_type ?? 'announcement');
    setAttachments(
      editingPost.attachments?.map((a) => ({
        file_url: a.file_url,
        file_type: a.file_type,
        original_name: a.original_name ?? undefined,
      })) ?? [],
    );
    setDueDate(editingPost.due_date ? new Date(editingPost.due_date) : null);
    setMaxScore(editingPost.max_score ?? 100);
    setIsGroup(editingPost.is_group ?? false);
    setIsAnonymous(editingPost.is_anonymous ?? false);
  }, [editingPost]);

  useEffect(() => {
    if (!allowAnonymous) setIsAnonymous(false);
  }, [allowAnonymous]);

  useEffect(() => {
    if (mode === 'edit') return;
    if (!initialPostType) return;
    setPostType(initialPostType);
  }, [mode, initialPostType]);

  const hasContent =
    title.trim().length > 0 ||
    content.trim().length > 0 ||
    attachments.length > 0;

  const addAttachment = (a: CreatePostAttachment) => {
    setAttachments((prev) => [...prev, a]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = (): string | null => {
    if (!title.trim()) return 'กรุณากรอกชื่อโพสต์';
    if (!content.trim()) return 'กรุณากรอกเนื้อหาโพสต์';
    if (attachments.some((attachment) => attachment.is_uploading)) return 'กรุณารอให้อัปโหลดไฟล์เสร็จก่อน';
    if (attachments.some((attachment) => attachment.upload_error)) return 'กรุณาแก้ไขไฟล์แนบที่อัปโหลดไม่สำเร็จ';
    if (postType === 'assignment' && !dueDate) return 'กรุณาเลือกวันกำหนดส่ง';
    return null;
  };

  const submit = useCallback(async (): Promise<{ success: boolean; data?: any }> => {
    const userId = getSocialFeedUserId();
    if (!userId) return { success: false };

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return { success: false };
    }

    setIsLoading(true);
    setError(null);

    try {
      const persistedAttachments = attachments.map((attachment) => ({
        file_url: attachment.file_url,
        file_type: attachment.file_type,
        original_name: attachment.original_name,
      }));

      if (mode === 'edit' && editingPost) {
        const res = await updatePost(
          userId,
          editingPost.post_id,
          {
            title,
            content,
            attachments: persistedAttachments,
            ...(postType === 'assignment' && {
              due_date: dueDate?.toISOString(),
              max_score: maxScore,
              is_group: isGroup,
            }),
          },
          editingPost.post_content_id,
        );
        return { success: res.success, data: res.data };
      } else {
        if (!sectionId && (!sectionIds || sectionIds.length === 0)) {
          setError('กรุณาเลือกห้องเรียนอย่างน้อย 1 ห้อง');
          return { success: false };
        }
        const res = await createPost(userId, {
          ...(sectionIds && sectionIds.length > 0
            ? { section_ids: sectionIds }
            : { section_id: sectionId }),
          title,
          content,
          post_type: postType,
          is_anonymous: allowAnonymous ? isAnonymous : false,
          attachments: persistedAttachments,
          ...(postType === 'assignment' && {
            due_date: dueDate?.toISOString(),
            max_score: maxScore,
            is_group: isGroup,
          }),
        });
        return { success: res.success, data: res.data };
      }
    } catch (err) {
      console.error('[useCreatePost] submit error:', err);
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, [mode, sectionId, sectionIds, editingPost, title, content, postType, isAnonymous, attachments, dueDate, maxScore, isGroup, allowAnonymous]);

  const reset = () => {
    setTitle('');
    setContent('');
    setPostType(initialPostType ?? 'announcement');
    setAttachments([]);
    setDueDate(null);
    setMaxScore(100);
    setIsGroup(false);
    setIsAnonymous(false);
    setError(null);
  };

  return {
    title, setTitle,
    content, setContent,
    postType, setPostType,
    attachments, setAttachments,
    addAttachment, removeAttachment,
    dueDate, setDueDate,
    maxScore, setMaxScore,
    isGroup, setIsGroup,
    isAnonymous, setIsAnonymous,
    isLoading,
    error,
    hasContent,
    submit,
    reset,
  };
};
