import { fetchDataApi } from "@/utils/callAPI"
import {
    GetCommentsParams,
    CreateCommentParams,
    UpdateCommentParams,
    DeleteCommentParams,
} from "@/utils/interface/class.types"

// ========== Get Endpoints ==========

// GET /post-comment - ดึง comments ของ post แบบ nested tree
export const getPostComments = async (input: GetCommentsParams) => {
    const { post_id, limit = 10, offset = 0 } = input;

    const data = await fetchDataApi(`GET`, "post-comment", {
        post_id,
        limit,
        offset,
    });

    return data;
};

// ========== Create Endpoints ==========

// POST /post-comment - สร้าง comment ใหม่ (รองรับ reply โดยส่ง parent_id)
export const createPostComment = async (input: CreateCommentParams) => {
    const { user_id, post_id, comment_text, is_anonymous, parent_id } = input;

    const data = await fetchDataApi(
        `POST`,
        "post-comment",
        { post_id, comment_text, is_anonymous, parent_id },
        { "x-user-id": String(user_id) },
    );

    return data;
};

// ========== Update Endpoints ==========

// PUT /post-comment - แก้ไข comment
export const updatePostComment = async (input: UpdateCommentParams) => {
    const { user_id, comment_id, comment_text, flag_valid } = input;

    const data = await fetchDataApi(
        `PUT`,
        "post-comment",
        { comment_id, comment_text, flag_valid },
        { "x-user-id": String(user_id) },
    );

    return data;
};

// ========== Delete Endpoints ==========

// DELETE /post-comment - ลบ comment (soft delete ทั้ง comment และ descendants)
export const deletePostComment = async (input: DeleteCommentParams) => {
    const { user_id, comment_id } = input;

    const data = await fetchDataApi(
        `DELETE`,
        "post-comment",
        { comment_id },
        { "x-user-id": String(user_id) },
    );

    return data;
};
