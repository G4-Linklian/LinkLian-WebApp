import { fetchDataApi } from "../callAPI"
import { UserSysFields } from "@/utils/interface/user.types"

// GET /users/:id - ดึงข้อมูลตาม ID
export const getUserSysById = async (id: number) => {
    const data = await fetchDataApi(`GET`, `users/${id}`, {});
    return data;
};

// GET /users - ค้นหาพร้อม pagination
export const getUserSys = async (input: UserSysFields) => {
    const {
        user_sys_id,
        email,
        first_name,
        middle_name,
        last_name,
        phone,
        role_id,
        code,
        edu_lev_id,
        inst_id,
        learning_area_id,
        program_id,
        flag_valid,
        user_status,
        offset,
        limit,
        sort_by,
        sort_order,
        keyword
    } = input;

    const data = await fetchDataApi(`GET`, "users", {
        user_sys_id,
        email,
        first_name,
        middle_name,
        last_name,
        phone,
        role_id,
        code,
        edu_lev_id,
        inst_id,
        learning_area_id,
        program_id,
        flag_valid,
        user_status,
        offset,
        limit,
        sort_by,
        sort_order,
        keyword
    });

    return data;
};

// POST /users - สร้างใหม่
export const createUserSys = async (input: UserSysFields) => {
    const {
        email,
        password,
        first_name,
        middle_name,
        last_name,
        phone,
        role_id,
        inst_id,
        flag_valid,
        user_status,
        profile_pic,
        code,
        learning_area_id,
        program_id,
        edu_lev_id,
    } = input;

    const data = await fetchDataApi(`POST`, "users", {
        email,
        password,
        first_name,
        middle_name,
        last_name,
        phone,
        role_id,
        inst_id,
        flag_valid,
        user_status,
        profile_pic,
        code,
        learning_area_id,
        program_id,
        edu_lev_id,
    });

    return data;
};

// PUT /users/:id - อัปเดต
export const updateUserSys = async (input: UserSysFields) => {
    const {
        user_sys_id,
        email,
        password,
        first_name,
        middle_name,
        last_name,
        phone,
        role_id,
        inst_id,
        flag_valid,
        user_status,
        profile_pic,
        code,
        edu_lev_id,
        learning_area_id,
    } = input;

    const data = await fetchDataApi(`PUT`, `users/${user_sys_id}`, {
        email,
        password,
        first_name,
        middle_name,
        last_name,
        phone,
        role_id,
        inst_id,
        flag_valid,
        user_status,
        profile_pic,
        code,
        edu_lev_id,
        learning_area_id,
    });

    return data;
};

// DELETE /users/:id - ลบ
export const deleteUserSys = async (id: number) => {
    const data = await fetchDataApi(`DELETE`, `users/${id}`, {});
    return data;
};
