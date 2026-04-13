import { fetchDataApi } from "@/utils/callAPI"
import { reportAdminFields, reportInstFields } from "@/utils/interface/report.types"

// GET /report/admin - ค้นหารายงานของผู้ดูแล
export const getAdminReport = async (input: reportAdminFields) => {
	const {
		admin_report_id,
		inst_id,
		reporter_role_name,
		reporter_first_name,
		reporter_last_name,
		keyword,
		title,
		detail,
		flag_valid,
		report_date,
		mark_resolved,
		offset,
		limit,
	} = input;

	const data = await fetchDataApi(`GET`, "report/admin", {
		admin_report_id,
		inst_id,
		reporter_role_name,
		reporter_first_name,
		reporter_last_name,
		keyword,
		title,
		detail,
		flag_valid,
		report_date,
		mark_resolved,
		offset,
		limit,
	});

	return data;
};

// POST /report/admin - สร้างรายงานของผู้ดูแล
export const createAdminReport = async (input: reportAdminFields) => {
	const {
		inst_id,
		title,
		detail,
		report_file,
		flag_valid,
		report_date,
		mark_resolved,
	} = input;

	const data = await fetchDataApi(`POST`, "report/admin", {
		inst_id,
		title,
		detail,
		report_file,
		flag_valid,
		report_date,
		mark_resolved,
	});

	return data;
};

// GET /report/admin/:id - ดึงรายงานของผู้ดูแลตาม ID
export const getAdminReportById = async (id: number) => {
	const data = await fetchDataApi(`GET`, `report/admin/${id}`, {});
	return data;
};

// PUT /report/admin/:id - อัปเดตรายงานของผู้ดูแล
export const updateAdminReport = async (input: reportAdminFields) => {
	const {
		admin_report_id,
		inst_id,
		title,
		detail,
		report_file,
		flag_valid,
		report_date,
		mark_resolved,
	} = input;

	const data = await fetchDataApi(`PUT`, `report/admin/${admin_report_id}`, {
		inst_id,
		title,
		detail,
		report_file,
		flag_valid,
		report_date,
		mark_resolved,
	});

	return data;
};

// DELETE /report/admin/:id - ลบรายงานของผู้ดูแล
export const deleteAdminReport = async (id: number) => {
	const data = await fetchDataApi(`DELETE`, `report/admin/${id}`, {});
	return data;
};

// GET /report/institution - ค้นหารายงานของสถาบัน
export const getInstitutionReport = async (input: reportInstFields) => {
	const {
		inst_report_id,
		inst_id,
		reporter_id,
		reporter_role_name,
		reporter_first_name,
		reporter_last_name,
		keyword,
		title,
		detail,
		flag_valid,
		report_date,
		mark_resolved,
		offset,
		limit,
	} = input;

	const data = await fetchDataApi(`GET`, "report/institution", {
		inst_report_id,
		inst_id,
		reporter_id,
		reporter_role_name,
		reporter_first_name,
		reporter_last_name,
		keyword,
		title,
		detail,
		flag_valid,
		report_date,
		mark_resolved,
		offset,
		limit,
	});

	return data;
};

// POST /report/institution - สร้างรายงานของสถาบัน
export const createInstitutionReport = async (input: reportInstFields) => {
	const {
		inst_id,
		reporter_id,
		title,
		detail,
		report_file,
		flag_valid,
		report_date,
		mark_resolved,
	} = input;

	const data = await fetchDataApi(`POST`, "report/institution", {
		inst_id,
		reporter_id,
		title,
		detail,
		report_file,
		flag_valid,
		report_date,
		mark_resolved,
	});

	return data;
};

// GET /report/institution/:id - ดึงรายงานของสถาบันตาม ID
export const getInstitutionReportById = async (id: number) => {
	const data = await fetchDataApi(`GET`, `report/institution/${id}`, {});
	return data;
};

// PUT /report/institution/:id - อัปเดตรายงานของสถาบัน
export const updateInstitutionReport = async (input: reportInstFields) => {
	const {
		inst_report_id,
		inst_id,
		reporter_id,
		title,
		detail,
		report_file,
		flag_valid,
		report_date,
		mark_resolved,
	} = input;

	const data = await fetchDataApi(`PUT`, `report/institution/${inst_report_id}`, {
		inst_id,
		reporter_id,
		title,
		detail,
		report_file,
		flag_valid,
		report_date,
		mark_resolved,
	});

	return data;
};

// DELETE /report/institution/:id - ลบรายงานของสถาบัน
export const deleteInstitutionReport = async (id: number) => {
	const data = await fetchDataApi(`DELETE`, `report/institution/${id}`, {});
	return data;
};
