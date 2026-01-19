import React from 'react'
import Breadcrumb from "@/comps/breadCrumb/breadCrumb";


const SemesterDetail = () => {


    return (
        <>
            <Breadcrumb
                items={[
                    { label: "ข้อมูลพื้นฐาน", href: "/registration/info" },
                    { label: "จัดการปีการศึกษา" },
                ]}
            />
            <div className="w-full h-[95%] mt-4 text-black">
                <div className="header-section">
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">จัดการปีการศึกษา</h2>


                </div>
            </div>
        </>
    )
}

export default SemesterDetail
