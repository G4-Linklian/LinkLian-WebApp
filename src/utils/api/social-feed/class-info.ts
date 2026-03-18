// ─────────────────────────────────────────────
// utils/api/classInfo.ts
// API calls สำหรับ class info (educators, schedules, members)
// ─────────────────────────────────────────────

import { fetchDataApi } from '@/utils/callAPI';
import { ClassInfoResponse } from '@/utils/interface/class.types';

/**
 * ดึงข้อมูล class info ทั้งหมด
 * (room_location, schedules, members, educators)
 */
export const getClassInfo = async (
  sectionId: number,
): Promise<ClassInfoResponse> => {
  const data = await fetchDataApi(
    'GET',
    `social-feed/class-info/${sectionId}`,
    {},
  );

  return data;
};

/**
 * ดึงเฉพาะ educators ของ section
 * (คืนเฉพาะ main_teacher)
 */
export const getSectionEducators = async (
  sectionId: number,
): Promise<{
  success?: boolean;
  data: {
    educator_id: number;
    position: string;
    user_sys_id: number;
    display_name: string;
    email: string;
    profile_pic: string | null;
  }[];
}> => {
  const data = await fetchDataApi(
    'GET',
    `social-feed/class-info/${sectionId}/educators`,
    {},
  );

  return data;
};