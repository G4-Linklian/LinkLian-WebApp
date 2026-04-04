export interface fileFields {
    section_id?: number;
    post_in_class_id?: number;
    post_attachment_id?: number;
    file_name?: string;
    file_url?: string;
    type?: string;
    created_at?: string;
    updated_at?: string;
    total_count?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    offset?: number;
    limit?: number;
}
