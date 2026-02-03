import { fetchDataApi } from "@/utils/callAPI"
import { programFields } from "@/utils/interface/program.types"

// GET /program/:id - ดึงข้อมูลตาม ID
export const getProgramById = async (id: number) => {
    const data = await fetchDataApi(`GET`, `program/${id}`, {});
    return data;
};

// GET /program - ค้นหาพร้อม pagination
export const getProgram = async (input: programFields) => {
    const {
        program_id,
        inst_id,
        program_name,
        program_type,
        parent_id,
        flag_valid,
        tree_type,
        children_count,
        inst_type,
        offset,
        limit,
        sort_by,
        sort_order,
        keyword,
        children_type
    } = input;

    const data = await fetchDataApi(`GET`, "program", {
        program_id,
        inst_id,
        program_name,
        program_type,
        parent_id,
        flag_valid,
        tree_type,
        children_count,
        inst_type,
        offset,
        limit,
        sort_by,
        sort_order,
        keyword,
        children_type
    });

    return data;
};

// POST /program - สร้างใหม่
export const createProgram = async (input: programFields) => {
    const {
        inst_id,
        program_name,
        program_type,
        parent_id,
        flag_valid,
        remark,
        tree_type
    } = input;

    const data = await fetchDataApi(`POST`, "program", {
        inst_id,
        program_name,
        program_type,
        parent_id,
        flag_valid,
        remark,
        tree_type
    });

    return data;
};

// PUT /program/:id - อัปเดต
export const updateProgram = async (input: programFields) => {
    const {
        program_id,
        inst_id,
        program_name,
        program_type,
        parent_id,
        flag_valid,
        remark,
        tree_type
    } = input;

    const data = await fetchDataApi(`PUT`, `program/${program_id}`, {
        inst_id,
        program_name,
        program_type,
        parent_id,
        flag_valid,
        remark,
        tree_type
    });

    return data;
};

// DELETE /program/:id - ลบ
export const deleteProgram = async (id: number) => {
    const data = await fetchDataApi(`DELETE`, `program/${id}`, {});
    return data;
};

// POST /program/user-sys - สร้าง user sys normalize
export const createProgramUserSys = async (input: programFields) => {
    const {
        program_id,
        user_sys_id,
    } = input;

    const data = await fetchDataApi(`POST`, "program/user-sys", {
        program_id,
        user_sys_id,
    });

    return data;
};

// PUT /program/user-sys - อัปเดต user sys normalize
export const updateProgramUserSys = async (input: programFields) => {
    const {
        program_id,
        user_sys_id,
        flag_valid,
    } = input;

    const data = await fetchDataApi(`PUT`, "program/user-sys", {
        program_id,
        user_sys_id,
        flag_valid,
    });

    return data;
};

// DELETE /program/user-sys - ลบ user sys normalize
export const deleteProgramUserSys = async (input: programFields) => {
    const {
        program_id,
        user_sys_id,
    } = input;

    const data = await fetchDataApi(`DELETE`, "program/user-sys", {
        program_id,
        user_sys_id,
    });

    return data;
};