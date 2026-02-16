import { fetchDataApi } from "@/utils/callAPI"
import { importFields } from "@/utils/interface/import.types";


export const validateImportData = async (file: File, inst_id: number, inst_type: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("inst_id", inst_id.toString());
    formData.append("inst_type", inst_type);

    const data = await fetchDataApi(`POST`, "import/validate", formData);

    return data;
};


export const saveImportData = async (file: File, inst_id: number, inst_type: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("inst_id", inst_id.toString());
    formData.append("inst_type", inst_type);

    const data = await fetchDataApi(`POST`, "import/save", formData);

    return data;
};