import { fetchDataApi } from "@/utils/callAPI";
import { eduLevelFields } from "@/utils/interface/eduLevel.types";

export const getEduLevelMaster = async (input: eduLevelFields) => {

    const {
        edu_lev_id = "",
        level_name = "",
        edu_type = "",
        flag_valid = "",
        level_num = "",

    } = input;

    const data = await fetchDataApi(`POST`, "edu.level.master.get", {
        edu_lev_id: edu_lev_id,
        level_name: level_name,
        edu_type: edu_type,
        flag_valid: flag_valid,
        level_num: level_num
    });

    return data;
};

export const getEduLevel = async (input: eduLevelFields) => {

    const {
        edu_lev_id = "",
        inst_id = "",
        level_name = "",
        edu_type = "",
        flag_valid = "",
        parent_id = "",
        offset,
        limit,
        sort_by = "",
        sort_order = "",
        level_num = "",

    } = input;

    const data = await fetchDataApi(`POST`, "edu.level.get", {
        edu_lev_id: edu_lev_id,
        inst_id: inst_id,
        level_name: level_name,
        edu_type: edu_type,
        flag_valid: flag_valid,
        parent_id: parent_id,
        offset: offset,
        limit: limit,
        sort_by: sort_by,
        sort_order: sort_order,
        level_num: level_num,
    });

    return data;
};


export const createEduLevel = async (input: eduLevelFields) => {

    const {
        level_name = "",
        edu_type = "",
    } = input;

    const data = await fetchDataApi(`POST`, "edu.level.create", {
        level_name: level_name,
        edu_type: edu_type,
    });

    return data;
};


export const updateEduLevel = async (input: eduLevelFields) => {

    const {
        edu_lev_id,
        level_name,
        edu_type,
        flag_valid
    } = input;

    const data = await fetchDataApi(`POST`, "edu.level.update", {
        edu_lev_id: edu_lev_id,
        level_name: level_name,
        edu_type: edu_type,
        flag_valid: flag_valid
    });

    return data;
};


export const createEduLevelNorm = async (input: eduLevelFields) => {

    const {
        edu_lev_id,
        program_id,
    } = input;

    const data = await fetchDataApi(`POST`, "edu.level.norm.create", {
        edu_lev_id: edu_lev_id,
        program_id: program_id,
    });

    return data;
};

export const deleteEduLevelNorm = async (input: eduLevelFields) => {

    const {
        edu_lev_id,
        program_id,
    } = input;

    const data = await fetchDataApi(`POST`, "edu.level.norm.delete", {
        edu_lev_id: edu_lev_id,
        program_id: program_id,
    });

    return data;
};