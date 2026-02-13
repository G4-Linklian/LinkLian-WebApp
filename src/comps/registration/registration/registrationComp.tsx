import React, { useState, useEffect } from 'react'
import Breadcrumb from "@/comps/breadCrumb/breadCrumb";
import StudentTable from '@/comps/registration/registration/student/studentTable';
import TableSection from '../shared/TableSection';
import { StatCard, StatData, StatApiResponse, StatCardProps } from '@/comps/registration/shared/headerCard';
import { STAT_UI_CONFIG } from '@/config/statConfig';
import { SummaryType } from "@/enums/registrationSummary";
import { getRegistrationSummary } from "@/utils/api/registrationSummary";
import { decodeRegistrationToken } from '@/utils/authToken';
import { Loader, Center } from '@mantine/core';


const registrationComp = () => {
    const [statsFromApi, setStatsFromApi] = useState<StatApiResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const token = decodeRegistrationToken();
                if (!token || !token.institution?.inst_id) return;

                const result = await getRegistrationSummary({
                    type: SummaryType.REGISTRATION,
                    inst_id: token.institution.inst_id
                });

                if (result.success && result.data) {
                    const data = result.data;
                    const stats: StatApiResponse[] = [
                        { key: "allStudent", value: Number(data.allStudent) || 0, label: "นักเรียนในระบบ" },
                        { key: "activeStudent", value: Number(data.activeStudent) || 0, label: "กำลังศึกษา" },
                        { key: "graduatedStudent", value: Number(data.graduatedStudent) || 0, label: "สำเร็จการศึกษา" },
                    ];

                    setStatsFromApi(stats);
                }
            } catch (error) {
                console.error("Failed to fetch registration summary:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, []);


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
        <div className='info-comp pb-8'>
            <Breadcrumb
                items={[
                    { label: "งานทะเบียนนักเรียน" },
                ]}
            />


            <div className="w-full h-[95%] mt-4 text-black">
                {loading ? (
                    <Center style={{ minHeight: '400px' }}>
                        <Loader size="lg" />
                    </Center>
                ) : (
                    <>
                        <div className="header-section">
                            <h2 className="text-2xl font-bold text-gray-800 mb-3">งานทะเบียนนักเรียน</h2>
                            <div className={`grid gap-2 ${getGridCols(mappedStats.length)}`}>
                                {mappedStats.map((stat, index) => (
                                    <StatCard key={index} {...stat} />
                                ))}
                            </div>
                        </div>

                        <TableSection>
                            <StudentTable />
                        </TableSection>
                    </>
                )}
            </div>
        </div>
    )
}

export default registrationComp
