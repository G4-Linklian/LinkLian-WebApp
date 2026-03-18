// ─────────────────────────────────────────────
// utils/api/postComment.ts
// API calls สำหรับ comment (closure table pattern)
// ─────────────────────────────────────────────

import { fetchDataApi } from '@/utils/callAPI';
import {
  GetCommentsParams,
  GetCommentsResponse,
  CreateCommentParams,
  UpdateCommentParams,
  DeleteCommentParams,
} from '@/utils/interface/class.types';

/**
 * ดึง comments ของ post แบบ nested tree
 */
export const getPostComments = async (
  params: GetCommentsParams,
): Promise<GetCommentsResponse> => {
  const { post_id, limit = 10, offset = 0 } = params;

  const data = await fetchDataApi('GET', 'post-comment', {
    post_id,
    limit,
    offset,
  });

  return data;
};

/**
 * สร้าง comment ใหม่ (รองรับ reply โดยส่ง parent_id)
 */
export const createPostComment = async (
  userId: number,
  params: CreateCommentParams,
): Promise<{ success: boolean; message: string; data: { comment_id: number } }> => {
  const data = await fetchDataApi(
    'POST',
    'post-comment',
    { ...params },
    { 'x-user-id': String(userId) },
  );

  return data;
};

/**
 * แก้ไข comment
 */
export const updatePostComment = async (
  userId: number,
  params: UpdateCommentParams,
): Promise<{ success: boolean; message: string; data: any }> => {
  const data = await fetchDataApi(
    'PUT',
    'post-comment',
    { ...params },
    { 'x-user-id': String(userId) },
  );

  return data;
};

/**
 * ลบ comment (soft delete ทั้ง comment และ descendants)
 */
export const deletePostComment = async (
  userId: number,
  params: DeleteCommentParams,
): Promise<{
  success: boolean;
  message: string;
  data: { deleted_count: number; deleted_comment_ids: number[] };
}> => {
  const data = await fetchDataApi(
    'DELETE',
    'post-comment',
    { ...params },
    { 'x-user-id': String(userId) },
  );

  return data;
};
