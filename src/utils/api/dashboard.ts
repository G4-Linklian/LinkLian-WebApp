import { fetchDataApi } from "@/utils/callAPI"
import { TeacherDashboard } from "../interface/dashboard.types";

export const getTeacherDashboard = async (input: TeacherDashboard) => {
    const {
        user_sys_id,
        role_type,
        report_month,
        flag_valid,
    } = input;

    const data = await fetchDataApi(`GET`, "dashboard", {
        user_sys_id,
        role_type,
        report_month,
        flag_valid,
    });

    return data;
};

export const getReportMonth = async (input: TeacherDashboard) => {
    const {
        user_sys_id,
    } = input;

    const data = await fetchDataApi(`GET`, "dashboard/report-month", {
        user_sys_id,
    });

    return data;
}