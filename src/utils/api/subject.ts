import { fetchDataApi } from "@/utils/callAPI"
import { subjectFields } from "@/utils/interface/subject.types"

// GET /subject/:id - ดึงข้อมูลตาม ID
export const getSubjectById = async (id: number) => {
    const data = await fetchDataApi(`GET`, `subject/${id}`, {});
    return data;
};

// GET /subject - ค้นหาพร้อม pagination
export const getSubject = async (input: subjectFields) => {
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
        keyword,
        offset,
        limit,
        sort_by,
        sort_order,
    } = input;

    const data = await fetchDataApi(`GET`, "subject", {
        subject_id,
        learning_area_id,
        subject_code,
        name_th,
        name_en,
        credit,
        hour_per_week,
        flag_valid,
        inst_id,
        keyword,
        offset,
        limit,
        sort_by,
        sort_order,
    });

    return data;
};

// POST /subject - สร้างใหม่
export const createSubject = async (input: subjectFields) => {
    const {
        learning_area_id,
        subject_code,
        name_th,
        name_en,
        credit,
        hour_per_week,
        flag_valid,
        inst_id,
    } = input;

    const data = await fetchDataApi(`POST`, "subject", {
        learning_area_id,
        subject_code,
        name_th,
        name_en,
        credit,
        hour_per_week,
        flag_valid,
        inst_id,
    });

    return data;
};

// PUT /subject/:id - อัปเดต
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

    const data = await fetchDataApi(`PUT`, `subject/${subject_id}`, {
        learning_area_id,
        subject_code,
        name_th,
        name_en,
        credit,
        hour_per_week,
        flag_valid,
        inst_id,
    });

    return data;
};

// DELETE /subject/:id - ลบ
export const deleteSubject = async (id: number) => {
    const data = await fetchDataApi(`DELETE`, `subject/${id}`, {});
    return data;
};