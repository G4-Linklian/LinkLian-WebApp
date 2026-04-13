export interface reportInstFields {
    inst_report_id?: number;
    inst_id?: number;
    reporter_id?: number;
    reporter_role_name?: string;
    reporter_first_name?: string;
    reporter_last_name?: string;
    keyword?: string;
    title?: string;
    detail?: string;
    report_file?: object;
    flag_valid?: boolean;
    report_date?: string;
    mark_resolved?: boolean;
    offset?: number;
    limit?: number;
}

export interface reportAdminFields {
    admin_report_id?: number;
    inst_id?: number;
    reporter_role_name?: string;
    reporter_first_name?: string;
    reporter_last_name?: string;
    keyword?: string;
    title?: string;
    detail?: string;
    report_file?: object;
    flag_valid?: boolean;
    report_date?: string;
    mark_resolved?: boolean;
    offset?: number;
    limit?: number;
}