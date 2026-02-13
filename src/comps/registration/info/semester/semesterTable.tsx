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
    IconFilter
} from "@tabler/icons-react";
import { getSemester } from '@/utils/api/semester';
import { semesterFields } from '@/utils/interface/semester.types';
import { decodeRegistrationToken } from '@/utils/authToken';
import { useRouter } from "next/router";
import { formatDate, formatDateOnly, normalizeDate } from "@/config/formatters";
import { Modal, Button, Group } from "@mantine/core";
import SemesterEditModal from '@/comps/registration/info/semester/EditSemesterModal';
import AddSemesterModal from '@/comps/registration/info/semester/AddSemesterModal';
import FilterSemesterModal from '@/comps/registration/info/semester/FilterSemesterModal';
import { useDisclosure } from "@mantine/hooks";
import { createSemester, updateSemester } from '@/utils/api/semester';
import { useNotification } from '@/comps/noti/notiComp';

const BATCH_SIZE = 3;

export default function SemesterTable() {
    const [semesterData, setSemesterData] = useState<semesterFields[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const router = useRouter();
    const [token, setToken] = useState<any | null>(false);
    const [instId, setInstId] = useState<number | null>(null);
    const [offset, setOffset] = useState<number>(0);
    const { showNotification } = useNotification();

    const [openedEditModal, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
    const [openedAddSemester, { open: openAddSemester, close: closeAddSemester }] = useDisclosure(false);
    const [openedFilterModal, { open: openFilterModal, close: closeFilterModal }] = useDisclosure(false);
    const [selectedSemester, setSelectedSemester] =
        useState<semesterFields | null>(null);
    const [filterParams, setFilterParams] = useState<semesterFields>({});

    const openEditModals = (semester: semesterFields) => {
        setSelectedSemester(semester);
        openEditModal();
    };

    const openAddSemesterModal = () => {
        openAddSemester();
    };



    const viewportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const token = decodeRegistrationToken();
        setToken(token);
        if (token && token.institution && token.institution.inst_id) {
            setInstId(token.institution.inst_id);
        }
    }, [router.isReady]);

    const fetchData = async (offset: number) => {
        setLoading(true);

        if (instId) {
            const semesterData = await getSemester({
                inst_id: instId,
                offset: offset,
                sort_by: "start_date",
                sort_order: "desc",
                limit: BATCH_SIZE,
                ...filterParams
            })

            if (offset === 0) {
                setSemesterData(semesterData.data);
            } else {
                setSemesterData((prev) => [...prev, ...semesterData.data]);
            }

            if (semesterData.data.length < BATCH_SIZE) {
                setHasMore(false);
            }
        }
        setLoading(false);
    };

    const addSemesterData = async (values: semesterFields) => {
        if (!instId) return;

        try {

            const semesterData = await getSemester({
                inst_id: instId,
                // semester: values.semester,
                start_date: values.start_date,
                end_date: values.end_date,
                limit: 1
            })

            if (semesterData.data.length > 0) {
                showNotification("เพิ่มภาคเรียนล้มเหลว!", "ระยะการเปิดปิดของภาคเรียนทับซ้อนกับภาคเรียนอื่น", "error");
                return;
            }

            const res = await createSemester({
                ...values,
                inst_id: instId,
            });

            setSemesterData([]);
            setHasMore(true);
            fetchData(0);

            if (res.success) {
                showNotification("เพิ่มภาคเรียนสำเร็จ!", "", "success");
            } else {
                showNotification("เพิ่มภาคเรียนล้มเหลว!", res.message, "error");
            }
        } catch (error) {
            console.error("Create semester failed:", error);
            showNotification("เพิ่มภาคเรียนล้มเหลว!", "An error occurred while creating the semester.", "error");
        }
    };

    const updateSemesterData = async (values: semesterFields) => {
        if (!instId) return;

        try {

            const semesterData = await getSemester({
                inst_id: instId,
                // semester: values.semester,
                start_date: normalizeDate(values.start_date),
                end_date: normalizeDate(values.end_date),
                limit: 1
            })

            if (semesterData.data.length > 0) {
                showNotification("แก้ไขภาคเรียนล้มเหลว!", "ระยะการเปิดปิดของภาคเรียนทับซ้อนกับภาคเรียนอื่น", "error");
                return;
            }

            const payload = {
                ...values,
                inst_id: Number(values.inst_id),
                start_date: normalizeDate(values.start_date),
                end_date: normalizeDate(values.end_date),
            };

            const res = await updateSemester(payload);

            setSemesterData([]);
            setHasMore(true);
            fetchData(0);

            if (res.success) {
                showNotification("แก้ไขภาคเรียนสำเร็จ!", "", "success");
            } else {
                showNotification("แก้ไขภาคเรียนล้มเหลว!", res.message, "error");
            }
        } catch (error) {
            console.error("แก้ไขภาคเรียนล้มเหลว:", error);
            showNotification("แก้ไขภาคเรียนล้มเหลว!", "An error occurred while updating the semester.", "error");
        }
    };

    const deleteSemesterData = async (semester_id: number) => {
        // Refresh data after delete (actual deletion is handled in EditSemesterModal)
        setSemesterData([]);
        setHasMore(true);
        fetchData(0);
    };


    useEffect(() => {
        if (instId) {
            fetchData(0);
        }
    }, [instId, filterParams]);

    const onScroll = () => {
        if (viewportRef.current) {
            const { scrollHeight, scrollTop, clientHeight } = viewportRef.current;

            // ตรวจสอบระยะ Scroll
            if (scrollHeight - scrollTop <= clientHeight + 50) {
                if (!loading && hasMore) {
                    const nextOffset = semesterData.length;
                    fetchData(nextOffset);
                    setOffset(nextOffset);
                }
            }
        }
    };

    const statusMap: Record<
        "pending" | "open" | "close",
        { label: string; color: string }
    > = {
        pending: {
            label: "รอเปิดเทอม",
            color: "#fab700ff", // yellow-400
        },
        open: {
            label: "เปิดเทอม",
            color: "#4ADE80", // green-400
        },
        close: {
            label: "ปิดเทอม",
            color: "#fb7185", // red-400
        },
    };

    const rows = semesterData.map((element) => (
        <Table.Tr
            key={element.semester_id}
            className='text-xs'
        >
            <Table.Td ta="center">{element.semester?.split("/")[1]}</Table.Td>
            <Table.Td ta="center">{element.semester?.split("/")[0]}</Table.Td>
            <Table.Td ta="center">{formatDate(element.start_date)}</Table.Td>
            <Table.Td ta="center">{formatDate(element.end_date)}</Table.Td>
            <Table.Td ta="center">
                <div
                    className="px-2 rounded-sm text-black w-max mx-auto border"
                    style={{
                        borderColor: statusMap[element.status as "pending" | "open" | "close"]?.color ?? "#9ca3af",
                        color: statusMap[element.status as "pending" | "open" | "close"]?.color ?? "#9ca3af",
                    }}
                >
                    {statusMap[element.status as "pending" | "open" | "close"]?.label ?? "ไม่ทราบสถานะ"}
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
                    ภาคการศึกษา
                </Text>

                <div className="flex items-center gap-2">
                    <Button
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
                            openAddSemesterModal();
                        }}
                    >
                        เพิ่มภาคเรียน
                    </Button>
                </div>
            </div>

            <ScrollArea
                h={200}
                onScrollPositionChange={onScroll}
                viewportRef={viewportRef}
                type="always"
                bd="1px solid gray.3"
                style={{ borderRadius: 8 }}
            >
                <Table stickyHeader horizontalSpacing="md" verticalSpacing="md" layout="fixed" >
                    <Table.Thead style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.08)' }}>
                        <Table.Tr>
                            <Table.Th w={40} ta="center">ปีการศึกษา</Table.Th>
                            <Table.Th w={10} ta="center">ภาคเรียน</Table.Th>
                            <Table.Th w={50} ta="center">วันเริ่มต้น</Table.Th>
                            <Table.Th w={50} ta="center">วันสิ้นสุด</Table.Th>
                            <Table.Th w={50} ta="center">สถานะ</Table.Th>
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
                        <Text size="sm" c="dimmed">ปีการศึกษาและภาคเรียนทั้งหมดถูกโหลดแล้ว</Text>
                    </Center>
                )}
            </ScrollArea>

            <Text size="xs" c="dimmed" mt="sm">
                โหลดแล้ว: {semesterData.length} จาก {semesterData[0]?.total_count} รายการ
            </Text>

            <SemesterEditModal
                semester={selectedSemester}
                opened={openedEditModal}
                close={closeEditModal}
                onSubmit={async (values) => {
                    await updateSemesterData(values);
                    closeEditModal();
                }}
                onDelete={async (semester_id) => {
                    await deleteSemesterData(semester_id);
                    closeEditModal();
                }}
            />

            <AddSemesterModal
                opened={openedAddSemester}
                close={closeAddSemester}
                onSubmit={async (values) => {
                    await addSemesterData(values);
                    closeAddSemester();
                }}
            />

            <FilterSemesterModal
                opened={openedFilterModal}
                close={closeFilterModal}
                onSubmit={(values) => {
                    setFilterParams(values);
                }}
                onClear={() => {
                    setFilterParams({});
                }}
                initialValues={filterParams}
            />

        </div>
    );
}