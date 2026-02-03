import { fetchDataApi } from "@/utils/callAPI"
import { semesterFields } from "@/utils/interface/semester.types"

// GET /semester/:id - ดึงข้อมูลตาม ID
export const getSemesterById = async (id: number) => {
    const data = await fetchDataApi(`GET`, `semester/${id}`, {});
    return data;
};

// GET /semester/active/list - ดึง active semesters (open + close)
export const getActiveSemesters = async () => {
    const data = await fetchDataApi(`GET`, "semester/active/list", {});
    return data;
};

// GET /semester - ค้นหาพร้อม pagination
export const getSemester = async (input: semesterFields) => {
    const {
        semester_id,
        inst_id,
        semester,
        start_date,
        end_date,
        flag_valid,
        status,
        offset,
        limit,
        sort_by,
        sort_order
    } = input;

    const data = await fetchDataApi(`GET`, "semester", {
        semester_id,
        inst_id,
        semester,
        start_date,
        end_date,
        flag_valid,
        offset,
        limit,
        sort_by,
        sort_order,
        status
    });

    return data;
};

// POST /semester - สร้างใหม่
export const createSemester = async (input: semesterFields) => {
    const {
        inst_id,
        semester,
        start_date,
        end_date,
        flag_valid,
        status
    } = input;

    const data = await fetchDataApi(`POST`, "semester", {
        inst_id,
        semester,
        start_date,
        end_date,
        flag_valid,
        status
    });

    return data;
};

// PUT /semester/:id - อัปเดต
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

    const data = await fetchDataApi(`PUT`, `semester/${semester_id}`, {
        inst_id,
        semester,
        start_date,
        end_date,
        flag_valid,
        status
    });

    return data;
};

// DELETE /semester/:id - ลบ
export const deleteSemester = async (id: number) => {
    const data = await fetchDataApi(`DELETE`, `semester/${id}`, {});
    return data;
};

// POST /semester/subject - สร้าง semester subject normalize
export const createSemesterSubject = async (input: semesterFields) => {
    const {
        semester_id,
        subject_id,
    } = input;

    const data = await fetchDataApi(`POST`, "semester/subject", {
        semester_id,
        subject_id,
    });

    return data;
};

// DELETE /semester/subject - ลบ semester subject normalize
export const deleteSemesterSubject = async (input: semesterFields) => {
    const {
        semester_id,
        subject_id,
    } = input;

    const data = await fetchDataApi(`DELETE`, "semester/subject", {
        semester_id,
        subject_id,
    });

    return data;
};