import { fetchDataApi } from "@/utils/callAPI"
import { sectionFields, SectionSchedulePayload } from "@/utils/interface/section.types"


export const getSectionMaster = async (input: sectionFields) => {

    const {
        section_id,
        semester_id,
        subject_id,
        flag_valid,
        schedule_id,
        day_of_week,
        start_time,
        end_time,
        room_location_id,
        inst_id,
        offset,
        limit,
        sort_by,
        sort_order
    } = input;

    const data = await fetchDataApi(`POST`, "section.master.get", {
        section_id: section_id,
        semester_id: semester_id,
        subject_id: subject_id,
        flag_valid: flag_valid,
        schedule_id: schedule_id,
        day_of_week: day_of_week,
        start_time: start_time,
        end_time: end_time,
        room_location_id: room_location_id,
        inst_id: inst_id,
        offset: offset,
        limit: limit,
        sort_by: sort_by,
        sort_order: sort_order
    });

    return data;
};

export const getSchedule = async (input: sectionFields) => {
    const {
        schedule_id,
        section_id,
        day_of_week,
        start_time,
        end_time,
        room_location_id,
        flag_valid,
    } = input;

    const data = await fetchDataApi(`POST`, "schedule.get", {
        schedule_id: schedule_id,
        section_id: section_id,
        day_of_week: day_of_week,
        start_time: start_time,
        end_time: end_time,
        room_location_id: room_location_id,
        flag_valid: flag_valid
    });

    return data;
};

export const updateSectionSchedule = async (input: SectionSchedulePayload) => {

    const {
        section_id,
        subject_id,
        semester_id,
        section_name,
        day_of_week,
        start_time,
        end_time,
        room_location_id,
        schedule_id
    } = input;

    const data = await fetchDataApi(`POST`, "section.schedule.update", {
        section_id: section_id,
        subject_id: subject_id,
        semester_id: semester_id,
        section_name: section_name,
        day_of_week: day_of_week,
        start_time: start_time,
        end_time: end_time,
        room_location_id: room_location_id,
        schedule_id: schedule_id
    });

    return data;
};

export const getSectionEducator = async (input: sectionFields) => {

    const {
        section_id,
        user_sys_id,
        flag_valid,
    } = input;

    const data = await fetchDataApi(`POST`, "section.educator.get", {
        section_id: section_id,
        user_sys_id: user_sys_id,
        flag_valid: flag_valid,
    });

    return data;
};

export const updateSectionEducator = async (input: sectionFields) => {
    const {
        section_id,
        user_sys_id,
        position,
        flag_valid,
    } = input;

    const data = await fetchDataApi(`POST`, "section.educator.update", {
        section_id: section_id,
        user_sys_id: user_sys_id,
        position: position,
        flag_valid: flag_valid,
    });

    return data;
}

export const createSectionEducator = async (input: sectionFields) => {
    const {
        section_id,
        user_sys_id,
        position,
    } = input;

    const data = await fetchDataApi(`POST`, "section.educator.create", {
        section_id: section_id,
        user_sys_id: user_sys_id,
        position: position,
    });

    return data;
}


export const getSectionEnrollment = async (input: sectionFields) => {

    const {
        section_id,
        user_sys_id,
        flag_valid,
        offset,
        limit,
        sort_by,
        sort_order
    } = input;

    const data = await fetchDataApi(`POST`, "section.enrollment.get", {
        section_id: section_id,
        user_sys_id: user_sys_id,
        flag_valid: flag_valid,
        offset: offset,
        limit: limit,
        sort_by: sort_by,
        sort_order: sort_order
    });

    return data;
};

export const updateSectionEnrollment = async (input: sectionFields) => {
    const {
        section_id,
        user_sys_id,
        position,
        flag_valid,
    } = input;

    const data = await fetchDataApi(`POST`, "section.enrollment.update", {
        section_id: section_id,
        user_sys_id: user_sys_id,
        position: position,
        flag_valid: flag_valid,
    });

    return data;
}

export const createSectionEnrollment = async (input: sectionFields) => {
    const {
        section_id,
        user_sys_id,
    } = input;

    const data = await fetchDataApi(`POST`, "section.enrollment.create", {
        section_id: section_id,
        user_sys_id: user_sys_id,
    });

    return data;
}

export const createSectionSchedule = async (input: SectionSchedulePayload) => {

    const {
        subject_id,
        semester_id,
        section_name,
        day_of_week,
        start_time,
        end_time,
        room_location_id,
        section_id
    } = input;

    const data = await fetchDataApi(`POST`, "section.schedule.create", {
        semester_id: semester_id,
        section_name: section_name,
        day_of_week: day_of_week,
        start_time: start_time,
        end_time: end_time,
        room_location_id: room_location_id,
        section_id: section_id,
        subject_id: subject_id

    });

    return data;
}

export const createSchedule = async (input: SectionSchedulePayload) => {

    const {
        section_id,
        day_of_week,
        start_time,
        end_time,
        room_location_id,
    } = input;

    const data = await fetchDataApi(`POST`, "schedule.create", {
        day_of_week: day_of_week,
        start_time: start_time,
        end_time: end_time,
        room_location_id: room_location_id,
        section_id: section_id
    });

    return data;
}