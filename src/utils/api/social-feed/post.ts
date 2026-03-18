// ─────────────────────────────────────────────
// utils/api/post.ts
// API calls สำหรับ post (CRUD + search)
// ─────────────────────────────────────────────

import { fetchDataApi } from '@/utils/callAPI';
import {
  PostsResponse,
  GetPostsParams,
  CreatePostParams,
  CreatePostResponse,
  UpdatePostParams,
  PostItem,
  SearchPostParams,
} from '@/utils/interface/class.types';

/**
 * ดึง posts ทั้งหมดใน section
 */
export const getPostsInClass = async (
  params: GetPostsParams,
): Promise<PostsResponse> => {
  const { section_id, type, limit = 10, offset = 0 } = params;

  const data = await fetchDataApi('GET', 'social-feed/post', {
    section_id,
    ...(type && { type }),
    limit,
    offset,
  });

  return data;
};

/**
 * ดึง post เดี่ยวตาม post_id
 */
export const getPostById = async (
  postId: number,
): Promise<{ success: boolean; message: string; data: PostItem }> => {
  const data = await fetchDataApi('GET', `social-feed/post/${postId}`, {});
  return data;
};

/**
 * สร้าง post ใหม่
 */
export const createPost = async (
  userId: number,
  params: CreatePostParams,
): Promise<CreatePostResponse> => {
  const data = await fetchDataApi(
    'POST',
    'social-feed/post',
    { ...params },
    { 'x-user-id': String(userId) },
  );

  return data;
};

/**
 * แก้ไข post (โดย post_content_id)
 */
export const updatePost = async (
  userId: number,
  postId: number,
  params: UpdatePostParams,
  postContentId?: number,
): Promise<{ success: boolean; message: string; data: any }> => {
  const endpoint = postContentId
    ? 'social-feed/post'
    : `social-feed/post/${postId}`;
  const payload = postContentId
    ? { ...params, post_content_id: postContentId }
    : { ...params };
  const data = await fetchDataApi('PUT', endpoint, payload, {
    'x-user-id': String(userId),
  });

  return data;
};

/**
 * ลบ post
 */
export const deletePost = async (
  userId: number,
  postId: number,
  postContentId?: number,
): Promise<{ success: boolean; message: string }> => {
  const endpoint = postContentId ? 'social-feed/post' : `social-feed/post/${postId}`;
  const payload = postContentId
    ? {
        post_id: postId,
        post_content_id: postContentId,
      }
    : {};
  const data = await fetchDataApi('DELETE', endpoint, payload, {
    'x-user-id': String(userId),
  });

  return data;
};

/**
 * ค้นหา post ตาม keyword
 */
export const searchPosts = async (
  params: SearchPostParams,
): Promise<{ success: boolean; message: string; data: PostItem[] }> => {
  const { section_id, keyword, limit = 50, offset = 0 } = params;

  const data = await fetchDataApi('GET', 'social-feed/post/search', {
    keyword,
    ...(section_id && { section_id }),
    limit,
    offset,
  });

  return data;
};
