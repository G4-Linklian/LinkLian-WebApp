import { fetchDataApi } from "@/utils/callAPI"
import { buildingFields } from "@/utils/interface/building.types"


export const getBuilding = async (input: buildingFields) => {

    const {
        building_id = "",
        inst_id = "",
        building_no = "",
        building_name = "",
        flag_valid = "",
        room_format = "",
    } = input;

    const data = await fetchDataApi(`POST`, "building.get", {
        building_id: building_id,
        inst_id: inst_id,
        building_no: building_no,
        building_name: building_name,
        flag_valid: flag_valid,
        room_format: room_format,
    });

    return data;
};


export const createBuilding = async (input: buildingFields) => {

    const {
        inst_id = "",
        building_no = "",
        building_name = "",
        remark = "",
        flag_valid = "",
        room_format = "",
    } = input;

    const data = await fetchDataApi(`POST`, "building.create", {
        inst_id: inst_id,
        building_no: building_no,
        building_name: building_name,
        flag_valid: flag_valid,
        remark: remark,
        room_format: room_format,
    });

    return data;
};


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

    const data = await fetchDataApi(`POST`, "building.update", {
        building_id: building_id,
        inst_id: inst_id,
        building_no: building_no,
        building_name: building_name,
        remark: remark,
        flag_valid: flag_valid,
        room_format: room_format,
    });

    return data;
};


export const getRoomLocation = async (input: buildingFields) => {

    const {
        room_location_id = "",
        building_id = "",
        room_number = "",
        floor = "",
        flag_valid = "",
        offset,
        limit,
        sort_by = "",
        sort_order,
    } = input;

    const data = await fetchDataApi(`POST`, "room.location.get", {
        room_location_id: room_location_id,
        building_id: building_id,
        room_number: room_number,
        floor: floor,
        flag_valid: flag_valid,
        offset: offset,
        limit: limit,
        sort_by: sort_by,
        sort_order: sort_order,
    });

    return data;
};


export const createRoomLocation = async (input: buildingFields) => {

    const {
        building_id = "",
        room_number = "",
        floor = "",
        room_remark = "",
        flag_valid = "",
    } = input;

    const data = await fetchDataApi(`POST`, "room.location.create", {
        building_id: building_id,
        room_number: room_number,
        floor: floor,
        room_remark: room_remark,
        flag_valid: flag_valid,
    });

    return data;
};

export const createRoomLocationBatch = async (inputs: buildingFields[]) => {
    
    const data = await fetchDataApi(`POST`, "room.location.create.batch", inputs);

    return data;
};


export const updateRoomLocation = async (input: buildingFields) => {

    const {
        room_location_id,
        building_id,
        room_number,
        floor,
        room_remark,
        flag_valid
    } = input;

    const data = await fetchDataApi(`POST`, "room.location.update", {
        room_location_id: room_location_id,
        building_id: building_id,
        room_number: room_number,
        floor: floor,
        room_remark: room_remark,
        flag_valid: flag_valid
    });

    return data;
};