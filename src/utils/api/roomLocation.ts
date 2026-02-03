import { fetchDataApi } from "@/utils/callAPI"
import { buildingFields } from "@/utils/interface/building.types"

// GET /room-location/:id - ดึงข้อมูลตาม ID
export const getRoomLocationById = async (id: number) => {
    const data = await fetchDataApi(`GET`, `room-location/${id}`, {});
    return data;
};

// GET /room-location - ค้นหาพร้อม pagination
export const getRoomLocation = async (input: buildingFields) => {
    const {
        room_location_id,
        building_id,
        room_number,
        floor,
        flag_valid,
        offset,
        limit,
        sort_by,
        sort_order,
    } = input;

    const data = await fetchDataApi(`GET`, "room-location", {
        room_location_id,
        building_id,
        room_number,
        floor,
        flag_valid,
        offset,
        limit,
        sort_by,
        sort_order,
    });

    return data;
};

// POST /room-location - สร้างใหม่
export const createRoomLocation = async (input: buildingFields) => {
    const {
        building_id,
        room_number,
        floor,
        room_remark,
        flag_valid,
    } = input;

    const data = await fetchDataApi(`POST`, "room-location", {
        building_id,
        room_number,
        floor,
        room_remark,
        flag_valid,
    });

    return data;
};

// POST /room-location/batch - สร้างหลายรายการพร้อมกัน
export const createRoomLocationBatch = async (inputs: buildingFields[]) => {
    try {
        const data = await fetchDataApi(`POST`, "room-location/batch", { rooms: inputs });
        return data;
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message,
            status: error.response?.status,
        };
    }
};

// PUT /room-location/:id - อัปเดต
export const updateRoomLocation = async (input: buildingFields) => {
    const {
        room_location_id,
        building_id,
        room_number,
        floor,
        room_remark,
        flag_valid
    } = input;

    const data = await fetchDataApi(`PUT`, `room-location/${room_location_id}`, {
        building_id,
        room_number,
        floor,
        room_remark,
        flag_valid
    });

    return data;
};

// DELETE /room-location/:id - ลบ
export const deleteRoomLocation = async (id: number) => {
    const data = await fetchDataApi(`DELETE`, `room-location/${id}`, {});
    return data;
};
