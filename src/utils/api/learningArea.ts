import { fetchDataApi } from "@/utils/callAPI"
import { learningAreaFields } from "@/utils/interface/learningArea.types"

// GET /learning-area/:id - ดึงข้อมูลตาม ID
export const getLearningAreaById = async (id: number) => {
    const data = await fetchDataApi(`GET`, `learning-area/${id}`, {});
    return data;
};

// GET /learning-area - ค้นหาพร้อม pagination
export const getLearningArea = async (input: learningAreaFields) => {
    const {
        learning_area_id,
        inst_id,
        learning_area_name,
        flag_valid,
        offset,
        limit,
        sort_by,
        sort_order,
        subject_count,
    } = input;

    const data = await fetchDataApi(`GET`, "learning-area", {
        learning_area_id,
        inst_id,
        learning_area_name,
        flag_valid,
        offset,
        limit,
        sort_by,
        sort_order,
        subject_count,
    });

    return data;
};

// POST /learning-area - สร้างใหม่
export const createLearningArea = async (input: learningAreaFields) => {
    const {
        inst_id,
        learning_area_name,
        remark,
        flag_valid,
    } = input;

    const data = await fetchDataApi(`POST`, "learning-area", {
        inst_id,
        learning_area_name,
        flag_valid,
        remark,
    });

    return data;
};

// PUT /learning-area/:id - อัปเดต
export const updateLearningArea = async (input: learningAreaFields) => {
    const {
        learning_area_id,
        inst_id,
        learning_area_name,
        remark,
        flag_valid
    } = input;

    const data = await fetchDataApi(`PUT`, `learning-area/${learning_area_id}`, {
        inst_id,
        learning_area_name,
        remark,
        flag_valid
    });

    return data;
};

// DELETE /learning-area/:id - ลบ
export const deleteLearningArea = async (id: number) => {
    const data = await fetchDataApi(`DELETE`, `learning-area/${id}`, {});
    return data;
};

// POST /learning-area/user-sys - สร้าง user sys normalize
export const createLearningAreaUserSys = async (input: learningAreaFields) => {
    const {
        learning_area_id,
        user_sys_id,
    } = input;

    const data = await fetchDataApi(`POST`, "learning-area/user-sys", {
        learning_area_id,
        user_sys_id,
    });

    return data;
};

// PUT /learning-area/user-sys - อัปเดต user sys normalize
export const updateLearningAreaUserSys = async (input: learningAreaFields) => {
    const {
        learning_area_id,
        user_sys_id,
        flag_valid,
    } = input;

    const data = await fetchDataApi(`PUT`, "learning-area/user-sys", {
        learning_area_id,
        user_sys_id,
        flag_valid
    });

    return data;
};

// DELETE /learning-area/user-sys - ลบ user sys normalize
export const deleteLearningAreaUserSys = async (input: learningAreaFields) => {
    const {
        learning_area_id,
        user_sys_id,
    } = input;

    const data = await fetchDataApi(`DELETE`, "learning-area/user-sys", {
        learning_area_id,
        user_sys_id,
    });

    return data;
};