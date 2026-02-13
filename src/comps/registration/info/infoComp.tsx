import React, { useState, useEffect } from 'react'
import Breadcrumb from "@/comps/breadCrumb/breadCrumb";
import { StatCard, StatData, StatApiResponse, StatCardProps } from '@/comps/registration/shared/headerCard';
import { STAT_UI_CONFIG } from "@/config/statConfig";
import SemesterTable from '@/comps/registration/info/semester/semesterTable';
import BuildingComps from '@/comps/registration/info/location/buildingComps';
import StaffTable from '@/comps/registration/info/staff/staffTable';
import TableSection from '../shared/TableSection';
import { SummaryType } from "@/enums/registrationSummary";
import { getRegistrationSummary } from "@/utils/api/registrationSummary";
import { decodeRegistrationToken } from '@/utils/authToken';
import { Loader, Center } from '@mantine/core';


const infoComp = () => {
    const [statsFromApi, setStatsFromApi] = useState<StatApiResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const token = decodeRegistrationToken();
                if (!token || !token.institution?.inst_id) return;

                const result = await getRegistrationSummary({
                    type: SummaryType.INFO,
                    inst_id: token.institution.inst_id
                });

                if (result.success && result.data) {
                    const data = result.data;
                    const stats: StatApiResponse[] = [
                        { key: "academicYear", value: Number(data.academicYear) || 0, label: "ปีการศึกษา" },
                        { key: "building", value: Number(data.building) || 0, label: "อาคาร" },
                        { key: "classroom", value: Number(data.classroom) || 0, label: "ห้องเรียน" },
                        { key: "staff", value: Number(data.staff) || 0, label: "บุคลากร" },
                    ];

                    setStatsFromApi(stats);
                }
            } catch (error) {
                console.error("Failed to fetch info summary:", error);
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
                    { label: "ข้อมูลพื้นฐาน" },
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
                            <h2 className="text-2xl font-bold text-gray-800 mb-3">ข้อมูลพื้นฐาน</h2>

                            <div className={`grid gap-2 ${getGridCols(mappedStats.length)}`}>
                                {mappedStats.map((stat, index) => (
                                    <StatCard key={index} {...stat} />
                                ))}
                            </div>
                        </div>

                        <TableSection>
                            <StaffTable />
                        </TableSection>

                        <TableSection>
                            <SemesterTable />
                        </TableSection>

                        <TableSection>
                            <BuildingComps />
                        </TableSection>
                    </>
                )}
            </div>
        </div>
    )
}

export default infoComp
