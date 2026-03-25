import { fetchDataApi } from "@/utils/callAPI"
import { ClassInfoResponse } from "@/utils/interface/class.types"

// ========== Get Endpoints ==========

// GET /social-feed/class-info/:sectionId - ดึงข้อมูล class info ทั้งหมด (room_location, schedules, members, educators)
export const getClassInfo = async (sectionId: number) => {
    const data = await fetchDataApi(`GET`, `social-feed/class-info/${sectionId}`, {});
    return data;
};

// GET /social-feed/class-info/:sectionId/educators - ดึงเฉพาะ educators ของ section
export const getSectionEducators = async (sectionId: number) => {
    const data = await fetchDataApi(`GET`, `social-feed/class-info/${sectionId}/educators`, {});
    return data;
};
