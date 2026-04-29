import { fetchDataApi } from "@/utils/callAPI";
import { 
    fileFields,
    QnaLiveFields,
    QnaLiveLogFields,
    SearchQnaLiveLogFields,
    UpdateQnaLiveFields,
	QnaQuestionFields,
	SearchQnaQuestionFields,
	UpdateQnaQuestionFields,
    UpvoteFields,
} from "@/utils/interface/qna.types";

export const searchSectionFiles = async (input: fileFields) => {
	const {
		section_id,
        title,
        original_name,
        flag_valid,
	} = input;

	const data = await fetchDataApi("GET", `qa/live/section/${section_id}/files`, {
		title,
		original_name,
        flag_valid,
	});
	
	return data;
}

export const searchLive = async (input: QnaLiveFields) => {
    const {
        section_id, 
        live_by,
        status,
        live_title,
        flag_valid,
    } = input;

    const data = await fetchDataApi("GET", "qa/live", {
        section_id, 
        live_by,
        status,
        live_title,
        flag_valid,
    });

    return data;
}

export const createLive = async (input: QnaLiveFields) => {
	const {
		section_id,
		post_id,
		attachment_id,
		live_title,
		live_by,
	} = input;

	const data = await fetchDataApi("POST", `qa/live`, {
		section_id,
		post_id,
		attachment_id,
		live_title,
		live_by,
	});
	
	return data;
}

export const getLiveById = async (qa_live_id: number) => {
    const data = await fetchDataApi("GET", `qa/live/${qa_live_id}`);
    return data;
}

export const getActiveLiveBySection = async (section_id: number) => {
    const data = await fetchDataApi("GET", `qa/live/section/${section_id}/active-live`);
    return data;
}

export const updateLive = async (qa_live_id: number, input: UpdateQnaLiveFields) => {
    const {
        status,
        live_by,
    } = input;

    const data = await fetchDataApi("PUT", `qa/live/${qa_live_id}`, {
        status,
        live_by,
    });
    
    return data;
}

export const createLiveLog = async (input: QnaLiveLogFields) => {
    const {
        qa_live_id,
        post_id,
        attachment_id,
    } = input;

    const data = await fetchDataApi("POST", `qa/live/log`, {
        qa_live_id,
        post_id,
        attachment_id,
    });

    return data;
}

export const searchLiveLog = async (input: SearchQnaLiveLogFields) => {
    const {
        qa_live_id,
        post_id,
        attachment_id,
        flag_valid,
        opened_at,
        closed_at,
    } = input;

    const data = await fetchDataApi("GET", "qa/live/log", {
        qa_live_id,
        post_id,
        attachment_id,
        flag_valid,
        opened_at,
        closed_at,
    });
    return data;
}

export const getLiveLogById = async (log_id: number) => {
    const data = await fetchDataApi("GET", `qa/live/log/${log_id}`);
    return data;
}

export const getCurrentLog = async (qa_live_id: number) => {
    const data = await fetchDataApi("GET", `qa/live/${qa_live_id}/current-log`);
    return data;
}

export const createQuestion = async (input: QnaQuestionFields) => {
    const {
        qa_live_id,
        asker_id,
        question,
        post_id,
        attachment_id,
        file_name,
        slide_number,
        is_anonymous,
	} = input;
	
    const data = await fetchDataApi("POST", `qa/question`, {
        qa_live_id,
        asker_id,
        question,
        post_id,
        attachment_id,
        file_name,
        slide_number,
        is_anonymous,
    });

    return data;
}

export const searchQuestion = async (input: SearchQnaQuestionFields) => {
    const {
        qa_question_id,
        qa_live_id,
        asker_id,
        post_id,
        attachment_id,
        slide_number,
        status,
        is_anonymous,
        flag_valid,
    } = input;

    const data = await fetchDataApi("GET", "qa/question", {
        qa_question_id,
        qa_live_id,
        asker_id,
        post_id,
        attachment_id,
        slide_number,
        status,
        is_anonymous,
        flag_valid,
    });
    return data;
}

export const getQuestionById = async (qa_question_id: number) => {
    const data = await fetchDataApi("GET", `qa/question/${qa_question_id}`);
    return data;
}

export const updateQuestion = async (qa_question_id: number, input: UpdateQnaQuestionFields) => {
    const {
        status,
        question,
        flag_valid,
        upvote_count,
    } = input;

    const data = await fetchDataApi("PUT", `qa/question/${qa_question_id}`, {
        status,
        question,
        flag_valid,
        upvote_count,
    });
	
    return data;
}

export const searchUpvote = async (input: UpvoteFields) => {
    const {
        qa_question_id,
        voter_id,
    } = input;

    const data = await fetchDataApi(`GET`, "qa/upvote", {
        qa_question_id,
        voter_id,
    });

    return data;
}

export const createUpvote = async (input: UpvoteFields) => {
    const {
        qa_question_id,
        voter_id,
    } = input;

    const data = await fetchDataApi(`POST`, "qa/upvote", {
        qa_question_id,
        voter_id,
    });

    return data;
}

export const deleteUpvote = async (input: UpvoteFields) => {
    const {
        qa_question_id,
        voter_id,
    } = input;

    const data = await fetchDataApi(`DELETE`, "qa/upvote", {
        qa_question_id,
        voter_id,
    });

    return data;
}