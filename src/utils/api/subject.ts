import { fetchDataApi } from "@/utils/callAPI"
import { subjectFields } from "@/utils/interface/subject.types"


export const getSubject = async (input: subjectFields) => {

    const {
        subject_id = "",
        learning_area_id = "",
        subject_code = "",
        name_th = "",
        name_en = "",
        credit,
        hour_per_week,
        flag_valid = "",
        inst_id = "",
        offset,
        limit,
        sort_by = "",
        sort_order,
    } = input;

    const data = await fetchDataApi(`POST`, "subject.get", {
        subject_id: subject_id,
        learning_area_id: learning_area_id,
        subject_code: subject_code,
        name_th: name_th,
        name_en: name_en,
        credit: credit,
        hour_per_week: hour_per_week,
        flag_valid: flag_valid,
        inst_id: inst_id,
        offset: offset,
        limit: limit,
        sort_by: sort_by,
        sort_order: sort_order,
    });

    return data;
};


export const createSubject = async (input: subjectFields) => {

    const {
        learning_area_id = "",
        subject_code = "",
        name_th = "",
        name_en = "",
        credit = 0,
        hour_per_week = 0,
        flag_valid = "",
        inst_id = "",
    } = input;

    const data = await fetchDataApi(`POST`, "subject.create", {
        learning_area_id: learning_area_id,
        subject_code: subject_code,
        name_th: name_th,
        name_en: name_en,
        credit: credit,
        hour_per_week: hour_per_week,
        flag_valid: flag_valid,
        inst_id: inst_id,
    });

    return data;
};


export const updateSubject = async (input: subjectFields) => {

    const {
        subject_id,
        learning_area_id,
        subject_code,
        name_th,
        name_en,
        credit,
        hour_per_week,
        flag_valid,
        inst_id,
    } = input;

    const data = await fetchDataApi(`POST`, "subject.update", {
        subject_id: subject_id,
        learning_area_id: learning_area_id,
        subject_code: subject_code,
        name_th: name_th,
        name_en: name_en,
        credit: credit,
        hour_per_week: hour_per_week,
        flag_valid: flag_valid,
        inst_id: inst_id,
    });

    return data;
};