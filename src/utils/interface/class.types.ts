// ─────────────────────────────────────────────
// interface/class.types.ts
// Types สำหรับ feature: class (feed, post, comment, class-info)
// ─────────────────────────────────────────────

// ==================== SCHEDULE ====================

export interface RoomLocation {
  room_location_id: number;
  room_number: string;
  floor: number;
  room_remark: string;
}

export interface Building {
  building_id: number;
  building_name: string;
  building_no: string;
}

export interface ClassSchedule {
  day_of_week: number; // 0=อาทิตย์, 1=จันทร์, ..., 6=เสาร์
  start_time: string;  // "HH:MM:SS"
  end_time: string;    // "HH:MM:SS"
  room: RoomLocation;
  building: Building;
}

// ==================== SEMESTER ====================

export interface SemesterOption {
  semester_id: number;
  semester: string;
  status: "open" | "close";
}

// ==================== CLASS FEED ====================

export interface ClassFeedItem {
  section_id: number;
  section_name: string;
  subject_code: string;
  subject_name_th: string;
  subject_name_en: string;
  learning_area_name: string | null;
  semester: string;
  student_count: number;
  display_class_name: string;
  schedules: ClassSchedule[];

  // Teacher only
  position?: string;
}

export interface ClassFeedResponse {
  success: boolean;
  message: string;
  data: ClassFeedItem[];
}

export interface GetClassFeedParams {
  user_id: number;
  semester_id: number;
  limit?: number;
  offset?: number;
}

// ==================== ATTACHMENT ====================

export interface PostAttachment {
  file_url: string;
  file_type: string;
  original_name: string | null;
}

// ==================== USER (ใน Post) ====================

export interface PostUser {
  user_sys_id: number | null;
  email: string | null;
  profile_pic: string | null;
  display_name: string;
  role_name: string | null;
}

// ==================== POST ====================

export type PostType = 'announcement' | 'assignment' | 'question';

export interface PostItem {
  post_id: number;
  post_content_id: number;
  title: string;
  content: string;
  post_type: PostType;
  is_anonymous: boolean;
  is_user_deleted?: boolean;
  created_at: string; // ISO string
  due_date: string | null;
  max_score: number | null;
  is_group: boolean | null;
  user: PostUser;
  attachments: PostAttachment[];
}

export interface GetPostsParams {
  section_id: number;
  type?: PostType;
  limit?: number;
  offset?: number;
}

export interface PostsResponse {
  success: boolean;
  message: string;
  data: PostItem[];
}

export interface CreatePostAttachment {
  file_url: string;
  file_type: string;
  original_name?: string;
  local_file?: File;
  preview_url?: string;
  is_uploading?: boolean;
  upload_error?: string;
}

export interface CreatePostParams {
  section_id?: number;
  section_ids?: number[];
  title?: string;
  content?: string;
  post_type: PostType;
  is_anonymous?: boolean;
  attachments?: CreatePostAttachment[];
  // Assignment fields
  due_date?: string;
  max_score?: number;
  is_group?: boolean;
}

export interface UpdatePostParams {
  title?: string;
  content?: string;
  attachments?: CreatePostAttachment[];
  // Assignment fields
  due_date?: string;
  max_score?: number;
  is_group?: boolean;
}

export interface CreatePostResponse {
  success: boolean;
  message: string;
  data: {
    post_ids: number[];
    post_content_id: number;
    title: string;
    content: string;
    post_type: PostType;
    is_anonymous: boolean;
    created_at: string;
    section_ids: number[];
    attachments: PostAttachment[];
    assignment?: {
      assignment_ids: number[];
      due_date: string;
      max_score: number | null;
      is_group: boolean;
    };
  };
}

export interface SearchPostParams {
  section_id?: number;
  keyword: string;
  limit?: number;
  offset?: number;
}

// ==================== COMMENT ====================

export interface CommentUser {
  user_sys_id: number;
  display_name: string | null;
  profile_pic: string | null;
  is_anonymous: boolean;
}

export interface CommentNode {
  comment_id: number;
  post_id: number;
  user_sys_id: number;
  is_anonymous: boolean;
  comment_text: string;
  created_at: string;
  updated_at: string;
  flag_valid: boolean;
  parent_id: number | null;
  children_count: number;
  display_name: string | null;
  profile_pic: string | null;
  children: CommentNode[];
}

export interface GetCommentsParams {
  post_id: number;
  limit?: number;
  offset?: number;
}

export interface GetCommentsResponse {
  data: CommentNode[];
  total: number;
  hasMore: boolean;
}

export interface CreateCommentParams {
  user_id: number;
  post_id: number;
  comment_text: string;
  is_anonymous?: boolean;
  parent_id?: number;
}

export interface UpdateCommentParams {
  user_id: number;
  comment_id: number;
  comment_text?: string;
  flag_valid?: boolean;
}

export interface DeleteCommentParams {
  user_id: number;
  comment_id: number;
}

// ==================== CLASS INFO ====================

export interface ClassMember {
  student_id: number;
  user_sys_id: number;
  student_code: string;
  display_name: string;
  profile_pic: string | null;
}

export interface ClassEducator {
  educator_id: number;
  position: string;
  user_sys_id: number;
  display_name: string;
  profile_pic: string | null;
  is_main_teacher: boolean;
}

export interface ClassInfoData {
  room_location: string;
  schedules: ClassSchedule[];
  members: ClassMember[];
  educators: ClassEducator[];
}

export interface ClassInfoResponse {
  success: boolean;
  message: string;
  data: ClassInfoData;
}
