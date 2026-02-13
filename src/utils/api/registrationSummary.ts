import { fetchDataApi } from "@/utils/callAPI";
import { SummaryType } from "@/enums/registrationSummary";
import { registrationSummaryFields } from "@/utils/interface/registration.summary.types";

// GET /v1/summary/registration/* - ดึงข้อมูลสรุปภาระงาน
export const getRegistrationSummary = async (input: registrationSummaryFields) => {
    const { type, inst_id, semester_id } = input;

    // Build endpoint based on type
    const endpoint = `summary/registration/${type}`;

    // Build parameters
    const params: any = { inst_id };
    
    // Add semester_id for schedule type
    if (type === SummaryType.SCHEDULE && semester_id) {
        params.semester_id = semester_id;
    }

    const data = await fetchDataApi(`GET`, endpoint, params);
    return data;
};
