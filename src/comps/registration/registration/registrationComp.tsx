import React from 'react'
import Breadcrumb from "@/comps/breadCrumb/breadCrumb";
import StudentTable from '@/comps/registration/registration/student/studentTable';
import TableSection from '../shared/TableSection';


const registrationComp = () => {

    return (
        <div className='info-comp pb-8'>
            <Breadcrumb
                items={[
                    { label: "งานทะเบียนนักเรียน" },
                ]}
            />
            <div className="w-full h-[95%] mt-4 text-black">
                <div className="header-section">
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">งานทะเบียนนักเรียน</h2>
                </div>

                <TableSection>
                    <StudentTable />
                </TableSection>
                
            </div>
        </div>
    )
}

export default registrationComp
