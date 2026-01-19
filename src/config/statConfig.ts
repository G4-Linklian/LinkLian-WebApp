// config/statConfig.ts
import {
  IconCalendarWeek,
  IconFileText,
  IconCopy,
  IconUsers,
  IconBook,
  IconLibrary,
  IconNotebook,
  IconBuildingCog,
  IconChalkboardTeacher,
  IconChalkboardOff,
  IconChalkboard,
  IconClockCheck,
  IconClockCancel,
  IconCashEdit
} from "@tabler/icons-react";

// export const STAT_UI_CONFIG = {
//   academicYear: {
//     icon: IconCalendar,
//     bgColor: "bg-white",
//     iconColor: "bg-blue-50 text-blue-400",
//     borderColor: "border-blue-100",
//   },
//   subject: {
//     icon: IconFileText,
//     bgColor: "bg-white",
//     iconColor: "bg-blue-50 text-blue-400",
//     borderColor: "border-blue-100",
//   },
//   classroom: {
//     icon: IconCopy,
//     bgColor: "bg-white",
//     iconColor: "bg-blue-50 text-blue-400",
//     borderColor: "border-blue-100",
//   },
//   staff: {
//     icon: IconUsers,
//     bgColor: "bg-white",
//     iconColor: "bg-blue-50 text-blue-400",
//     borderColor: "border-blue-100",
//   },
//   learningArea: {
//     icon: IconFileText,
//     bgColor: "bg-white",
//     iconColor: "bg-blue-50 text-blue-400",
//     borderColor: "border-blue-100",
//   },
//   curriculum: {
//     icon: IconCopy,
//     bgColor: "bg-white",
//     iconColor: "bg-blue-50 text-blue-400",
//     borderColor: "border-blue-100",
//   },
// } as const;

export const STAT_UI_CONFIG = {
  academicYear: {
    icon: IconCalendarWeek,
    bgColor: "bg-white",
    iconColor: "bg-[#FFF7EE] text-[#FF9C57]",
    borderColor: "border-[#FFE3BB]",
  },
  subject: {
    icon: IconBook,
    bgColor: "bg-white",
    iconColor: "bg-[#FFF7EE] text-[#FF9C57]",
    borderColor: "border-[#FFE3BB]",
  },
  building: {
    icon: IconBuildingCog,
    bgColor: "bg-white",
    iconColor: "bg-[#FFF7EE] text-[#FF9C57]",
    borderColor: "border-[#FFE3BB]",
  },
  classroom: {
    icon: IconChalkboardTeacher,
    bgColor: "bg-white",
    iconColor: "bg-[#FFF7EE] text-[#FF9C57]",
    borderColor: "border-[#FFE3BB]",
  },
  staff: {
    icon: IconUsers,
    bgColor: "bg-white",
    iconColor: "bg-[#FFF7EE] text-[#FF9C57]",
    borderColor: "border-[#FFE3BB]",
  },
  learningArea: {
    icon: IconLibrary,
    bgColor: "bg-white",
    iconColor: "bg-[#FFF7EE] text-[#FF9C57]",
    borderColor: "border-[#FFE3BB]",
  },
  curriculum: {
    icon: IconNotebook,
    bgColor: "bg-white",
    iconColor: "bg-[#FFF7EE] text-[#FF9C57]",
    borderColor: "border-[#FFE3BB]",
  },
  classroomOff: {
    icon: IconChalkboardOff,
    bgColor: "bg-white",
    iconColor: "bg-[#FFF7EE] text-[#FF9C57]",
    borderColor: "border-[#FFE3BB]",
  },
  classroomOn: {
    icon: IconChalkboard,
    bgColor: "bg-white",
    iconColor: "bg-[#FFF7EE] text-[#FF9C57]",
    borderColor: "border-[#FFE3BB]",
  },
  clockCheck: {
    icon: IconClockCheck,
    bgColor: "bg-white",
    iconColor: "bg-[#FFF7EE] text-[#FF9C57]",
    borderColor: "border-[#FFE3BB]",
  },
  clockX : {
    icon: IconClockCancel,
    bgColor: "bg-white",
    iconColor: "bg-[#FFF7EE] text-[#FF9C57]",
    borderColor: "border-[#FFE3BB]",
  },
  sectionEdit: {
    icon: IconCashEdit,
    bgColor: "bg-white",
    iconColor: "bg-[#FFF7EE] text-[#FF9C57]",
    borderColor: "border-[#FFE3BB]",
  },
} as const;