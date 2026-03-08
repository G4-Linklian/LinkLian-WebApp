import React, { useEffect } from 'react'
import { useState } from 'react';
import Breadcrumb from "@/comps/breadCrumb/breadCrumb";
import {
    Table,
    ScrollArea,
    Text,
    Loader,
    Center
} from '@mantine/core';
import { decodeRegistrationToken } from '@/utils/authToken';
import CourseSectionHeader from '@/comps/registration/schedule/section/sectionDetail/CourseSectionHeader';
import { sectionFields } from '@/utils/interface/section.types';
import { useRouter } from "next/router";
import { getSchedule, getSectionMaster } from '@/utils/api/section';
import { getSemester } from '@/utils/api/semester';
import TeacherComps from '@/comps/registration/schedule/section/sectionDetail/TeacherComps';
import StudentTable from '@/comps/registration/schedule/section/sectionDetail/StudentTable';
import TableSection from '@/comps/registration/shared/TableSection';


const SectionDetail = () => {
    const token = decodeRegistrationToken();

    const [sectionData, setSectionData] = useState<sectionFields[]>([]);
    const [scheduleData, setScheduleData] = useState<sectionFields[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const router = useRouter();
    const [instId, setInstId] = useState<number | null>(null);
    const [offset, setOffset] = useState<number>(0);
    const [semesterOptions, setSemesterOptions] = useState<{ value: string; label: string }[]>([]);
    const [sectionId, setSectionId] = useState<number | null>(null);

    useEffect(() => {
        const token = decodeRegistrationToken();
        if (token && token.institution && token.institution.inst_id) {
            setInstId(token.institution.inst_id);
        }

        if (router.query.section_id) {
            setSectionId(Number(router.query.section_id));
        }
    }, [router.isReady]);

    const fetchData = async (offset: number, reset = false) => {
        setLoading(true);

        const sectionId = router.query.section_id;

        if (sectionId) {
            const sectionData = await getSectionMaster({
                section_id: Number(sectionId),
                // sort_by: "section_id",
                // sort_order: "asc",
            });

            const scheduleData = await getSchedule({
                section_id: Number(sectionId),
                // sort_by: "schedule_id",
                // sort_order: "asc",
            });

            setSectionData((prev) =>
                reset ? sectionData.data : [...prev, ...sectionData.data]
            );

            setScheduleData(scheduleData.data);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchData(0);
    }, [router.isReady, router.query.section_id]);

    useEffect(() => {

        const fetchSemesters = async () => {
            try {
                setLoading(true);
                const semesterData = await getSemester({
                    inst_id: Number(instId),
                    sort_by: "start_date",
                    sort_order: "desc"
                });

                const formattedOptions = semesterData.data.map((sem: any) => ({
                    value: sem.semester_id,
                    label: sem.semester
                }));

                setSemesterOptions(formattedOptions);


            } catch (error) {
                console.error("Failed to fetch semesters", error);
            } finally {
                setLoading(false);
            }
        };

        if (router.isReady && instId) {
            fetchSemesters();
        }

    }, [instId, router.isReady]);

    return (
        <>
            {(loading && sectionData.length === 0) ? (
                <Center style={{ height: '100vh' }}>
                    <Loader />
                </Center>
            ) : (
                <div className='pb-8'>
                    <Breadcrumb
                        items={[
                            { label: "งานจัดตาราง", href: "/registration/scheduling" },
                            //   { label: "ปีการศึกษา" },
                            { label: `จัดการกลุ่มเรียน` },
                        ]}
                    />
                    <div className="w-full h-[95%] mt-4 text-black">
                        <div className="header-section">
                            <h2 className="text-2xl font-bold text-gray-800 mb-1">จัดการกลุ่มการเรียน</h2>

                            <CourseSectionHeader 
                                sectionData={sectionData} 
                                scheduleData={scheduleData} 
                                token={token} 
                                semesterOptions={semesterOptions} 
                                sectionId={sectionId}
                                onFetch={(reset = false) => {
                                    fetchData(0, reset);
                                }}
                            />

                            <TableSection>
                                <TeacherComps />
                            </TableSection>
                            <TableSection>
                                <StudentTable />
                            </TableSection>

                        </div>
                    </div>
                </div>
            )}
        </>
    )

}

export default SectionDetail
