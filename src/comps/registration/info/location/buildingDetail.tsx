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
    const [roomFormat, setRoomFormat] = useState<string | null>(null);

    useEffect(() => {
        if (router.isReady && router.query.room_format) {
            setRoomFormat(String(router.query.room_format));
        } else if (router.isReady && !router.query.room_format) {
            setRoomFormat("by_building_no");
        }
    }, [router.isReady, router.query.room_format]);

    const handleFormatChange = async (value: string | null) => {
        if (!value) return;

        setRoomFormat(value);

        try {
            const payload: buildingFields = {
                building_id: Number(router.query.building_id),
                room_format: value,
            };

            const res = await updateBuilding(payload);

            if (res.success) {

                router.replace(
                    {
                        pathname: router.pathname,
                        query: { ...router.query, room_format: value },
                    },
                    undefined,
                    { shallow: true }
                );
            }
        } catch (error) {
            console.error("Update failed", error);
            setRoomFormat(String(router.query.room_format || "by_building_no"));
        }
    };

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
                    <div className="w-[180px] flex items-center">
                        <Select
                            id="select-room-format"
                            radius={8}
                            label="รูปแบบการแสดงผลห้อง"
                            placeholder="เลือกรูปแบบ"
                            size={"xs"}
                            data={[
                                { value: "by_building_no", label: "ตามเลขอาคาร" },
                                { value: "by_building_name", label: "ตามชื่ออาคาร" },
                            ]}
                            value={roomFormat}
                            onChange={handleFormatChange}
                            allowDeselect={false}
                        />
                    </div>
                </div>
        
                <TableSection>
                    <RoomTable />
                </TableSection>

            </div>
        </div>
    )
}

export default BuildingDetail
