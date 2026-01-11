import { fetchDataApi } from "@/utils/callAPI"
import { programFields } from "@/utils/interface/program.types"


export const getProgram = async (input: programFields) => {

    const {
        program_id = "",
        inst_id = "",
        program_name = "",
        program_type = "",
        parent_id = "",
        flag_valid = "",
        tree_type = "",
        children_count = "",
        inst_type = "",
        offset,
        limit,
        sort_by,
        sort_order,
        keyword = "",
        children_type = ""
    } = input;

    const data = await fetchDataApi(`POST`, "program.get", {
        program_id: program_id,
        inst_id: inst_id,
        program_name: program_name,
        program_type: program_type,
        parent_id: parent_id,
        flag_valid: flag_valid,
        tree_type: tree_type,
        children_count: children_count,
        inst_type: inst_type,
        offset: offset,
        limit: limit,
        sort_by: sort_by,
        sort_order: sort_order,
        keyword: keyword,
        children_type: children_type
    });

    return data;
};


export const createProgram = async (input: programFields) => {

    const {
        inst_id = "",
        program_name = "",
        program_type = "",
        parent_id,
        flag_valid = "",
        remark = "",
        tree_type = ""
    } = input;

    const data = await fetchDataApi(`POST`, "program.create", {
        inst_id: inst_id,
        program_name: program_name,
        program_type: program_type,
        parent_id: parent_id,
        flag_valid: flag_valid,
        remark: remark,
        tree_type: tree_type
    });

    return data;
};


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

    const data = await fetchDataApi(`POST`, "program.update", {
        program_id: program_id,
        inst_id: inst_id,
        program_name: program_name,
        program_type: program_type,
        parent_id: parent_id,
        flag_valid: flag_valid,
        remark: remark,
        tree_type: tree_type
    });

    return data;
};


export const updateProgramUserSys = async (input: programFields) => {

    const {
        program_id,
        user_sys_id,
        flag_valid,
    } = input;

    const data = await fetchDataApi(`POST`, "program.usersys.update", {
        program_id: program_id,
        user_sys_id: user_sys_id,
        flag_valid: flag_valid,
    });

    return data;
};