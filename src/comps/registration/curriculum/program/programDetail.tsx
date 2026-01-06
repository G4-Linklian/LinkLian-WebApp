import React from 'react'
import { useState } from 'react';
import Breadcrumb from "@/comps/breadCrumb/breadCrumb";
import LeafTable from '@/comps/registration/curriculum/program/programDetail/leafTable';
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
                    { label: `จัดการ${token.institution.inst_type === "school" ? "แผนการเรียน " : "สาขา"}` },
                ]}
            />
            <div className="w-full h-[95%] mt-4 text-black">
                <div className="header-section">
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">จัดการ{token.institution.inst_type === "school" ? "แผนการเรียน : " : "สาขา : "}{rootProgramName}</h2>


                    <TableSection>
                        <LeafTable onDataUpdate={setProgramData} onSetRootName={setRootProgramName} />
                    </TableSection>

                    <TableSection>
                        <EduLevelTable programData={programData} />
                    </TableSection>


                </div>
            </div>
        </div>
    )
}

export default ProgramDetail
