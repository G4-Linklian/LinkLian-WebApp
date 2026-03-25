import { fetchDataApi } from "@/utils/callAPI"
import { GetClassFeedParams } from "@/utils/interface/class.types"

// ========== Get Endpoints ==========

// GET /social-feed/feed/teacher - ดึง class feed สำหรับ Teacher / Instructor
export const getTeacherClassFeed = async (params: GetClassFeedParams) => {
    const { user_id, semester_id, limit = 10, offset = 0 } = params;

    const data = await fetchDataApi(`GET`, "social-feed/feed/teacher", {
        user_id,
        semester_id,
        limit,
        offset,
    });

    return data;
};
