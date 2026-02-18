import { fetchDataApi } from "@/utils/callAPI"
import { importFields } from "@/utils/interface/import.types";

export const validateImportTeacherData = async (file: File, inst_id: number, inst_type: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("instId", inst_id.toString());
    formData.append("instType", inst_type);

    const data = await fetchDataApi(`POST`, "import-teacher/validate", formData);

    return data;
};

export const saveImportTeacherData = async (validationToken: string, file: File, inst_id: number, inst_type: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("instId", inst_id.toString());
    formData.append("instType", inst_type);
    formData.append("validationToken", validationToken);

    const data = await fetchDataApi(`POST`, "import-teacher/save", formData);

    return data;
};

export const validateImportStudentData = async (file: File, inst_id: number, inst_type: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("instId", inst_id.toString());
    formData.append("instType", inst_type);

    const data = await fetchDataApi(`POST`, "import-student/validate", formData);

    return data;
};

export const saveImportStudentData = async (validationToken: string, file: File, inst_id: number, inst_type: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("instId", inst_id.toString());
    formData.append("instType", inst_type);
    formData.append("validationToken", validationToken);

    const data = await fetchDataApi(`POST`, "import-student/save", formData);

    return data;
};

export const validateImportSubjectData = async (file: File, inst_id: number) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("instId", inst_id.toString());

    const data = await fetchDataApi(`POST`, "import-subject/validate", formData);

    return data;
};

export const saveImportSubjectData = async (validationToken: string, file: File, inst_id: number) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("instId", inst_id.toString());
    formData.append("validationToken", validationToken);

    const data = await fetchDataApi(`POST`, "import-subject/save", formData);

    return data;
};

export const validateImportProgramData = async (file: File, inst_id: number, inst_type: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("instId", inst_id.toString());
    formData.append("instType", inst_type);

    const data = await fetchDataApi(`POST`, "import-program/validate", formData);

    return data;
};

export const saveImportProgramData = async (validationToken: string, file: File, inst_id: number, inst_type: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("instId", inst_id.toString());
    formData.append("instType", inst_type);
    formData.append("validationToken", validationToken);

    const data = await fetchDataApi(`POST`, "import-program/save", formData);

    return data;
};

export const validateISectionData = async (file: File, inst_id: number, semester_id: number) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("instId", inst_id.toString());
    formData.append("semesterId", semester_id.toString());

    const data = await fetchDataApi(`POST`, "import-section-schedule/validate", formData);

    return data;
};

export const saveImportSectionData = async (validationToken: string, file: File, inst_id: number, semester_id: number) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("instId", inst_id.toString());
    formData.append("semesterId", semester_id.toString());
    formData.append("validationToken", validationToken);

    const data = await fetchDataApi(`POST`, "import-section-schedule/save", formData);

    return data;
};

export const validateImportEnrollmentData = async (file: File, inst_id: number, section_id: number) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("instId", inst_id.toString());
    formData.append("sectionId", section_id.toString());

    const data = await fetchDataApi(`POST`, "import-enrollment/validate", formData);

    return data;
};

export const saveImportEnrollmentData = async (validationToken: string, file: File, inst_id: number, section_id: number) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("instId", inst_id.toString());
    formData.append("sectionId", section_id.toString());
    formData.append("validationToken", validationToken);

    const data = await fetchDataApi(`POST`, "import-enrollment/save", formData);

    return data;
};