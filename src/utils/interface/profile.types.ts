export interface UserProfileFields {
    user_sys_id: number;
    code: string;
    email: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    phone: string | null;
    profile_pic: string | null;
    role_id: number;
    role_name: string;
    role_group: 'teacher' | 'student';
}

export interface UpdateProfileRequest {
    first_name?: string;
    last_name?: string;
    email?: string;
    code?: string;
    phone?: string;
    profile_pic?: string;
}

export interface TeachingScheduleFields {
    scheduleId: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    className: string;
    subjectName: string;
    subjectCode: string;
    building: string;
}
