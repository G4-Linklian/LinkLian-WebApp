import { fetchDataApi } from "@/utils/callAPI";
import { fileFields } from "@/utils/interface/qna.types";

export const searchSectionFiles = async (input: fileFields) => {
	const {
		section_id,
	} = input;

	const data = await fetchDataApi("GET", `qa/live/section/${section_id}/files`, {});
	return data;
};
