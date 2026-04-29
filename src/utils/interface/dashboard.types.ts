export interface TeacherAssets {
  total_file: number;
  total_qa_live: number;
  file_this_month: number;
  total_assignment: number;
  qa_live_this_month: number;
  assignment_this_month: number;
}

export interface TeacherSectionInstance {
  section_id: number;
  section_name: string;
  subject_name: string;
  post_id: number;
}

export interface TeacherTopBookmarkedPost {
  title: string;
  bookmark_count: number;
  post_content_id: number;
  section_instances: TeacherSectionInstance[];
}

export interface TeacherAssignmentStat {
  title: string;
  assignment_id: number;
  on_time_count: number;
  late_count: number;
  missing_count: number;
}

export interface TeacherQATopPage {
  page_number: number;
  question_count: number;
}

export interface TeacherQATopFile {
  attachment_id: number;
  attachment_name: string;
  top_page: TeacherQATopPage[];
}

export interface TeacherQALiveSession {
  qa_live_id: number;
  title: string;
  started_at: string;
  duration_second: number;
  total_question: number;
  top_questioned_file: TeacherQATopFile[];
}

export interface TeacherQALiveInsight {
  total_live_count: number;
  lives: TeacherQALiveSession[]; 
}

export interface TeacherSection {
  section_id: number;
  section_name: string;
  subject_name: string;
  assignment_stat: TeacherAssignmentStat[];
  qa_live_insight: TeacherQALiveInsight | null;
}

export interface TeacherDashboardPayload {
  assets: TeacherAssets;
  top_bookmarked_posts: TeacherTopBookmarkedPost[];
  section: TeacherSection[];
}

export interface TeacherDashboard{
  dashboard_id?: number;
  user_sys_id?: number;
  role_type?: string; 
  report_month?: string;
  payload?: TeacherDashboardPayload; 
  created_at?: string;
  flag_valid?: boolean;
}