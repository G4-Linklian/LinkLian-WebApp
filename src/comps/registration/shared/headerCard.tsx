import { IconProps } from "@tabler/icons-react";

export interface StatCardProps {
    icon: React.ComponentType<IconProps>;
    value: number;
    label: string;
    bgColor: string;
    iconColor: string;
    borderColor: string;
}

export interface StatData {
    icon: React.ReactNode;
    value: number;
    label: string;
    bgColor: string;
    iconColor: string;
    borderColor: string;
}

export interface StatApiResponse {
    key: "academicYear" | "subject" | "classroom" | "staff";
    value: number;
    label: string;
}

function StatCard({
    icon: Icon,
    value,
    label,
    bgColor,
    iconColor,
    borderColor,
}: StatCardProps & { icon: React.ElementType }) {
    return (
        <div
            className={`
            flex items-center justify-between gap-2 sm:gap-3
            px-6 sm:px-3 py-6 sm:py-3
            rounded-lg border-2
            ${borderColor} ${bgColor}
            w-full min-w-0
          `}
        >
            {/* Icon */}
            <div
                className={`
                flex items-center justify-center
                w-12 h-12 sm:w-10 sm:h-10
                rounded-lg flex-shrink-0
                ${iconColor}
            `}
            >
                <Icon className="w-5 h-5 sm:w-2 sm:h-6 lg:w-7 lg:h-7" stroke={2} />
            </div>

            {/* Content */}
            <span className="text-xl sm:text-2xl font-semibold text-gray-800 truncate">
                {value}
            </span>
            <span className="text-sm sm:text-base text-gray-600 truncate">
                {label}
            </span>
            {/* <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0">
                <span className="text-xl sm:text-2xl font-semibold text-gray-800 truncate">
                    {value}
                </span>
                <span className="text-sm sm:text-base text-gray-600 truncate">
                    {label}
                </span>
            </div> */}
        </div>
    );
}



export { StatCard };