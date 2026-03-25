import { fetchDataApi } from "@/utils/callAPI"
import {
    GetPostsParams,
    CreatePostParams,
    UpdatePostParams,
    SearchPostParams,
} from "@/utils/interface/class.types"

// ========== Get Endpoints ==========

// GET /social-feed/post - ดึง posts ทั้งหมดใน section
export const getPostsInClass = async (params: GetPostsParams) => {
    const { section_id, type, limit = 10, offset = 0 } = params;

    const data = await fetchDataApi(`GET`, "social-feed/post", {
        section_id,
        ...(type && { type }),
        limit,
        offset,
    });

    return data;
};

// GET /social-feed/post/:id - ดึง post เดี่ยวตาม post_id
export const getPostById = async (postId: number) => {
    const data = await fetchDataApi(`GET`, `social-feed/post/${postId}`, {});
    return data;
};

// GET /social-feed/post/search - ค้นหา post ตาม keyword
export const searchPosts = async (params: SearchPostParams) => {
    const { section_id, keyword, limit = 50, offset = 0 } = params;

    const data = await fetchDataApi(`GET`, "social-feed/post/search", {
        keyword,
        ...(section_id && { section_id }),
        limit,
        offset,
    });

    return data;
};

// ========== Create Endpoints ==========

// POST /social-feed/post - สร้าง post ใหม่
export const createPost = async (userId: number, params: CreatePostParams) => {
    const data = await fetchDataApi(`POST`, "social-feed/post", { ...params }, { "x-user-id": String(userId) });
    return data;
};

// ========== Update Endpoints ==========

// PUT /social-feed/post - แก้ไข post (โดย post_content_id)
export const updatePost = async (
    userId: number,
    postId: number,
    params: UpdatePostParams,
    postContentId?: number,
) => {
    const endpoint = postContentId ? "social-feed/post" : `social-feed/post/${postId}`;
    const payload = postContentId ? { ...params, post_content_id: postContentId } : { ...params };

    const data = await fetchDataApi(`PUT`, endpoint, payload, { "x-user-id": String(userId) });
    return data;
};

// ========== Delete Endpoints ==========

// DELETE /social-feed/post - ลบ post
export const deletePost = async (
    userId: number,
    postId: number,
    postContentId?: number,
) => {
    const endpoint = postContentId ? "social-feed/post" : `social-feed/post/${postId}`;
    const payload = postContentId ? { post_id: postId, post_content_id: postContentId } : {};

    const data = await fetchDataApi(`DELETE`, endpoint, payload, { "x-user-id": String(userId) });
    return data;
};
