import { useState, useRef, useEffect } from 'react';
import {
    Table,
    ScrollArea,
    Text,
    Loader,
    Center,
    ActionIcon
} from '@mantine/core';

import {
    IconDots,
    IconEye
} from "@tabler/icons-react";
import { getUserSys, updateUserSys, createUserSys } from '@/utils/api/userData';
import { UserSysFields } from '@/utils/interface/user.types';
import { sectionFieldsForm } from '@/utils/interface/section.types';
import { decodeRegistrationToken } from '@/utils/authToken';
import { useRouter } from "next/router";
import { Modal, Button, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useNotification } from '@/comps/noti/notiComp';
import AddStudentSectionModal from '@/comps/registration/schedule/section/sectionDetail/Student/AddStudentSectionModal';
import { getSectionEnrollment, createSectionEnrollment, updateSectionEnrollment} from '@/utils/api/section';

const BATCH_SIZE = 20;

export default function StudentTable() {
    const [studentData, setStudentData] = useState<UserSysFields[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const router = useRouter();
    const [token, setToken] = useState<any | null>(false);
    const [instId, setInstId] = useState<number | null>(null);
    const [roleID, setRoleID] = useState<number>(5);
    const [offset, setOffset] = useState<number>(0);
    const { showNotification } = useNotification();
    const [sectionId, setSectionId] = useState<number | null>(null);

    const [openedEditModal, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
    const [openedAddStudent, { open: openAddStudent, close: closeAddStudent }] = useDisclosure(false);
    const [selectedStudent, setSelectedStudent] =
        useState<UserSysFields | null>(null);

    const openEditModals = (student: UserSysFields) => {
        setSelectedStudent(student);
        openEditModal();
    };

    const openAddStudentModal = () => {
        openAddStudent();
    };



    const viewportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const token = decodeRegistrationToken();

        setToken(token);

        if (token && token.institution && token.institution.inst_id) {

            setInstId(token.institution.inst_id);

            const role_id = token.institution.inst_type === "school" ? 2 : 3;
            setRoleID(role_id);

            if (router.query.section_id) {
                setSectionId(Number(router.query.section_id));
            }

        }
    }, [router.isReady]);

    const fetchData = async (offset: number) => {
        setLoading(true);

        if (sectionId) {
            console.log(sectionId)
            const userData = await getSectionEnrollment({
                section_id: Number(sectionId),
                offset: offset,
                sort_by: "user_sys_id",
                sort_order: "asc",
                limit: BATCH_SIZE
            })

            console.log("Fetched student data:", userData);

            setStudentData((prev) => [...prev, ...userData.data]);

            if (userData.data.length < BATCH_SIZE) {
                setHasMore(false);
            }
        }
        setLoading(false);
    };

    const addStudentData = async (values: sectionFieldsForm) => {

        try {
            const res = await createSectionEnrollment({
                user_sys_id: Number(values.user_sys_id),
                section_id: Number(sectionId),
            });

            setStudentData([]);
            setHasMore(true);
            fetchData(0);

            if (res.success) {
                showNotification("เพิ่มนักเรียนสำเร็จ!", "", "success");
            } else {
                showNotification("เพิ่มนักเรียนล้มเหลว!", res.message, "error");
            }
        } catch (error) {
            console.error("Create student failed:", error);
            showNotification("เพิ่มนักเรียนล้มเหลว!", "An error occurred while creating the student.", "error");
        }
    };

    const updateStudentData = async (values: sectionFieldsForm) => {

        try {

            const payload = {
                user_sys_id: Number(values.user_sys_id),
                section_id: Number(sectionId),
            };

            console.log("Edit semester payload:", payload);

            const res = await updateSectionEnrollment(payload);

            setStudentData([]);
            setHasMore(true);
            fetchData(0);

            if (res.success) {
                showNotification("แก้ไขนักเรียนสำเร็จ!", "", "success");
            } else {
                showNotification("แก้ไขนักเรียนล้มเหลว!", res.message, "error");
            }
        } catch (error) {
            console.error("Create staff failed:", error);
            showNotification("แก้ไขนักเรียนล้มเหลว!", "An error occurred while editing the student.", "error");
        }
    };


    useEffect(() => {
        fetchData(0);
    }, [instId]);


    const onScroll = () => {
        if (viewportRef.current) {
            const { scrollHeight, scrollTop, clientHeight } = viewportRef.current;

            // ตรวจสอบระยะ Scroll
            if (scrollHeight - scrollTop <= clientHeight + 50) {
                if (!loading && hasMore) {
                    const nextOffset = studentData.length;
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

    const rows = studentData.map((element, index) => (
        <Table.Tr
            key={element.user_sys_id}
            className='text-xs'
        >

            <Table.Td ta="center">{element.first_name} {element.last_name}</Table.Td>
            <Table.Td ta="center">{element.code}</Table.Td>
            <Table.Td ta="center">{element.level_name}</Table.Td>
            <Table.Td ta="center">{element.program_name}</Table.Td>
            <Table.Td ta="center">{element.email}</Table.Td>

            <Table.Td ta="center" className='flex justify-center items-center'>
                <ActionIcon variant="subtle" color="gray"
                // onClick={(e) => {
                //     e.stopPropagation();
                //     openEditModals(element);
                // }}
                >
                    <IconEye size={16} />
                </ActionIcon>
                <ActionIcon variant="subtle" color="gray"
                // onClick={(e) => {
                //     e.stopPropagation();
                //     openEditModals(element);
                // }}
                >
                    <IconDots size={16} />
                </ActionIcon>
            </Table.Td>

        </Table.Tr>
    ));

    return (
        <div
            className='bg-white'
            style={{ padding: '1px' }}>
            <div className="flex justify-between items-center mb-3 mt-1">
                <Text size="xl" fw={500} className='flex items-center gap-2'>
                    รายชื่อนักเรียน
                </Text>
                <Button
                    size="xs"
                    radius="md"
                    onClick={() => {
                        openAddStudentModal();
                    }}
                >
                    เพิ่มนักเรียน
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
                <Table stickyHeader horizontalSpacing="md" verticalSpacing="md" layout="fixed" >
                    <Table.Thead style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.08)' }}>
                        <Table.Tr>
                            {/* <Table.Th w={5} ta="center">ลำดับ</Table.Th> */}
                            <Table.Th w={60} ta="center">ชื่อ-นามสกุล</Table.Th>
                            <Table.Th w={30} ta="center">รหัสนักเรียน</Table.Th>
                            <Table.Th w={30} ta="center">ระดับชั้น</Table.Th>
                            <Table.Th w={30} ta="center">ห้อง</Table.Th>
                            <Table.Th w={70} ta="center">อีเมล</Table.Th>
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
                        <Text size="sm" c="dimmed">นักเรียนทั้งหมดถูกโหลดแล้ว</Text>
                    </Center>
                )}
            </ScrollArea>

            <Text size="xs" c="dimmed" mt="sm">
                โหลดแล้ว: {studentData.length} จาก {studentData[0]?.total_count} รายการ
            </Text>

            {/* <EditStudentModal
                student={selectedStudent}
                opened={openedEditModal}
                close={closeEditModal}
                onSubmit={async (values) => {
                    await updateStudentData(values);
                    //console.log("Edit student values:", values);
                    closeEditModal();
                }}
                eduLevelOptions={eduLevelOptions}
                token={token}
            /> */}

            <AddStudentSectionModal
                opened={openedAddStudent}
                close={closeAddStudent}
                onSubmit={async (values) => {
                    await addStudentData(values);
                    closeAddStudent();
                }}
                token={token}
                roleID={Number(roleID)}
            />

        </div>
    );
}