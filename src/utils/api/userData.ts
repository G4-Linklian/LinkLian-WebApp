import { fetchDataApi } from "../callAPI"

export interface RegisterField {
    user_sys_id?: number;
    email?: string;
    firstname?: string;
    lastname?: string;
    sex?: string;
    phone?: string | null;
    weight?: number | null;
    height?: number | null;
    password?: string;
    username?: string;
    user_first_name? : string;
    user_last_name? : string;
}

export const getUser = async (input: RegisterField) => {

    const {
        user_sys_id = "",
        email = "",
        sex = "",
        username = "",
    } = input;

    const data = await fetchDataApi(`POST`, "user.get", {
        user_sys_id: user_sys_id,
        email: email,
        sex: sex,
        username: username
    });

    return data;
};

export const updateUser = async (input: RegisterField) => {
    const {
        user_sys_id = "",
        email = "",
        sex = "",
        username = "",
        user_first_name = "",
        user_last_name = "",
        phone = "",
        weight = "",
        height = ""
    } = input;

    const data = await fetchDataApi("POST", "user.update", {
        user_sys_id,
        email,
        username,
        sex,
        user_first_name,
        user_last_name,
        phone,
        weight,
        height
    });

    return data;
};
