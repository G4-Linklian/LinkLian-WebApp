import { fetchDataApi } from "../callAPI"
import { institutionFields } from "../interface/institution.types";

// POST /institution/login - เข้าสู่ระบบสถาบัน
export const loginInstitution = async (input: institutionFields) => {
    const {
        inst_email,
        inst_password
    } = input;

    const data = await fetchDataApi(`POST`, "institution/login", {
        inst_email,
        inst_password
    });

    return data;
};

