import { fetchDataApi } from "@/utils/callAPI"
import { UserProfileFields, UpdateProfileRequest, TeachingScheduleFields } from "../interface/profile.types";

export const getUserProfile = async (userId: number) => {
    const data = await fetchDataApi(`GET`, `profile/${userId}`, {});
    return data;
};

export const updateProfile = async (userId: number, input: UpdateProfileRequest) => {
    const {
        code,
        email,
        first_name,
        last_name,
        phone,
        profile_pic,
    } = input;

    const data = await fetchDataApi(`PUT`, `profile/${userId}`, {
        code,
        email,
        first_name,
        last_name,
        phone,
        profile_pic,
    });
    return data;
};

export const getTeachingSchedule = async (userId: number) => {
    const data = await fetchDataApi(`GET`, `profile/${userId}/teaching-schedule`, {});
    return data;
};
