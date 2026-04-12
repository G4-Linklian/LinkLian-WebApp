export interface fileFields {
    section_id?: number;
    post_in_class_id?: number;
    title?: string;
    flag_valid?: boolean;
    attachment_id?: number;
    file_name?: string;
    file_url?: string;
    file_type?: string;
    original_name?: string;
    type?: string;
    created_at?: string;
    updated_at?: string;

    total_count?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    offset?: number;
    limit?: number;
}

export interface QnaLiveAttachment {
    attachment_id?: number;
    file_url?: string;
    file_type?: string;
    original_name?: string;
}

export interface QnaLiveMaterialPostContent {
    post_content_id?: number;
    title?: string;
    created_at?: string;
}

export interface QnaLiveMaterialItem {
    post_id?: number;
    section_id?: number;
    post_title?: string;
    post_content?: QnaLiveMaterialPostContent;
    attachments?: QnaLiveAttachment[];
}

export interface QnaLiveFields {
    qa_live_id?: number;
    section_id?: number;
    post_id?: number;
    attachment_id?: number;
    live_title?: string;
    live_by?: number;
    created_at?: string;
    updated_at?: string;
    status?: string;
    flag_valid?: boolean;

    sort_by?: string;
    sort_order?: 'ASC' | 'DESC';
}

export interface QnaLiveLogFields {
    qa_live_id: number;
    post_id: number;
    attachment_id: number;
}

export interface SearchQnaLiveFields {
    qa_live_id?: number;
    section_id?: number;
    live_by?: number;
    status?: string;
    live_title?: string;
    flag_valid?: boolean;
    sort_by?: string;
    sort_order?: 'ASC' | 'DESC';
}

export interface SearchQnaLiveLogFields {
    log_id?: number;
    qa_live_id?: number;
    post_id?: number;
    attachment_id?: number;
    opened_at?: string;
    closed_at?: string;
    flag_valid?: boolean;
    sort_by?: string;
    sort_order?: 'ASC' | 'DESC';
}

export interface UpdateQnaLiveFields {
    status?: string;
    live_by?: number;
}

export interface QnaQuestionFields {
    qa_live_id: number;
    asker_id?: number;
    question: string;
    post_id: number;
    attachment_id: number;
    file_name?: string;
    slide_number?: number;
    is_anonymous: boolean;
}

export interface UpdateQnaQuestionFields {
    status?: string;
    question?: string;
    flag_valid?: boolean;
    upvote_count?: number;
}

export interface SearchQnaQuestionFields {
    qa_question_id?: number;
    qa_live_id?: number;
    asker_id?: number;
    post_id?: number;
    attachment_id?: number;
    file_name?: string;
    slide_number?: number;
    status?: string;
    is_anonymous?: boolean;
    flag_valid?: boolean;
    sort_by?: string;
    sort_order?: 'ASC' | 'DESC';
}

export interface UpvoteFields {
    qa_question_id?: number;
    voter_id?: number;
}