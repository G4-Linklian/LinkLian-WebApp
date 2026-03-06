import { fetchDataApi } from "@/utils/callAPI"

export const uploadFileStorage = async (file: File, containerName: string, folderName: string) => {
    const formData = new FormData();
    formData.append('files', file); 

    const response = await fetchDataApi(
        'POST', 
        `file-storage/upload/${containerName}/${folderName}`, 
        formData
    );
    
    return response;
};