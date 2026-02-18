import React from 'react'
import { useState } from 'react';
import Breadcrumb from "@/comps/breadCrumb/breadCrumb";
import LeafTable from '@/comps/registration/curriculum/program/programDetail/leafTable';
import EduLevelTable from '@/comps/registration/curriculum/program/programDetail/eduLevelTable';
import { decodeRegistrationToken } from '@/utils/authToken';
import TableSection from '../../shared/TableSection';
import { useRouter } from "next/router";
import { BreadcrumbItem } from '@/utils/interface/breadcrumb.types';

const ProgramLeafDetail = () => {

    const [programData, setProgramData] = useState([]);
    const [rootProgramName, setRootProgramName] = useState<string>("");
    const token = decodeRegistrationToken();
    const router = useRouter();

    const { root_id, twig_id } = router.query;

    return (
        <>
            {router.isReady && (
                <div className='pb-8'>
                    <Breadcrumb
                        items={[
                            { label: "งานหลักสูตร", href: "/registration/curriculum" },
                            twig_id && {
                                label: "จัดการภาควิชา",
                                href: `/registration/curriculum/twig?root_id=${root_id}`,
                            },
                            {
                                label: `จัดการ${token.institution.inst_type === "school" ? "แผนการเรียน" : "สาขา"
                                    }`,
                            },
                        ].filter(Boolean) as BreadcrumbItem[]}
                    />

                    <div className="w-full h-[95%] mt-4 text-black">
                        <div className="header-section">
                            <h2 className="text-2xl font-bold text-gray-800 mb-1">จัดการ{token.institution.inst_type === "school" ? "แผนการเรียน" : "สาขา"}</h2>


                            <TableSection>
                                <LeafTable onDataUpdate={setProgramData} onSetRootName={setRootProgramName} />
                            </TableSection>

                            {/* <TableSection>
                                <EduLevelTable programData={programData} />
                            </TableSection> */}


                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default ProgramLeafDetail
