import { fetchDataApi } from "@/utils/callAPI"
import { institutionFields } from "@/utils/interface/institution.types"

// GET /institution/:id - ดึงข้อมูลตาม ID
export const getInstitutionById = async (id: number) => {
    const data = await fetchDataApi(`GET`, `institution/${id}`, {});
    return data;
};

// GET /institution/detail/:id - ดึงข้อมูลตาม ID
export const getInstitutionDetailById = async (id: number) => {
    const data = await fetchDataApi(`GET`, `institution/detail/${id}`, {});
    return data;
};

// GET /institution - ค้นหาสถาบัน
export const getInstitution = async (input: institutionFields) => {
    const {
        inst_id,
        inst_email,
        inst_type,
        flag_valid,
    } = input;

    const data = await fetchDataApi(`GET`, "institution", {
        inst_id,
        inst_email,
        inst_type,
        flag_valid,
    });

    return data;
};

// POST /institution - สร้างสถาบันใหม่
export const createInstitution = async (input: institutionFields) => {
    const {
        inst_email,
        inst_password,
        inst_type,
        flag_valid,
    } = input;

    const data = await fetchDataApi(`POST`, "institution", {
        inst_email,
        inst_password,
        inst_type,
        flag_valid,
    });

    return data;
};

// PUT /institution/:id - อัปเดตสถาบัน
export const updateInstitution = async (input: institutionFields) => {
    const {
        inst_id,
        inst_email,
        inst_password,
        inst_type,
        flag_valid,
    } = input;

    const data = await fetchDataApi(`PUT`, `institution/${inst_id}`, {
        inst_email,
        inst_password,
        inst_type,
        flag_valid,
    });

    return data;
};

// DELETE /institution/:id - ลบสถาบัน
export const deleteInstitution = async (id: number) => {
    const data = await fetchDataApi(`DELETE`, `institution/${id}`, {});
    return data;
};