import { fetchDataApi } from "../callAPI"
import { UserSysFields } from "../interface/user.types";

export const teacherLogin = async (input: UserSysFields, rememberMe: boolean) => {
    const {
        email,
        password,
    } = input;

    const data = await fetchDataApi(`POST`, "auth/login", {
        username: email,
        password: password,
        user_group: "teacher",
        remember_me: rememberMe
    });

    return data;
};

export const verifyTeacherOtp = async (otp: string, otpSessionId: string) => {
    const data = await fetchDataApi(`POST`, "auth/verify-otp", {
        otp: otp,
        otp_session_id: otpSessionId
    });

    return data;
}