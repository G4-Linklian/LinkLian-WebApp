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
} from "@tabler/icons-react";
import { getUserSys, updateUserSys, createUserSys } from '@/utils/api/userData';
import { UserSysFields } from '@/utils/interface/user.types';
import { decodeRegistrationToken } from '@/utils/authToken';
import { useRouter } from "next/router";
import { Modal, Button, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import EditStaffModal from '@/comps/registration/info/staff/EditStaffModal';
import AddStaffModal from '@/comps/registration/info/staff/AddStaffModal';
import { getLearningArea, updateLearningAreaUserSys } from '@/utils/api/learningArea';
import { useNotification } from '@/comps/noti/notiComp';

const BATCH_SIZE = 10;

export default function StaffTable() {
    const [staffData, setStaffData] = useState<UserSysFields[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const router = useRouter();
    const [token, setToken] = useState<any | null>(false);
    const [instId, setInstId] = useState<number | null>(null);
    const [roleID, setRoleID] = useState<number>(5);
    const [offset, setOffset] = useState<number>(0);
    const { showNotification } = useNotification();

    const [openedEditModal, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
    const [openedAddStaff, { open: openAddStaff, close: closeAddStaff }] = useDisclosure(false);
    const [selectedStaff, setSelectedStaff] =
        useState<UserSysFields | null>(null);
    const [learningAreaOptions, setLearningAreaOptions] = useState<{ value: string; label: string }[]>([]);

    const openEditModals = (staff: UserSysFields) => {
        setSelectedStaff(staff);
        openEditModal();
    };

    const openAddStaffModal = () => {
        openAddStaff();
    };


    const viewportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const token = decodeRegistrationToken();

        setToken(token);

        if (token && token.institution && token.institution.inst_id) {

            setInstId(token.institution.inst_id);

            const role_id = token.institution.inst_type === "school" ? 4 : 5;
            setRoleID(role_id);

        }
    }, [router.isReady]);

    const fetchData = async (offset: number) => {
        setLoading(true);

        if (instId && roleID) {
            const userData = await getUserSys({
                inst_id: instId,
                role_id: roleID,
                offset: offset,
                sort_by: "user_sys_id",
                sort_order: "asc",
                limit: BATCH_SIZE
            })

            setStaffData((prev) => [...prev, ...userData.data]);

            if (userData.data.length < BATCH_SIZE) {
                setHasMore(false);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData(0);
    }, [instId]);

    const addStaffData = async (values: UserSysFields) => {
        if (!instId) {
            showNotification("เพิ่มบุคลากรล้มเหลว!", "ไม่พบรหัสสถาบัน", "error");
            return;
        }


        try {
            const res = await createUserSys({
                ...values,
                inst_id: Number(instId),
                role_id: Number(roleID),
                learning_area_id: Number(values.learning_area_id),
            });

            setStaffData([]);
            setHasMore(true);
            fetchData(0);

            if (res.success) {
                showNotification("เพิ่มบุคลากรสำเร็จ!", "", "success");
            } else {
                showNotification("เพิ่มบุคลากรล้มเหลว!", res.message, "error");
            }
        } catch (error) {
            console.error("Create staff failed:", error);
            showNotification("เพิ่มบุคลากรล้มเหลว!", "An error occurred while creating the staff.", "error");
        }
    };

    const updateStaffData = async (values: UserSysFields) => {
        if (!instId) {
            showNotification("เพิ่มบุคลากรล้มเหลว!", "ไม่พบรหัสสถาบัน", "error");
            return;
        }

        try {

            const payload = {
                ...values,
                inst_id: Number(instId),
                user_sys_id: Number(values.user_sys_id),
            };

            const res = await updateUserSys(payload);
            await updateLearningAreaUserSys({
                learning_area_id: values.learning_area_id,
                user_sys_id: values.user_sys_id,
            });

            setStaffData([]);
            setHasMore(true);
            fetchData(0);

            if (res.success) {
                showNotification("แก้ไขบุคลากรสำเร็จ!", "", "success");
            } else {
                showNotification("แก้ไขบุคลากรล้มเหลว!", res.message, "error");
            }
        } catch (error) {
            console.error("Create staff failed:", error);
            showNotification("แก้ไขบุคลากรล้มเหลว!", "An error occurred while editing the staff.", "error");
        }
    };


    useEffect(() => {
        const fetchLearningAreas = async () => {
            try {

                if (instId) {
                    const learningAreaData = await getLearningArea({
                        inst_id: instId,
                    });

                    const options = learningAreaData.data.map((area: any) => ({
                        value: area.learning_area_id.toString(),
                        label: area.learning_area_name,
                    }));

                    setLearningAreaOptions(options);
                }
            } catch (error) {
                console.error("Failed to fetch learning areas:", error);
                showNotification("โหลดกลุ่มการสอนล้มเหลว!", "เกิดข้อผิดพลาดขณะโหลดกลุ่มการสอน", "error");
            }
        };

        fetchLearningAreas();
    }, [instId]);


    const onScroll = () => {
        if (viewportRef.current) {
            const { scrollHeight, scrollTop, clientHeight } = viewportRef.current;

            // ตรวจสอบระยะ Scroll
            if (scrollHeight - scrollTop <= clientHeight + 50) {
                if (!loading && hasMore) {
                    const nextOffset = staffData.length;
                    fetchData(nextOffset);
                    setOffset(nextOffset);
                }
            }
        }
    };

    const statusMap: Record<
        "Active" | "Resigned" | "Graduated" | "Inactive",
        { label: string; color: string }
    > = {
        Active: {
            label: "ใช้งาน",
            color: "#11bd2eff", // green-400
        },
        Resigned: {
            label: "ลาออก",
            color: "#fb7185", // red-400
        },
        Graduated: {
            label: "จบการศึกษา",
            color: "#09b9ffff", // blue-400
        },
        Inactive: {
            label: "เลิกใช้งาน",
            color: "#9ca3af", // gray-400
        },
    };

    const rows = staffData.map((element, index) => (
        <Table.Tr
            key={element.user_sys_id}
            className='text-xs'
        >

            <Table.Td ta="center">{element.first_name} {element.last_name}</Table.Td>
            <Table.Td ta="center">{element.learning_area_name}</Table.Td>
            <Table.Td ta="center">{element.email}</Table.Td>
            <Table.Td ta="center">
                <div
                    className="px-2 rounded-sm text-black w-max mx-auto border"
                    style={{
                        borderColor: statusMap[element.user_status as "Active" | "Resigned" | "Graduated" | "Inactive"]?.color ?? "#9ca3af",
                        color: statusMap[element.user_status as "Active" | "Resigned" | "Graduated" | "Inactive"]?.color ?? "#9ca3af",
                    }}
                >
                    {statusMap[element.user_status as "Active" | "Resigned" | "Graduated" | "Inactive"]?.label ?? "ไม่ทราบสถานะ"}
                </div>
            </Table.Td>

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
                <Text size="xl" fw={500} className='flex items-center gap-2'>
                    บุคลากร
                </Text>
                <Button
                    size="xs"
                    radius="md"
                    onClick={() => {
                        openAddStaffModal();
                    }}
                >
                    เพิ่มบุคลากร
                </Button>
            </div>

            <ScrollArea
                h={400}
                onScrollPositionChange={onScroll}
                viewportRef={viewportRef}
                type="always"
                bd="1px solid gray.3"
                style={{ borderRadius: 8 }}
            >
                <Table stickyHeader horizontalSpacing="md" verticalSpacing="md" layout="fixed" >
                    <Table.Thead style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.08)' }}>
                        <Table.Tr>
                            {/* <Table.Th w={5} ta="center">ลำดับ</Table.Th> */}
                            <Table.Th w={60} ta="center">ชื่อ-นามสกุล</Table.Th>
                            <Table.Th w={40} ta="center">กลุ่มการสอน</Table.Th>
                            <Table.Th w={60} ta="center">อีเมล</Table.Th>
                            <Table.Th w={30} ta="center">สถานะ</Table.Th>
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
                        <Text size="sm" c="dimmed">บุคลากรทั้งหมดถูกโหลดแล้ว</Text>
                    </Center>
                )}
            </ScrollArea>

            <Text size="xs" c="dimmed" mt="sm">
                โหลดแล้ว: {staffData.length} จาก {staffData[0]?.total_count} รายการ
            </Text>

            <EditStaffModal
                staff={selectedStaff}
                opened={openedEditModal}
                close={closeEditModal}
                onSubmit={async (values) => {
                    await updateStaffData(values);
                    closeEditModal();
                }}
                learningAreaOptions={learningAreaOptions}
            />

            <AddStaffModal
                opened={openedAddStaff}
                close={closeAddStaff}
                onSubmit={async (values) => {
                    await addStaffData(values);
                    closeAddStaff();
                }}
                learningAreaOptions={learningAreaOptions}
            />

        </div>
    );
}