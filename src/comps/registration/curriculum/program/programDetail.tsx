import React from 'react'
import { useState } from 'react';
import Breadcrumb from "@/comps/breadCrumb/breadCrumb";
import TwigTable from '@/comps/registration/curriculum/program/programDetail/twigTable';
import EduLevelTable from '@/comps/registration/curriculum/program/programDetail/eduLevelTable';
import { decodeRegistrationToken } from '@/utils/authToken';
import TableSection from '../../shared/TableSection';


const ProgramDetail = () => {

    const [programData, setProgramData] = useState([]);
    const [rootProgramName, setRootProgramName] = useState<string>("");
    const token = decodeRegistrationToken();

    return (
        <div className='pb-8'>
            <Breadcrumb
                items={[
                    { label: "งานหลักสูตร", href: "/registration/curriculum" },
                    { label: `จัดการภาค` },
                ]}
            />
            <div className="w-full h-[95%] mt-4 text-black">
                <div className="header-section">
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">จัดการภาควิชา</h2>


                    <TableSection>
                        <TwigTable />
                    </TableSection>


                </div>
            </div>
        </div>
    )
}

export default ProgramDetail
