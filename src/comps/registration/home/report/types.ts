export interface ReportFileItem {
    url?: string;
    type?: string;
    original_name?: string;
}

export interface ReportRow {
    inst_report_id?: number;
    title?: string;
    detail?: string;
    reporter_first_name?: string;
    reporter_last_name?: string;
    reporter_role_name?: string;
    reporter_email?: string;
    report_date?: string;
    report_file?: unknown;
    mark_resolved?: boolean;
}

export interface ReportFilterParams {
    keyword?: string;
    reporter_role_name?: string;
}

export const parseReportFiles = (reportFile: unknown): ReportFileItem[] => {
    if (!reportFile) return [];

    const parseAny = (value: unknown): ReportFileItem[] => {
        if (!value) return [];
        if (Array.isArray(value)) return value as ReportFileItem[];

        if (typeof value === "string") {
            try {
                const parsed = JSON.parse(value);
                return parseAny(parsed);
            } catch {
                return [];
            }
        }

        if (typeof value === "object") {
            const candidate = value as { files?: ReportFileItem[]; reportFilePayload?: ReportFileItem[] };
            if (Array.isArray(candidate.files)) return candidate.files;
            if (Array.isArray(candidate.reportFilePayload)) return candidate.reportFilePayload;
        }

        return [];
    };

    return parseAny(reportFile);
};
