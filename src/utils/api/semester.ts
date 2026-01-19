import { fetchDataApi } from "@/utils/callAPI"
import { semesterFields } from "@/utils/interface/semester.types"


export const getSemester = async (input: semesterFields) => {

    const {
        semester_id = "",
        inst_id = "",
        semester = "",
        start_date = "",
        end_date = "",
        flag_valid = "",
        status = "",
        offset,
        limit,
        sort_by,
        sort_order
    } = input;

    const data = await fetchDataApi(`POST`, "semester.get", {
        semester_id: semester_id,
        inst_id: inst_id,
        semester: semester,
        start_date: start_date,
        end_date: end_date,
        flag_valid: flag_valid,
        offset: offset,
        limit: limit,
        sort_by: sort_by,
        sort_order: sort_order,
        status: status
    });

    return data;
};


export const createSemester = async (input: semesterFields) => {

    const {
        inst_id = "",
        semester = "",
        start_date = "",
        end_date = "",
        flag_valid = "",
        status = ""
    } = input;

    const data = await fetchDataApi(`POST`, "semester.create", {
        inst_id: inst_id,
        semester: semester,
        start_date: start_date,
        end_date: end_date,
        flag_valid: flag_valid,
        status: status
    });

    return data;
};


export const updateSemester = async (input: semesterFields) => {

    const {
        semester_id,
        inst_id,
        semester,
        start_date,
        end_date,
        flag_valid,
        status
    } = input;

    const data = await fetchDataApi(`POST`, "semester.update", {
        semester_id: semester_id,
        inst_id: inst_id,
        semester: semester,
        start_date: start_date,
        end_date: end_date,
        flag_valid: flag_valid,
        status: status
    });

    return data;
};