import { fetchDataApi } from "@/utils/callAPI";
import { eduLevelFields } from "@/utils/interface/eduLevel.types";

// GET /edu-level/:id - ดึงข้อมูลตาม ID
export const getEduLevelById = async (id: number) => {
    const data = await fetchDataApi(`GET`, `edu-level/${id}`, {});
    return data;
};

// GET /edu-level/master - ค้นหา master data
export const getEduLevelMaster = async (input: eduLevelFields) => {
    const {
        edu_lev_id,
        level_name,
        edu_type,
        flag_valid,
        level_num,
    } = input;

    const data = await fetchDataApi(`GET`, "edu-level/master", {
        edu_lev_id,
        level_name,
        edu_type,
        flag_valid,
        level_num,
    });

    return data;
};

// GET /edu-level - ค้นหาพร้อม pagination
export const getEduLevel = async (input: eduLevelFields) => {
    const {
        edu_lev_id,
        inst_id,
        level_name,
        edu_type,
        flag_valid,
        parent_id,
        offset,
        limit,
        sort_by,
        sort_order,
        level_num,
    } = input;

    const data = await fetchDataApi(`GET`, "edu-level", {
        edu_lev_id,
        inst_id,
        level_name,
        edu_type,
        flag_valid,
        parent_id,
        offset,
        limit,
        sort_by,
        sort_order,
        level_num,
    });

    return data;
};

// POST /edu-level - สร้างใหม่
export const createEduLevel = async (input: eduLevelFields) => {
    const {
        level_name,
        edu_type,
    } = input;

    const data = await fetchDataApi(`POST`, "edu-level", {
        level_name,
        edu_type,
    });

    return data;
};

// PUT /edu-level/:id - อัปเดต
export const updateEduLevel = async (input: eduLevelFields) => {
    const {
        edu_lev_id,
        level_name,
        edu_type,
        flag_valid
    } = input;

    const data = await fetchDataApi(`PUT`, `edu-level/${edu_lev_id}`, {
        level_name,
        edu_type,
        flag_valid
    });

    return data;
};

// DELETE /edu-level/:id - ลบ
export const deleteEduLevel = async (id: number) => {
    const data = await fetchDataApi(`DELETE`, `edu-level/${id}`, {});
    return data;
};

// POST /edu-level/normalize - สร้าง normalize
export const createEduLevelNorm = async (input: eduLevelFields) => {
    const {
        edu_lev_id,
        program_id,
    } = input;

    const data = await fetchDataApi(`POST`, "edu-level/normalize", {
        edu_lev_id,
        program_id,
    });

    return data;
};

// PUT /edu-level/normalize - อัปเดต normalize
export const updateEduLevelNorm = async (input: eduLevelFields) => {
    const {
        edu_lev_id,
        program_id,
    } = input;

    const data = await fetchDataApi(`PUT`, "edu-level/normalize", {
        edu_lev_id,
        program_id,
    });

    return data;
};

// DELETE /edu-level/normalize - ลบ normalize
export const deleteEduLevelNorm = async (input: eduLevelFields) => {
    const {
        edu_lev_id,
        program_id,
    } = input;

    const data = await fetchDataApi(`POST`, "edu-level/normalize/delete", {
        edu_lev_id,
        program_id,
    });

    return data;
};