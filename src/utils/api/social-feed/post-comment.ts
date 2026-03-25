import { fetchDataApi } from "@/utils/callAPI"
import {
    GetCommentsParams,
    CreateCommentParams,
    UpdateCommentParams,
    DeleteCommentParams,
} from "@/utils/interface/class.types"

// ========== Get Endpoints ==========

// GET /post-comment - ดึง comments ของ post แบบ nested tree
export const getPostComments = async (params: GetCommentsParams) => {
    const { post_id, limit = 10, offset = 0 } = params;

    const data = await fetchDataApi(`GET`, "post-comment", {
        post_id,
        limit,
        offset,
    });

    return data;
};

// ========== Create Endpoints ==========

// POST /post-comment - สร้าง comment ใหม่ (รองรับ reply โดยส่ง parent_id)
export const createPostComment = async (userId: number, params: CreateCommentParams) => {
    const data = await fetchDataApi(`POST`, "post-comment", { ...params }, { "x-user-id": String(userId) });
    return data;
};

// ========== Update Endpoints ==========

// PUT /post-comment - แก้ไข comment
export const updatePostComment = async (userId: number, params: UpdateCommentParams) => {
    const data = await fetchDataApi(`PUT`, "post-comment", { ...params }, { "x-user-id": String(userId) });
    return data;
};

// ========== Delete Endpoints ==========

// DELETE /post-comment - ลบ comment (soft delete ทั้ง comment และ descendants)
export const deletePostComment = async (userId: number, params: DeleteCommentParams) => {
    const data = await fetchDataApi(`DELETE`, "post-comment", { ...params }, { "x-user-id": String(userId) });
    return data;
};
