import React from 'react'
import Breadcrumb from "@/comps/breadCrumb/breadCrumb";
import {
    IconCalendar,
    IconFileText,
    IconCopy,
    IconUsers
} from '@tabler/icons-react';
import { StatCard, StatData, StatApiResponse, StatCardProps } from '@/comps/registration/shared/headerCard';
import { STAT_UI_CONFIG } from "@/config/statConfig";


const infoComp = () => {

    // mock จาก API
    const statsFromApi: StatApiResponse[] = [
        { key: "academicYear", value: 4, label: "ปีการศึกษา" },
        { key: "subject", value: 3, label: "วิชา" },
        { key: "classroom", value: 95, label: "ห้องเรียน" },
        { key: "staff", value: 68, label: "บุคลากร" },
    ];


    const getGridCols = (length: number) => {
        if (length === 1) return "grid-cols-1";
        if (length === 2) return "grid-cols-1 md:grid-cols-2";
        if (length === 3) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
        if (length === 4) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
        if (length === 5) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5";
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
    };

    const mappedStats: StatCardProps[] = statsFromApi.map((item) => {
        const ui = STAT_UI_CONFIG[item.key];

        return {
            icon: ui.icon,
            value: item.value,
            label: item.label,
            bgColor: ui.bgColor,
            iconColor: ui.iconColor,
            borderColor: ui.borderColor,
        };
    });

    return (
        <>
            <Breadcrumb
                items={[
                    //   { label: "ข้อมูลพื้นฐาน", href: "/basic" },
                    //   { label: "ปีการศึกษา" },
                    { label: "ข้อมูลพื้นฐาน" },
                ]}
            />
            <div className="w-full h-[95%] mt-4 text-black">
                <div className="header-section">
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">ข้อมูลพื้นฐาน</h2>

                    <div className={`grid gap-2 ${getGridCols(mappedStats.length)}`}>
                        {mappedStats.map((stat, index) => (
                            <StatCard key={index} {...stat} />
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}

export default infoComp
