import { SummaryType } from "@/enums/registrationSummary";

export interface registrationSummaryFields {
    type?: SummaryType;
    semester_id?: number;
    inst_id?: number;
}