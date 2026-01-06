import React from 'react'
import Breadcrumb from "@/comps/breadCrumb/breadCrumb";
import { StatCard, StatData, StatApiResponse, StatCardProps } from '@/comps/registration/shared/headerCard';
import { STAT_UI_CONFIG } from "@/config/statConfig";
import LearningAreaTable from '@/comps/registration/curriculum/learningArea/learningAreaTable';
import SubjectTable from '@/comps/registration/curriculum/subject/subjectTable';
import ProgramTable from '@/comps/registration/curriculum/program/programTable';
import TableSection from '../shared/TableSection';


const curriculumComp = () => {

    // mock จาก API
    const statsFromApi: StatApiResponse[] = [
        { key: "subject", value: 54, label: "รายวิชาทั้งหมด" },
        { key: "learningArea", value: 8, label: "กลุ่มสาระ" },
        { key: "curriculum", value: 12, label: "แผนการเรียน" },
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
        <div className="curriculum-comp pb-8">
            <Breadcrumb
                items={[
                    { label: "งานหลักสูตร" },
                ]}
            />
            <div className="w-full h-[95%] mt-4 text-black">
                <div className="header-section">
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">งานหลักสูตร</h2>

                    <div className={`grid gap-2 ${getGridCols(mappedStats.length)}`}>
                        {mappedStats.map((stat, index) => (
                            <StatCard key={index} {...stat} />
                        ))}
                    </div>
                </div>

                <TableSection>
                    <LearningAreaTable />
                </TableSection>

                <TableSection>
                    <SubjectTable />
                </TableSection>

                <TableSection>
                    <ProgramTable />
                </TableSection>
            </div>
        </div>
    )
}

export default curriculumComp
