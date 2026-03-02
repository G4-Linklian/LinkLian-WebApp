import React, { useEffect, useState } from 'react'
import Breadcrumb from "@/comps/breadCrumb/breadCrumb";
import { StatCard, StatData, StatApiResponse, StatCardProps } from '@/comps/registration/shared/headerCard';
import { STAT_UI_CONFIG } from "@/config/statConfig";
import SectionTable from '@/comps/registration/schedule/section/sectionTable';
import { getSemester } from '@/utils/api/semester';
import { decodeRegistrationToken } from '@/utils/authToken';
import { useRouter } from "next/router";
import { Select, Loader, Center } from "@mantine/core";
import TableSection from '@/comps/registration/shared/TableSection';
import { SummaryType } from "@/enums/registrationSummary";
import { getRegistrationSummary } from "@/utils/api/registrationSummary";

const scheduleComp = () => {
    const router = useRouter();

    const [semesterOptions, setSemesterOptions] = useState<{ value: string; label: string; status: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [trigger, setTrigger] = useState(false);
    const [statsFromApi, setStatsFromApi] = useState<StatApiResponse[]>([]);
    const [statsLoading, setStatsLoading] = useState(false);

    const token = decodeRegistrationToken();
    const instId = token?.institution?.inst_id || "";

    useEffect(() => {

        const fetchSemesters = async () => {
            try {
                setLoading(true);
                const semesterData = await getSemester({
                    inst_id: instId,
                    sort_by: "start_date",
                    sort_order: "desc"
                });


                const formattedOptions = semesterData.data.map((sem: any) => ({
                    value: sem.semester_id,
                    label: sem.semester,
                    status: sem.status,
                }));

                setSemesterOptions(formattedOptions);

                if (!router.query.semester_id && formattedOptions.length > 0) {
                    handleSemesterChange(formattedOptions[0].value);
                    setTrigger(!trigger);
                }

            } catch (error) {
                console.error("Failed to fetch semesters", error);
            } finally {
                setLoading(false);
            }
        };

        if (router.isReady && instId) {
            fetchSemesters();
        }

    }, [instId, router.isReady, trigger]);

    useEffect(() => {
        const fetchSummary = async () => {
            if (!instId || !router.query.semester_id) return;

            try {
                setStatsLoading(true);
                const result = await getRegistrationSummary({
                    type: SummaryType.SCHEDULE,
                    inst_id: instId,
                    semester_id: parseInt(router.query.semester_id as string)
                });

                if (result.success && result.data) {
                    const data = result.data;
                    const stats: StatApiResponse[] = [
                        { key: "classroom", value: Number(data.classroom) || 0, label: "ห้องเรียน" },
                        { key: "sectionSchedule", value: Number(data.sectionSchedule) || 0, label: "กลุ่มเรียน" },
                    ];

                    setStatsFromApi(stats);
                }
            } catch (error) {
                console.error("Failed to fetch schedule summary:", error);
            } finally {
                setStatsLoading(false);
            }
        };

        fetchSummary();
    }, [instId, router.query.semester_id]);

    const handleSemesterChange = (value: string | null) => {
        if (value) {
            router.push({
                pathname: router.pathname,
                query: { ...router.query, semester_id: value },
            }, undefined, { shallow: true });
        }
    };


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

    useEffect(() => {
        if (!semesterOptions.length) return;

        const openSemester = semesterOptions.find(
            (s) => s.status === "open"
        );

        if (openSemester) {
            handleSemesterChange(openSemester.value);
        }
    }, [semesterOptions]);

    return (
        <div className='info-comp pb-8'>
            <Breadcrumb
                items={[
                    { label: "จัดการตารางสอน" },
                ]}
            />
            <div className="w-full h-[95%] mt-4 text-black">
                <div className="header-section">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-800 m-0">จัดการตารางสอน</h2>

                        <div className="w-32 flex items-center">
                            <Select
                                id="select-semester"
                                placeholder="เลือกปีการศึกษา"
                                data={semesterOptions}
                                value={router.query.semester_id as string || null}
                                onChange={handleSemesterChange}
                                radius={8}
                                width={100}
                                disabled={loading}
                                clearable={false}
                                styles={{
                                    input: {
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                    }
                                }}

                            />
                        </div>
                    </div>

                    {statsLoading ? (
                        <Center style={{ minHeight: '120px' }}>
                            <Loader size="md" />
                        </Center>
                    ) : (
                        <div className={`grid gap-2 ${getGridCols(mappedStats.length)}`}>
                            {mappedStats.map((stat, index) => (
                                <StatCard key={index} {...stat} />
                            ))}
                        </div>
                    )}
                </div>

                <TableSection>
                    <SectionTable semesterData={semesterOptions} />
                </TableSection>
            </div>
        </div>
    )
}

export default scheduleComp
