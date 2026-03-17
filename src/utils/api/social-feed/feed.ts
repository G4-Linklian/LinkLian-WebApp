// ─────────────────────────────────────────────
// utils/api/feed.ts
// API calls สำหรับ class feed (teacher)
// ─────────────────────────────────────────────

import { fetchDataApi } from '@/utils/callAPI';
import {
  ClassFeedResponse,
  GetClassFeedParams,
} from '@/utils/interface/class.types';

/**
 * ดึง class feed สำหรับ Teacher / Instructor
 */
export const getTeacherClassFeed = async (
  params: GetClassFeedParams,
): Promise<ClassFeedResponse> => {
  const { user_id, semester_id, limit = 10, offset = 0 } = params;

  const data = await fetchDataApi('GET', 'social-feed/feed/teacher', {
    user_id,
    semester_id,
    limit,
    offset,
  });

  return data;
};