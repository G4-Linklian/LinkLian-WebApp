export enum ReporterRoleName {
	ADMIN = 'admin',
	TEACHER = 'teacher',
	INSTRUCTOR = 'instructor',
	HIGH_SCHOOL_STUDENT = 'high school student',
	UNI_STUDENT = 'uni student',
}

const ROLE_NAME_TH_MAP: Record<ReporterRoleName, string> = {
	[ReporterRoleName.ADMIN]: 'ผู้ดูแลระบบ',
	[ReporterRoleName.TEACHER]: 'ครู',
	[ReporterRoleName.INSTRUCTOR]: 'อาจารย์ผู้สอน',
	[ReporterRoleName.HIGH_SCHOOL_STUDENT]: 'นักเรียน',
	[ReporterRoleName.UNI_STUDENT]: 'นักศึกษา',
};

const normalizeRoleName = (value?: string): string => {
	if (!value) return '';
	return value
		.trim()
		.toLowerCase()
		.replace(/[_-]+/g, ' ')
		.replace(/\s+/g, ' ');
};

export const getReporterRoleNameTH = (roleName?: string): string => {
	const normalized = normalizeRoleName(roleName) as ReporterRoleName;
	return ROLE_NAME_TH_MAP[normalized] || roleName || '-';
};

export const reporterRoleOptions = [
	{ value: ReporterRoleName.ADMIN, label: ROLE_NAME_TH_MAP[ReporterRoleName.ADMIN] },
	{ value: ReporterRoleName.TEACHER, label: ROLE_NAME_TH_MAP[ReporterRoleName.TEACHER] },
	{ value: ReporterRoleName.INSTRUCTOR, label: ROLE_NAME_TH_MAP[ReporterRoleName.INSTRUCTOR] },
	{ value: ReporterRoleName.HIGH_SCHOOL_STUDENT, label: ROLE_NAME_TH_MAP[ReporterRoleName.HIGH_SCHOOL_STUDENT] },
	{ value: ReporterRoleName.UNI_STUDENT, label: ROLE_NAME_TH_MAP[ReporterRoleName.UNI_STUDENT] },
];
