import { fetchDataApi } from "../callAPI"
import { institutionFields } from "../interface/institution.types";

export const loginInstitution = async (input: institutionFields) => {

    const {
        inst_email = "",
        inst_password = ""
    } = input;

    const data = await fetchDataApi(`POST`, "institution.login", {
        inst_email: inst_email,
        inst_password: inst_password
    });

    return data;
};

