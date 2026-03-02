import React from 'react'
import { Select } from "@mantine/core";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Breadcrumb from "@/comps/breadCrumb/breadCrumb";
import RoomTable from '@/comps/registration/info/location/buildingDetail/roomTable';
import { updateBuilding } from '@/utils/api/building';
import { buildingFields } from '@/utils/interface/building.types';
import TableSection from '../../shared/TableSection';


const BuildingDetail = () => {

    const router = useRouter();

    return (
        <div className='pb-8' id="building-detail-page">
            <Breadcrumb
                items={[
                    { label: "ข้อมูลพื้นฐาน", href: "/registration/info" },
                    { label: "จัดการอาคารเรียน" },
                ]}
            />
            <div className="w-full h-[95%] mt-4 text-black">
                <div className="header-section flex justify-between items-end">
                    <h2 className="text-2xl font-bold text-gray-800">จัดการอาคารเรียน</h2>

                </div>
        
                <TableSection>
                    <RoomTable />
                </TableSection>

            </div>
        </div>
    )
}

export default BuildingDetail
