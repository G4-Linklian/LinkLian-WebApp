import { fetchDataApi } from "../callAPI"
import { UserSysFields } from "@/utils/interface/user.types"


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
        flag_valid,
        user_status,
        offset,
        limit,
        sort_by,
        sort_order,
        keyword
    } = input;

    const data = await fetchDataApi(`POST`, "usersys.get", {
        user_sys_id: user_sys_id,
        email: email,
        first_name: first_name,
        middle_name: middle_name,
        last_name: last_name,
        phone: phone,
        role_id: role_id,
        code: code,
        edu_lev_id: edu_lev_id,
        inst_id: inst_id,
        flag_valid: flag_valid,
        user_status: user_status,
        offset: offset,
        limit: limit,
        sort_by: sort_by,
        sort_order: sort_order,
        keyword: keyword
    });

    return data;
};

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

    const data = await fetchDataApi(`POST`, "usersys.create", {
        email: email,
        password: password,
        first_name: first_name,
        middle_name: middle_name,
        last_name: last_name,
        phone: phone,
        role_id: role_id,
        inst_id: inst_id,
        flag_valid: flag_valid,
        user_status: user_status,
        profile_pic: profile_pic,
        code: code,
        learning_area_id: learning_area_id,
        program_id: program_id,
        edu_lev_id: edu_lev_id,
    });

    return data;
};

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
    } = input;

    const data = await fetchDataApi(`POST`, "usersys.update", {
        user_sys_id: user_sys_id,
        email: email,
        password: password,
        first_name: first_name,
        middle_name: middle_name,
        last_name: last_name,
        phone: phone,
        role_id: role_id,
        inst_id: inst_id,
        flag_valid: flag_valid,
        user_status: user_status,
        profile_pic: profile_pic,
        code: code,
        edu_lev_id: edu_lev_id,
    });
    return data;
};
