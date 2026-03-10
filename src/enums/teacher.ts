export enum TeacherPosition {
  MAIN_TEACHER = "main_teacher",
  SECOND_TEACHER = "co_teacher",
  TA = "TA"
}

export const TeacherPositionLabel: Record<TeacherPosition, string> = {
  [TeacherPosition.MAIN_TEACHER]: "ผู้สอนหลัก",
  [TeacherPosition.SECOND_TEACHER]: "ผู้สอนรอง",
  [TeacherPosition.TA]: "ผู้ช่วยสอน (TA)"
};

export const teacherPositionOptions = [
  { value: TeacherPosition.MAIN_TEACHER, label: TeacherPositionLabel[TeacherPosition.MAIN_TEACHER] },
  { value: TeacherPosition.SECOND_TEACHER, label: TeacherPositionLabel[TeacherPosition.SECOND_TEACHER] },
  { value: TeacherPosition.TA, label: TeacherPositionLabel[TeacherPosition.TA] }
];
