export enum TeacherStatus {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
  RESIGNED = "Resigned",
  RETIRED = "Retired"
}

export const TeacherStatusLabel: Record<TeacherStatus, string> = {
  [TeacherStatus.ACTIVE]: "ใช้งาน",
  [TeacherStatus.INACTIVE]: "ไม่ใช้งาน",
  [TeacherStatus.RESIGNED]: "ลาออก",
  [TeacherStatus.RETIRED]: "เกษียณ"
};

export const teacherStatusOptions = [
  { value: TeacherStatus.ACTIVE, label: TeacherStatusLabel[TeacherStatus.ACTIVE] },
  { value: TeacherStatus.INACTIVE, label: TeacherStatusLabel[TeacherStatus.INACTIVE] },
  { value: TeacherStatus.RESIGNED, label: TeacherStatusLabel[TeacherStatus.RESIGNED] },
  { value: TeacherStatus.RETIRED, label: TeacherStatusLabel[TeacherStatus.RETIRED] }
];


export enum StudentStatus {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
  RESIGNED = "Resigned",
  GRADUATED = "Graduated"
}

export const StudentStatusLabel: Record<StudentStatus, string> = {
  [StudentStatus.ACTIVE]: "ใช้งาน",
  [StudentStatus.INACTIVE]: "ไม่ใช้งาน",
  [StudentStatus.RESIGNED]: "ลาออก",
  [StudentStatus.GRADUATED]: "สำเร็จการศึกษา"
};

export const studentStatusOptions = [
  { value: StudentStatus.ACTIVE, label: StudentStatusLabel[StudentStatus.ACTIVE] },
  { value: StudentStatus.INACTIVE, label: StudentStatusLabel[StudentStatus.INACTIVE] },
  { value: StudentStatus.RESIGNED, label: StudentStatusLabel[StudentStatus.RESIGNED] },
  { value: StudentStatus.GRADUATED, label: StudentStatusLabel[StudentStatus.GRADUATED] }
];
