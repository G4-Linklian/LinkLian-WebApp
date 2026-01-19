import { fetchDataApi } from "@/utils/callAPI"
import { learningAreaFields } from "@/utils/interface/learningArea.types"


export const getLearningArea = async (input: learningAreaFields) => {

    const {
        learning_area_id = "",
        inst_id = "",
        learning_area_name = "",
        flag_valid = "",
        offset,
        limit,
        sort_by = "",
        sort_order,
        subject_count = "",
    } = input;

    const data = await fetchDataApi(`POST`, "learning.area.get", {
        learning_area_id: learning_area_id,
        inst_id: inst_id,
        learning_area_name: learning_area_name,
        flag_valid: flag_valid,
        offset: offset,
        limit: limit,
        sort_by: sort_by,
        sort_order: sort_order,
        subject_count: subject_count,
    });

    return data;
};


export const createLearningArea = async (input: learningAreaFields) => {

    const {
        inst_id = "",
        learning_area_name = "",
        remark = "",
        flag_valid = "",
    } = input;

    const data = await fetchDataApi(`POST`, "learning.area.create", {
        inst_id: inst_id,
        learning_area_name: learning_area_name,
        flag_valid: flag_valid,
        remark: remark,
    });

    return data;
};


export const updateLearningArea = async (input: learningAreaFields) => {

    const {
        learning_area_id,
        inst_id,
        learning_area_name,
        remark,
        flag_valid
    } = input;

    const data = await fetchDataApi(`POST`, "learning.area.update", {
        learning_area_id: learning_area_id,
        inst_id: inst_id,
        learning_area_name: learning_area_name,
        remark: remark,
        flag_valid: flag_valid
    });

    return data;
};

export const updateLearningAreaUserSys = async (input: learningAreaFields) => {

    const {
        learning_area_id,
        user_sys_id,
        flag_valid,
    } = input;

    const data = await fetchDataApi(`POST`, "learning.area.usersys.update", {
        learning_area_id: learning_area_id,
        user_sys_id: user_sys_id,
        flag_valid: flag_valid
    });

    return data;;
}