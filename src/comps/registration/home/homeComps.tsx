import React from 'react'
import Breadcrumb from "@/comps/breadCrumb/breadCrumb";
import DetailSection from './detail/detailSection';
import NotificationSection from './notification/notificationSection';
import ReportComp from './report/reportComp';


const HomeComp = () => {


    return (
        <div className="curriculum-comp pb-8">
            <Breadcrumb
                items={[
                    { label: "หน้าหลัก" },
                ]}
            />
            <div className="w-full h-[95%] mt-4 text-black">
                {/* Detail component */}
                <DetailSection />

                {/* Notification component */}
                <ReportComp />
            </div>
        </div>
    )
}

export default HomeComp
