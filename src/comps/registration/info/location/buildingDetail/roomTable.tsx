import { useState, useRef, useEffect } from 'react';
import {
    Table,
    ScrollArea,
    Text,
    Loader,
    Center
} from '@mantine/core';
import {
    IconEdit,
} from '@tabler/icons-react';
import { buildingFields } from '@/utils/interface/building.types';
import { decodeRegistrationToken } from '@/utils/authToken';
import { useRouter } from "next/router";
import { Modal, Button, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { PushRouter } from '@/utils/function/navigation';
import { useNotification } from '@/comps/noti/notiComp';
import { getBuilding, getRoomLocation, createRoomLocationBatch, updateRoomLocation } from '@/utils/api/building';
import EditRoomLocationModal from '@/comps/registration/info/location/buildingDetail/EditRoomLocationModal';
import AddRoomLocationModal from '@/comps/registration/info/location/buildingDetail/AddRoomLocationModal';

const BATCH_SIZE = 20;

export default function roomTable() {
    const [roomData, setRoomData] = useState<buildingFields[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const router = useRouter();
    const [token, setToken] = useState<any | null>(false);
    const [instId, setInstId] = useState<number | null>(null);
    const [offset, setOffset] = useState<number>(0);
    const [buildingName, setBuildingName] = useState<string>("");
    const [buildingId, setBuildingId] = useState<number | null>(null);

    const [openedEditModal, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
    const [openedAddRoom, { open: openAddRoom, close: closeAddRoom }] = useDisclosure(false);
    const [selectedRoomLocation, setSelectedRoomLocation] =
        useState<buildingFields | null>(null);

    const { showNotification } = useNotification();

    const openEditModals = (room: buildingFields) => {
        setSelectedRoomLocation(room);
        console.log("Selected room for edit:", room);
        openEditModal();
    };

    const openAddRoomModal = () => {
        openAddRoom();
    };

    const viewportRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        const token = decodeRegistrationToken();
        if (token && token.institution && token.institution.inst_id) {
            setInstId(token.institution.inst_id);
        }
        setToken(token);
    }, [router.isReady]);


    const fetchData = async (offset: number) => {
        setLoading(true);

        const { building_id } = router.query;
        setBuildingId(Number(building_id));

        if (instId && building_id) {
            const roomLocationDatas = await getRoomLocation({
                building_id: Number(building_id),
                limit: BATCH_SIZE,
                offset: offset,
                sort_by: "room_location_id",
                sort_order: "asc",
            })

            setRoomData((prev) => [...prev, ...roomLocationDatas.data]);

            if (roomLocationDatas.data.length < BATCH_SIZE) {
                setHasMore(false);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData(0);
    }, [instId, router.isReady]);

    useEffect(() => {
        const { building_id } = router.query;
        const fetchBuildings = async () => {
            try {

                if (building_id) {
                    const buildingData = await getBuilding({
                        building_id: Number(building_id),
                    });

                    console.log("Fetched buildings:", buildingData);
                    if (buildingData.data.length > 0) {
                        setBuildingName(buildingData.data[0]?.building_name || "");
                    }
                }
            } catch (error) {
                console.error("Failed to fetch learning areas:", error);
            }
        };

        fetchBuildings();
    }, [router.isReady]);

    const addRoomData = async (payloads: buildingFields[]) => {

        if (!buildingId || payloads.length === 0) return;

        try {

            const res = await createRoomLocationBatch(payloads);

            if (res.success) {
                showNotification(
                    "สร้างสำเร็จ!",
                    `สร้างห้องเรียนจำนวน ${payloads.length} ห้องเรียบร้อยแล้ว`,
                    "success"
                );

                setRoomData([]);
                setHasMore(true);
                fetchData(offset);

            } else {
                showNotification(
                    "เกิดข้อผิดพลาด!",
                    res.message || "ไม่สามารถบันทึกข้อมูลได้",
                    "error"
                );
            }

        } catch (error) {
            console.error("Create room location batch failed:", error);
            showNotification(
                "เกิดข้อผิดพลาด!",
                "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
                "error"
            );
        }
    };

    const updateRoomLocationData = async (values: buildingFields) => {

        try {

            const payload = {
                ...values,
                room_location_id: Number(selectedRoomLocation?.room_location_id),
            };

            console.log("Edit room location payload:", payload);

            const res = await updateRoomLocation(payload);

            setRoomData([]);
            setHasMore(true);
            fetchData(0);
            setOffset(0);

            if (res.success) {
                showNotification("แก้ไขห้องเรียนสำเร็จ!", "", "success");
            } else {
                showNotification("แก้ไขห้องเรียนล้มเหลว!", res.message, "error");
            }

            console.log("Created room location:", res.data);
        } catch (error) {
            console.error("Update room location failed:", error);
            showNotification("แก้ไขห้องเรียนล้มเหลว!", "An error occurred while updating the room location.", "error");
        }
    };

    const onScroll = () => {
        if (viewportRef.current) {
            const { scrollHeight, scrollTop, clientHeight } = viewportRef.current;

            // ตรวจสอบระยะ Scroll
            if (scrollHeight - scrollTop <= clientHeight + 50) {
                if (!loading && hasMore) {
                    const nextOffset = roomData.length;
                    fetchData(nextOffset);
                    setOffset(nextOffset);
                }
            }
        }
    };


    const rows = roomData.map((element, index) => (
        <Table.Tr
            key={element.room_location_id}
            className='text-xs'
        >
            <Table.Td ta="center">{index + 1}</Table.Td>
            <Table.Td ta="center">{element.floor}</Table.Td>
            <Table.Td ta="center">{element.floor + String(element.room_number)}</Table.Td>
            <Table.Td ta="center">{router.query.room_format == 'by_building_no' ? String(element.building_no) + String(element.floor) + String(element.room_number) : String(element.building_name) + String(element.floor) + String(element.room_number)}</Table.Td>

            <Table.Td ta="center">{element.room_remark ? element.room_remark : "-"}</Table.Td>

            <Table.Td ta="center" className='flex justify-center gap-2'>
                <IconEdit size={20} stroke={2} color='#5e5e5eff'
                    onClick={(e) => {
                        e.stopPropagation();
                        openEditModals(element);
                    }}
                    style={{ cursor: "pointer" }}
                />
            </Table.Td>

        </Table.Tr>
    ));

    return (
        <div
            className='bg-white'
            style={{ padding: '1px' }}>
            <div className="flex justify-between items-center mb-3 mt-1">
                <Text size="xl" fw={500}>
                    ห้องเรียนของ : {buildingName}
                </Text>
                <Button
                    size="xs"
                    radius="md"
                    onClick={() => {
                        openAddRoomModal();
                    }}
                >
                    เพิ่มห้องเรียน
                </Button>
            </div>

            <ScrollArea
                h={650}
                onScrollPositionChange={onScroll}
                viewportRef={viewportRef}
                type="always"
                bd="1px solid gray.3"
                style={{ borderRadius: 8 }}
            >
                <Table stickyHeader horizontalSpacing="md" verticalSpacing="sm" layout="fixed" >
                    <Table.Thead style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.08)' }}>
                        <Table.Tr>
                            <Table.Th w={5} ta="center">ลำดับ</Table.Th>
                            <Table.Th w={20} ta="center">ชั้น</Table.Th>
                            <Table.Th w={40} ta="center">เลขห้อง</Table.Th>
                            <Table.Th w={40} ta="center">ชื่อเต็ม</Table.Th>
                            <Table.Th w={60} ta="center">หมายเหตุ</Table.Th>
                            <Table.Th w={5} ta="center">จัดการ</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>{rows}</Table.Tbody>
                </Table>

                {loading && (
                    <Center p="md">
                        <Loader size="sm" />
                    </Center>
                )}

                {!hasMore && (
                    <Center p="md" mt="xs">
                        <Text size="sm" c="dimmed">ห้องเรียนทั้งหมดถูกโหลดแล้ว</Text>
                    </Center>
                )}
            </ScrollArea>

            <Text size="xs" c="dimmed" mt="sm">
                โหลดแล้ว: {roomData.length} จาก {roomData[0]?.total_count} รายการ
            </Text>

            <EditRoomLocationModal
                roomLocation={selectedRoomLocation}
                opened={openedEditModal}
                close={closeEditModal}
                onSubmit={async (values) => {
                    await updateRoomLocationData(values);
                    closeEditModal();
                }}
            />

            <AddRoomLocationModal
                opened={openedAddRoom}
                close={closeAddRoom}
                buildingId={Number(buildingId)}
                onSubmit={async (values) => {
                    await addRoomData(values);
                    closeAddRoom();
                }}
            />

        </div>
    );
}