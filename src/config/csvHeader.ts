// academic staff import columns and template filename
export const STAFF_IMPORT_COLUMNS = [
    { header: "รหัสบุคลากร", key: "code", width: 30 },
    { header: "ชื่อจริง", key: "first_name", width: 30 },
    { header: "นามสกุล", key: "last_name", width: 30 },
    { header: "อีเมล", key: "email", width: 30 },
    { header: "เบอร์โทร", key: "phone", width: 30 },
    { header: "กลุ่มการเรียนรู้", key: "learning_area", width: 30 },
    {
        header: "สถานะผู้ใช้",
        key: "status",
        width: 30,
        dropdown: ["ใช้งาน", "ไม่ใช้งาน", "ลาออก", "เกษียณ"]
    }
];

export const STAFF_TEMPLATE_FILENAME = "academic_staff_template.xlsx";

// student import columns for SCHOOL (โรงเรียน)
export const STUDENT_SCHOOL_IMPORT_COLUMNS = [
    { header: "รหัสนักเรียน", key: "code", width: 15 },
    { header: "ชื่อจริง", key: "first_name", width: 20 },
    { header: "นามสกุล", key: "last_name", width: 20 },
    { header: "อีเมล", key: "email", width: 25 },
    { header: "เบอร์โทร", key: "phone", width: 15 },
    { header: "แผนการเรียน", key: "program_name", width: 20 },
    { header: "ระดับชั้น", key: "edu_level", width: 15 },
    { header: "ห้องเรียน", key: "classroom", width: 15 },
    {
        header: "สถานะผู้ใช้",
        key: "status",
        width: 15,
        dropdown: ["ใช้งาน", "ไม่ใช้งาน", "สำเร็จการศึกษา", "ลาออก"]
    }
];

export const STUDENT_SCHOOL_TEMPLATE_FILENAME = "student_school_template.xlsx";

// student import columns for UNIVERSITY (มหาวิทยาลัย)
export const STUDENT_UNIVERSITY_IMPORT_COLUMNS = [
    { header: "รหัสนักศึกษา", key: "code", width: 15 },
    { header: "ชื่อจริง", key: "first_name", width: 20 },
    { header: "นามสกุล", key: "last_name", width: 20 },
    { header: "อีเมล", key: "email", width: 25 },
    { header: "เบอร์โทร", key: "phone", width: 15 },
    { header: "คณะ", key: "faculty", width: 25 },
    { header: "ภาควิชา", key: "department", width: 25 },
    { header: "สาขา", key: "major", width: 25 },
    {
        header: "สถานะผู้ใช้",
        key: "status",
        width: 15,
        dropdown: ["ใช้งาน", "ไม่ใช้งาน", "สำเร็จการศึกษา", "ลาออก"]
    }
];

export const STUDENT_UNIVERSITY_TEMPLATE_FILENAME = "student_university_template.xlsx";

// Helper function to get student import config by institution type
export const getStudentImportConfig = (instType: string) => {
    if (instType === "university" || instType === "UNIVERSITY") {
        return {
            columns: STUDENT_UNIVERSITY_IMPORT_COLUMNS,
            filename: STUDENT_UNIVERSITY_TEMPLATE_FILENAME,
            label: "นักศึกษา"
        };
    }
    // Default to school
    return {
        columns: STUDENT_SCHOOL_IMPORT_COLUMNS,
        filename: STUDENT_SCHOOL_TEMPLATE_FILENAME,
        label: "นักเรียน"
    };
};

// subject import columns and template filename
export const SUBJECT_IMPORT_COLUMNS = [
    { header: "กลุ่มการเรียนรู้", key: "learning_area_name", width: 25 },
    { header: "รหัสวิชา", key: "subject_code", width: 15 },
    { header: "ชื่อวิชา (ภาษาไทย)", key: "name_th", width: 30 },
    { header: "ชื่อวิชา (ภาษาอังกฤษ)", key: "name_en", width: 30 },
    { header: "หน่วยกิต", key: "credit", width: 10 },
    { header: "ชั่วโมงต่อสัปดาห์", key: "hour_per_week", width: 15 }
];

export const SUBJECT_TEMPLATE_FILENAME = "subject_template.xlsx";

// program import columns for SCHOOL (โรงเรียน/มัธยม)
export const PROGRAM_SCHOOL_IMPORT_COLUMNS = [
    { header: "แผนการเรียน*", key: "program_name", width: 30 },
    { header: "ห้องเรียน", key: "classroom", width: 20 },
];

export const PROGRAM_SCHOOL_TEMPLATE_FILENAME = "program_school_template.xlsx";

// program import columns for UNIVERSITY (มหาวิทยาลัย)
export const PROGRAM_UNIVERSITY_IMPORT_COLUMNS = [
    { header: "คณะ*", key: "faculty", width: 30 },
    { header: "ภาควิชา", key: "department", width: 30 },
    { header: "สาขา", key: "major", width: 30 },
];

export const PROGRAM_UNIVERSITY_TEMPLATE_FILENAME = "program_university_template.xlsx";

// Helper function to get program import config by institution type
export const getProgramImportConfig = (instType: string) => {
    if (instType === "uni" || instType === "university" || instType === "UNIVERSITY") {
        return {
            columns: PROGRAM_UNIVERSITY_IMPORT_COLUMNS,
            filename: PROGRAM_UNIVERSITY_TEMPLATE_FILENAME,
            label: "หลักสูตร",
            unitLabels: {
                root: "คณะ",
                twig: "ภาควิชา",
                leaf: "สาขา"
            }
        };
    }
    // Default to school
    return {
        columns: PROGRAM_SCHOOL_IMPORT_COLUMNS,
        filename: PROGRAM_SCHOOL_TEMPLATE_FILENAME,
        label: "แผนการเรียน",
        unitLabels: {
            root: "แผนการเรียน",
            leaf: "ห้องเรียน"
        }
    };
};

// section import columns and template filename
export const SECTION_IMPORT_COLUMNS = [
    { header: "รหัสวิชา", key: "subject_code", width: 20 },
    { header: "กลุ่มเรียน", key: "section_name", width: 20 },
    { header: "วัน", key: "day", width: 15 },
    { header: "เวลาเริ่มเรียน", key: "startTime", width: 15 },
    { header: "เวลาสิ้นสุด", key: "endTime", width: 15 },
    { header: "ตึก", key: "building", width: 25 },
    { header: "ห้องเรียน", key: "room", width: 25 },
    { header: "รหัสผู้สอนหลัก", key: "main_teacher", width: 25 },
    { header: "รหัสผู้สอนรอง", key: "co_teacher", width: 25 },
    { header: "รหัสผู้ช่วยสอน", key: "ta", width: 25 }
];

export const SECTION_TEMPLATE_FILENAME = "section_template.xlsx";

// enrollment (student section) import columns and template filename
export const ENROLLMENT_IMPORT_COLUMNS = [
    { header: "รหัสนักเรียน", key: "student_code", width: 15 }
];

export const ENROLLMENT_TEMPLATE_FILENAME = "enrollment_template.xlsx";


