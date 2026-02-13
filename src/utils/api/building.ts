import { fetchDataApi } from "@/utils/callAPI"
import { buildingFields } from "@/utils/interface/building.types"

// GET /building/:id - ดึงข้อมูลตาม ID
export const getBuildingById = async (id: number) => {
    const data = await fetchDataApi(`GET`, `building/${id}`, {});
    return data;
};

// GET /building - ค้นหาพร้อม pagination
export const getBuilding = async (input: buildingFields) => {
    const {
        building_id,
        inst_id,
        building_no,
        building_name,
        flag_valid,
        room_format,
        keyword,
        offset,
        limit,
        sort_by,
        sort_order,
    } = input;

    const data = await fetchDataApi(`GET`, "building", {
        building_id,
        inst_id,
        building_no,
        building_name,
        flag_valid,
        room_format,
        keyword,
        offset,
        limit,
        sort_by,
        sort_order,
    });

    return data;
};

// POST /building - สร้างใหม่
export const createBuilding = async (input: buildingFields) => {
    const {
        inst_id,
        building_no,
        building_name,
        remark,
        flag_valid,
        room_format,
    } = input;

    const data = await fetchDataApi(`POST`, "building", {
        inst_id,
        building_no,
        building_name,
        flag_valid,
        remark,
        room_format,
    });

    return data;
};

// PUT /building/:id - อัปเดต
export const updateBuilding = async (input: buildingFields) => {
    const {
        building_id,
        inst_id,
        building_no,
        building_name,
        remark,
        flag_valid,
        room_format,
    } = input;

    const data = await fetchDataApi(`PUT`, `building/${building_id}`, {
        inst_id,
        building_no,
        building_name,
        remark,
        flag_valid,
        room_format,
    });

    return data;
};

// DELETE /building/:id - ลบ
export const deleteBuilding = async (id: number) => {
    const data = await fetchDataApi(`DELETE`, `building/${id}`, {});
    return data;
};