import { fetchDataApi } from "@/utils/callAPI"
import { sectionFields, SectionSchedulePayload } from "@/utils/interface/section.types"

// ========== Search Endpoints ==========

// GET /section/master - ค้นหา section (master view with student count)
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
        keyword,
        offset,
        limit,
        sort_by,
        sort_order,
        section_name,
        hour_per_week,
    } = input;

    const data = await fetchDataApi(`GET`, "section/master", {
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
        keyword,
        offset,
        limit,
        sort_by,
        sort_order,
        section_name,
        hour_per_week,
    });

    return data;
};

// GET /section - ค้นหา section with schedule and room details
export const getSection = async (input: sectionFields) => {
    const {
        section_id,
        semester_id,
        subject_id,
        flag_valid,
        offset,
        limit,
        sort_by,
        sort_order,
        section_name
    } = input;

    const data = await fetchDataApi(`GET`, "section", {
        section_id,
        semester_id,
        subject_id,
        flag_valid,
        offset,
        limit,
        sort_by,
        sort_order,
        section_name
    });

    return data;
};

// GET /section/schedule - ค้นหา schedule
export const getSchedule = async (input: SectionSchedulePayload) => {
    const {
        schedule_id,
        section_id,
        day_of_week,
        start_time,
        end_time,
        room_location_id,
        flag_valid,
    } = input;

    const data = await fetchDataApi(`GET`, "section/schedule", {
        schedule_id,
        section_id,
        day_of_week,
        start_time,
        end_time,
        room_location_id,
        flag_valid
    });

    return data;
};

// GET /section/educator - ค้นหา section educator
export const getSectionEducator = async (input: sectionFields) => {
    const {
        section_id,
        user_sys_id,
        position,
        flag_valid,
        offset,
        limit,
        sort_by,
        sort_order
    } = input;

    const data = await fetchDataApi(`GET`, "section/educator", {
        section_id,
        user_sys_id,
        position,
        flag_valid,
        offset,
        limit,
        sort_by,
        sort_order
    });

    return data;
};

// GET /section/enrollment - ค้นหา enrollment
export const getSectionEnrollment = async (input: sectionFields) => {
    const {
        section_id,
        user_sys_id,
        flag_valid,
        keyword,
        learning_area_id,
        program_id,
        edu_lev_id,
        user_status,
        offset,
        limit,
        sort_by,
        sort_order
    } = input;

    const data = await fetchDataApi(`GET`, "section/enrollment", {
        section_id,
        user_sys_id,
        flag_valid,
        learning_area_id,
        program_id,
        edu_lev_id,
        user_status,
        keyword,
        offset,
        limit,
        sort_by,
        sort_order
    });

    return data;
};

// ========== Create Endpoints ==========

// POST /section - สร้าง section
export const createSection = async (input: sectionFields) => {
    const {
        subject_id,
        semester_id,
        section_name,
    } = input;

    const data = await fetchDataApi(`POST`, "section", {
        subject_id,
        semester_id,
        section_name,
    });

    return data;
};

// POST /section/schedule - สร้าง schedule
export const createSchedule = async (input: SectionSchedulePayload) => {
    const {
        section_id,
        day_of_week,
        start_time,
        end_time,
        room_location_id,
    } = input;

    const data = await fetchDataApi(`POST`, "section/schedule", {
        section_id,
        day_of_week,
        start_time,
        end_time,
        room_location_id,
    });

    return data;
};

// POST /section/section-schedule - สร้าง section พร้อม schedule
export const createSectionSchedule = async (input: SectionSchedulePayload) => {
    const {
        subject_id,
        semester_id,
        section_name,
        day_of_week,
        start_time,
        end_time,
        room_location_id,
    } = input;

    const data = await fetchDataApi(`POST`, "section/section-schedule", {
        subject_id,
        semester_id,
        section_name,
        day_of_week,
        start_time,
        end_time,
        room_location_id,
    });

    return data;
};

// POST /section/educator - สร้าง section educator
export const createSectionEducator = async (input: sectionFields) => {
    const {
        section_id,
        user_sys_id,
        position,
    } = input;

    const data = await fetchDataApi(`POST`, "section/educator", {
        section_id,
        user_sys_id,
        position,
    });

    return data;
};

// POST /section/enrollment - สร้าง enrollment
export const createSectionEnrollment = async (input: sectionFields) => {
    const {
        section_id,
        user_sys_id,
    } = input;

    const data = await fetchDataApi(`POST`, "section/enrollment", {
        section_id,
        user_sys_id,
    });

    return data;
};

// ========== Update Endpoints ==========

// PUT /section/:id - อัปเดต section
export const updateSection = async (input: sectionFields) => {
    const {
        section_id,
        subject_id,
        semester_id,
        section_name,
        flag_valid,
    } = input;

    const data = await fetchDataApi(`PUT`, `section/${section_id}`, {
        subject_id,
        semester_id,
        section_name,
        flag_valid,
    });

    return data;
};

// PUT /section/section-schedule/update - อัปเดต section พร้อม schedule
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
        schedule_id,
        flag_valid,
    } = input;

    const data = await fetchDataApi(`PUT`, "section/section-schedule/update", {
        section_id,
        subject_id,
        semester_id,
        section_name,
        day_of_week,
        start_time,
        end_time,
        room_location_id,
        schedule_id,
        flag_valid,
    });

    return data;
};

// PUT /section/educator/update - อัปเดต section educator
export const updateSectionEducator = async (input: sectionFields) => {
    const {
        section_id,
        user_sys_id,
        position,
        flag_valid,
    } = input;

    const data = await fetchDataApi(`PUT`, "section/educator/update", {
        section_id,
        user_sys_id,
        position,
        flag_valid,
    });

    return data;
};

// PUT /section/enrollment/update - อัปเดต enrollment
export const updateSectionEnrollment = async (input: sectionFields) => {
    const {
        section_id,
        user_sys_id,
        flag_valid,
    } = input;

    const data = await fetchDataApi(`PUT`, "section/enrollment/update", {
        section_id,
        user_sys_id,
        flag_valid,
    });

    return data;
};

// ========== Delete Endpoints ==========

// DELETE /section/:id - ลบ section
export const deleteSection = async (id: number) => {
    const data = await fetchDataApi(`DELETE`, `section/${id}`, {});
    return data;
};

// DELETE /section/schedule/:id - ลบ schedule
export const deleteSchedule = async (id: number) => {
    const data = await fetchDataApi(`DELETE`, `section/schedule/${id}`, {});
    return data;
};

// DELETE /section/educator - ลบ section educator
export const deleteSectionEducator = async (input: sectionFields) => {
    const {
        section_id,
        user_sys_id,
    } = input;

    const data = await fetchDataApi(`POST`, "section/educator/delete", {
        section_id,
        user_sys_id,
    });

    return data;
};

// DELETE /section/enrollment - ลบ enrollment
export const deleteSectionEnrollment = async (input: sectionFields) => {
    const {
        section_id,
        user_sys_id,
    } = input;

    const data = await fetchDataApi(`POST`, "section/enrollment/delete", {
        section_id,
        user_sys_id,
    });

    return data;
};