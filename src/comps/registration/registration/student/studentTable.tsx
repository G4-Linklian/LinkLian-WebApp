import { useState, useRef, useEffect } from 'react';
import {
    Table,
    ScrollArea,
    Text,
    Loader,
    Center,
    TextInput
} from '@mantine/core';
import { IconSearch, IconFilter, IconPlus } from '@tabler/icons-react';
import {
    IconEdit,
    IconEye,
} from "@tabler/icons-react";
import { getUserSys, updateUserSys, createUserSys } from '@/utils/api/userData';
import { UserSysFields } from '@/utils/interface/user.types';
import { decodeRegistrationToken } from '@/utils/authToken';
import { useRouter } from "next/router";
import { Modal, Button, Group } from "@mantine/core";
import { useDisclosure, useDebouncedValue } from "@mantine/hooks";
import { PushRouter } from '@/utils/function/navigation';
import { useNotification } from '@/comps/noti/notiComp';
import { useEduLevelOptions } from "@/hooks/eduLevel";
import { updateProgramUserSys } from '@/utils/api/program';
import EditStudentModal from '@/comps/registration/registration/student/EditStudentModal';
import AddStudentModal from '@/comps/registration/registration/student/AddStudentModal';
import FilterStudentModal from '@/comps/registration/registration/student/FilterStudentModal';
import ViewStudentDetailModal from '@/comps/registration/registration/student/ViewStudentDetailModal';

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
    const { options: eduLevelOptions, isLoading: eduLevelLoading } = useEduLevelOptions();

    const [openedEditModal, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
    const [openedAddStudent, { open: openAddStudent, close: closeAddStudent }] = useDisclosure(false);
    const [openedFilterModal, { open: openFilterModal, close: closeFilterModal }] = useDisclosure(false);
    const [openedViewDetail, { open: openViewDetail, close: closeViewDetail }] = useDisclosure(false);
    const [selectedStudent, setSelectedStudent] =
        useState<UserSysFields | null>(null);
    const [filterParams, setFilterParams] = useState<UserSysFields>({});

    // Debounce Search
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm] = useDebouncedValue(searchTerm, 500);

    // Sync debounced search term with filterParams
    useEffect(() => {
        setFilterParams((prev) => ({
            ...prev,
            keyword: debouncedSearchTerm
        }));
    }, [debouncedSearchTerm]);

    const openEditModals = (student: UserSysFields) => {
        setSelectedStudent(student);
        openEditModal();
    };

    const openAddStudentModal = () => {
        openAddStudent();
    };

    const openViewDetailModal = (student: UserSysFields) => {
        setSelectedStudent(student);
        openViewDetail();
    };



    const viewportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const token = decodeRegistrationToken();
        setToken(token);

        if (token && token.institution && token.institution.inst_id) {

            setInstId(token.institution.inst_id);

            const role_id = token.institution.inst_type === "school" ? 2 : 3;
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
                limit: BATCH_SIZE,
                user_status: "Active",
                ...filterParams
            });

            if (offset === 0) {
                setStudentData(userData.data);
            } else {
                setStudentData((prev) => [...prev, ...userData.data]);
            }

            if (userData.data.length < BATCH_SIZE) {
                setHasMore(false);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        if (instId) {
            fetchData(0);
        }
    }, [instId, filterParams]);

    const addStudentData = async (values: UserSysFields) => {
        if (!instId) {
            showNotification("เพิ่มนักเรียนล้มเหลว!", "ไม่พบสถาบันที่เกี่ยวข้อง", "error");
            return;
        }
        try {
            const res = await createUserSys({
                ...values,
                inst_id: Number(instId),
                role_id: Number(roleID),
                learning_area_id: Number(values.learning_area_id),
                edu_lev_id: Number(values.edu_lev_id),
            });

            setStudentData([]);
            setHasMore(true);
            fetchData(0);

            if (res.success) {
                showNotification("เพิ่มผู้เรียนสำเร็จ!", "", "success");
            } else {
                showNotification("เพิ่มผู้เรียนล้มเหลว!", res.message, "error");
            }
        } catch (error) {
            console.error("Create staff failed:", error);
            showNotification("เพิ่มผู้เรียนล้มเหลว!", "An error occurred while creating the student.", "error");
        }
    };

    const updateStudentData = async (values: UserSysFields) => {
        if (!instId) {
            showNotification("แก้ไขนักเรียนล้มเหลว!", "ไม่พบสถาบันที่เกี่ยวข้อง", "error");
            return;
        }

        try {

            const payload = {
                ...values,
                inst_id: Number(instId),
                user_sys_id: Number(values.user_sys_id),
                edu_lev_id: Number(values.edu_lev_id),
            };


            const res = await updateUserSys(payload);
            await updateProgramUserSys({
                program_id: Number(values.program_id),
                user_sys_id: Number(values.user_sys_id),
            });

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

    const deleteStudentData = async (_user_sys_id: number) => {
        setStudentData([]);
        setHasMore(true);
        fetchData(0);
    };

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
                <IconEye size={20} stroke={2} color='gray'
                    onClick={(e) => {
                        e.stopPropagation();
                        openViewDetailModal(element);
                    }}
                    style={{ cursor: "pointer" }}
                />
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
                {/* ส่วนหัวข้อ */}
                <Text size="xl" fw={500} className='flex items-center gap-2'>
                    รายชื่อนักเรียน
                </Text>

                <div className="flex items-center gap-2">
                    <TextInput
                        id="search-student-input"
                        placeholder="ค้นหา..."
                        size="xs"
                        radius="md"
                        leftSection={<IconSearch size={14} />}
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.currentTarget.value)}
                    />

                    <Button
                        id="filter-student-button"
                        variant="default"
                        size="xs"
                        radius="md"
                        leftSection={<IconFilter size={14} />}
                        onClick={() => {
                            openFilterModal();
                        }}
                    >
                        ตัวกรอง
                    </Button>

                    <Button
                        size="xs"
                        radius="md"
                        onClick={() => {
                            openAddStudentModal();
                        }}
                        id="add-student-button"
                    >
                        เพิ่มนักเรียน
                    </Button>
                </div>
            </div>

            <ScrollArea
                h={650}
                onScrollPositionChange={onScroll}
                viewportRef={viewportRef}
                type="always"
                bd="1px solid gray.3"
                style={{ borderRadius: 8 }}
            >
                <Table stickyHeader horizontalSpacing="md" verticalSpacing="md" layout="fixed" id="student-table">
                    <Table.Thead style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.08)' }}>
                        <Table.Tr>
                            {/* <Table.Th w={5} ta="center">ลำดับ</Table.Th> */}
                            <Table.Th w={60} ta="center">ชื่อ-นามสกุล</Table.Th>
                            <Table.Th w={30} ta="center">รหัสนักเรียน</Table.Th>
                            <Table.Th w={30} ta="center">ระดับชั้น</Table.Th>
                            <Table.Th w={30} ta="center">ห้อง</Table.Th>
                            <Table.Th w={70} ta="center">อีเมล</Table.Th>
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
                        <Text size="sm" c="dimmed">นักเรียนทั้งหมดถูกโหลดแล้ว</Text>
                    </Center>
                )}
            </ScrollArea>

            <Text size="xs" c="dimmed" mt="sm">
                โหลดแล้ว: {studentData.length} จาก {studentData[0]?.total_count} รายการ
            </Text>

            <EditStudentModal
                student={selectedStudent}
                opened={openedEditModal}
                close={closeEditModal}
                onSubmit={async (values) => {
                    await updateStudentData(values);
                    closeEditModal();
                }}
                onDelete={async (user_sys_id) => {
                    await deleteStudentData(user_sys_id);
                    closeEditModal();
                }}
                eduLevelOptions={eduLevelOptions}
                token={token}
            />

            <AddStudentModal
                opened={openedAddStudent}
                close={closeAddStudent}
                onSubmit={async (values) => {
                    await addStudentData(values);
                    closeAddStudent();
                }}
                eduLevelOptions={eduLevelOptions}
                token={token}
            />

            <FilterStudentModal
                opened={openedFilterModal}
                close={closeFilterModal}
                onSubmit={(values) => {
                    setFilterParams(values);
                }}
                onClear={() => {
                    setFilterParams({});
                }}
                eduLevelOptions={eduLevelOptions}
                initialValues={filterParams}
            />

            <ViewStudentDetailModal
                opened={openedViewDetail}
                close={closeViewDetail}
                student={selectedStudent}
            />

        </div>
    );
}