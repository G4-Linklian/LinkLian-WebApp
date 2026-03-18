// ─────────────────────────────────────────────
// hooks/useComments.ts
// Hook สำหรับ comments แบบ nested tree (closure table)
// ─────────────────────────────────────────────

import { useState, useCallback } from 'react';
import {
  getPostComments,
  createPostComment,
  deletePostComment,
} from '@/utils/api/social-feed/post-comment';
import { CommentNode } from '@/utils/interface/class.types';
import { getSocialFeedUserId } from '@/hooks/useAuthIdentity';

interface UseCommentsReturn {
  comments: CommentNode[];
  total: number;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  isSubmitting: boolean;
  error: string | null;
  replyingTo: CommentNode | null;
  setReplyingTo: (comment: CommentNode | null) => void;
  loadComments: (opts?: { reset?: boolean }) => Promise<void>;
  submitComment: (text: string, isAnonymous?: boolean) => Promise<boolean>;
  removeComment: (commentId: number) => Promise<boolean>;
}

const LIMIT = 10;

export const useComments = (postId: number): UseCommentsReturn => {
  const [comments, setComments] = useState<CommentNode[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [replyingTo, setReplyingTo] = useState<CommentNode | null>(null);

  const loadComments = useCallback(
    async (opts: { reset?: boolean } = {}) => {
      if (!postId) return;

      const currentOffset = opts.reset ? 0 : offset;
      const isFirstLoad = opts.reset || currentOffset === 0;

      if (isFirstLoad) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      try {
        const res = await getPostComments({
          post_id: postId,
          limit: LIMIT,
          offset: currentOffset,
        });

        const newComments = res.data ?? [];
        setComments((prev) =>
          isFirstLoad ? newComments : [...prev, ...newComments],
        );
        setTotal(res.total ?? 0);
        setHasMore(res.hasMore ?? false);
        setOffset(currentOffset + newComments.length);
      } catch (err) {
        console.error('[useComments] load error:', err);
        setError('ไม่สามารถโหลดความคิดเห็นได้');
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [postId, offset],
  );

  /**
   * ส่ง comment ใหม่ / reply
   * returns true ถ้าสำเร็จ
   */
const submitComment = useCallback(async (
  text: string,
  isAnonymous = false,
): Promise<boolean> => {
  const userId = getSocialFeedUserId();
  if (!userId || !text.trim()) return false;

  setIsSubmitting(true);
  try {
    const res = await createPostComment(userId, {
      post_id: postId,
      comment_text: text.trim(),
      is_anonymous: isAnonymous,
      parent_id: replyingTo?.comment_id,
    });

    if (res.success) {
      setReplyingTo(null);
      await loadComments({ reset: true });
      return true;
    }
    return false;
  } catch (err) {
    console.error('[useComments] submit error:', err);
    return false;
  } finally {
    setIsSubmitting(false);
  }
}, [postId, replyingTo, loadComments]);

  /**
   * ลบ comment (soft delete)
   * returns true ถ้าสำเร็จ
   */
  const removeComment = async (commentId: number): Promise<boolean> => {
    const userId = getSocialFeedUserId();
    if (!userId) return false;

    try {
      const res = await deletePostComment(userId, { comment_id: commentId });
      if (res.success) {
        // ลบออก optimistically จาก tree
        setComments((prev) => removeFromTree(prev, commentId));
        return true;
      }
      return false;
    } catch (err) {
      console.error('[useComments] delete error:', err);
      return false;
    }
  };

  return {
    comments,
    total,
    hasMore,
    isLoading,
    isLoadingMore,
    isSubmitting,
    error,
    replyingTo,
    setReplyingTo,
    loadComments,
    submitComment,
    removeComment,
  };
};

// ==================== HELPERS ====================

/**
 * ลบ comment node ออกจาก nested tree แบบ recursive
 */
function removeFromTree(
  nodes: CommentNode[],
  commentId: number,
): CommentNode[] {
  return nodes
    .filter((n) => n.comment_id !== commentId)
    .map((n) => ({
      ...n,
      children: removeFromTree(n.children, commentId),
    }));
}
