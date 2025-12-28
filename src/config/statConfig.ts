// config/statConfig.ts
import {
  IconCalendar,
  IconFileText,
  IconCopy,
  IconUsers,
} from "@tabler/icons-react";

export const STAT_UI_CONFIG = {
  academicYear: {
    icon: IconCalendar,
    bgColor: "bg-blue-50",
    iconColor: "bg-blue-100 text-blue-600",
    borderColor: "border-blue-200",
  },
  subject: {
    icon: IconFileText,
    bgColor: "bg-amber-50",
    iconColor: "bg-amber-100 text-amber-600",
    borderColor: "border-amber-200",
  },
  classroom: {
    icon: IconCopy,
    bgColor: "bg-cyan-50",
    iconColor: "bg-cyan-100 text-cyan-600",
    borderColor: "border-cyan-200",
  },
  staff: {
    icon: IconUsers,
    bgColor: "bg-lime-50",
    iconColor: "bg-lime-100 text-lime-600",
    borderColor: "border-lime-200",
  },
} as const;
