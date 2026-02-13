import { useState, useRef, useEffect } from 'react';
import {
    Table,
    ScrollArea,
    Text,
    Loader,
    Center,
    TextInput
} from '@mantine/core';
import {
    IconEdit,
    IconSearch,
} from '@tabler/icons-react';
import { learningAreaFields } from '@/utils/interface/learningArea.types';
import { decodeRegistrationToken } from '@/utils/authToken';
import { useRouter } from "next/router";
import { Modal, Button, Group } from "@mantine/core";
import LearningAreaEditModal from '@/comps/registration/curriculum/learningArea/EditLearningAreaModal';
import LearningAreaModal from '@/comps/registration/curriculum/learningArea/AddLearningAreaModal';
import { useDisclosure, useDebouncedValue } from "@mantine/hooks";
import { PushRouter } from '@/utils/function/navigation';
import { getLearningArea, createLearningArea, updateLearningArea } from '@/utils/api/learningArea';
import { useNotification } from '@/comps/noti/notiComp';

const BATCH_SIZE = 10;

export default function learningAreaTable() {
    const [learningAreaData, setLearningAreaData] = useState<learningAreaFields[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const router = useRouter();
    const [token, setToken] = useState<any | null>(false);
    const [instId, setInstId] = useState<number | null>(null);
    const [offset, setOffset] = useState<number>(0);

    const [openedEditModal, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
    const [openedAddLearningArea, { open: openAddLearningArea, close: closeAddLearningArea }] = useDisclosure(false);
    const [selectedLearningArea, setSelectedLearningArea] =
        useState<learningAreaFields | null>(null);

    // Debounce Search
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm] = useDebouncedValue(searchTerm, 500);

    const { showNotification } = useNotification();

    const openEditModals = (learningArea: learningAreaFields) => {
        setSelectedLearningArea(learningArea);
        openEditModal();
    };

    const openAddLearningAreaModal = () => {
        openAddLearningArea();
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
            const learningAreaData = await getLearningArea({
                inst_id: instId,
                // sort_by: "end_date",
                sort_order: "desc",
                limit: BATCH_SIZE,
                offset: offset,
                subject_count: true,
                keyword: debouncedSearchTerm
            })

            if (offset === 0) {
                setLearningAreaData(learningAreaData.data);
            } else {
                setLearningAreaData((prev) => [...prev, ...learningAreaData.data]);
            }

            if (learningAreaData.data.length < BATCH_SIZE) {
                setHasMore(false);
            }
        }
        setLoading(false);
    };

    const addLearningAreaData = async (values: learningAreaFields) => {
        if (!instId) return;

        try {
            const res = await createLearningArea({
                ...values,
                inst_id: instId,
            });

            setLearningAreaData([]);
            setHasMore(true);
            fetchData(offset);

            if (res.success) {
                showNotification("สร้างกลุ่มการเรียนรู้สำเร็จ!", "", "success");
            } else {
                showNotification("สร้างกลุ่มการเรียนรู้ล้มเหลว!", res.message, "error");
            }
        } catch (error) {
            console.error("Create learning area failed:", error);
            showNotification("สร้างกลุ่มการเรียนรู้ล้มเหลว!", "An error occurred while creating the learning area.", "error");
        }
    };

    const updateLearningAreaData = async (values: learningAreaFields) => {
        if (!instId) return;

        try {

            const payload = {
                ...values,
                inst_id: Number(values.inst_id),
            };

            const res = await updateLearningArea(payload);

            setLearningAreaData([]);
            setHasMore(true);
            fetchData(0);

            if (res.success) {
                showNotification("แก้ไขกลุ่มการเรียนรู้สำเร็จ!", "", "success");
            } else {
                showNotification("แก้ไขกลุ่มการเรียนรู้ล้มเหลว!", res.message, "error");
            }
        } catch (error) {
            console.error("Update learning area failed:", error);
            showNotification("แก้ไขกลุ่มการเรียนรู้ล้มเหลว!", "An error occurred while updating the learning area.", "error");
        }
    };

    const deleteLearningAreaData = async (learning_area_id: number) => {
        // Refresh data after delete (actual deletion is handled in EditLearningAreaModal)
        setLearningAreaData([]);
        setHasMore(true);
        fetchData(0);
    };


    useEffect(() => {
        fetchData(0);
    }, [instId, debouncedSearchTerm]);

    const onScroll = () => {
        if (viewportRef.current) {
            const { scrollHeight, scrollTop, clientHeight } = viewportRef.current;

            // ตรวจสอบระยะ Scroll
            if (scrollHeight - scrollTop <= clientHeight + 50) {
                if (!loading && hasMore) {
                    const nextOffset = learningAreaData.length;
                    fetchData(nextOffset);
                    setOffset(nextOffset);
                }
            }
        }
    };


    const rows = learningAreaData.map((element, index) => (
        <Table.Tr
            key={element.learning_area_id}
            className='text-xs'
        >
            <Table.Td ta="center">{index + 1}</Table.Td>
            <Table.Td ta="center">{element.learning_area_name}</Table.Td>
            <Table.Td ta="center">{element.remark ? element.remark : "-"}</Table.Td>
            <Table.Td ta="center">{element.subject_count}</Table.Td>

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
                    กลุ่มการเรียนรู้
                </Text>

                <div className="flex items-center gap-2">
                    <TextInput
                        placeholder="ค้นหา..."
                        size="xs"
                        radius="md"
                        leftSection={<IconSearch size={14} />}
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.currentTarget.value)}
                    />

                    <Button
                        size="xs"
                        radius="md"
                        onClick={() => {
                            openAddLearningAreaModal();
                        }}
                    >
                        เพิ่มกลุ่มการเรียนรู้
                    </Button>
                </div>
            </div>

            <ScrollArea
                h={225}
                onScrollPositionChange={onScroll}
                viewportRef={viewportRef}
                type="always"
                bd="1px solid gray.3"
                style={{ borderRadius: 8 }}
            >
                <Table stickyHeader horizontalSpacing="md" verticalSpacing="sm" layout="fixed" >
                    <Table.Thead style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.08)' }}>
                        <Table.Tr>
                            <Table.Th w={10} ta="center">ลำดับ</Table.Th>
                            <Table.Th w={40} ta="center">ชื่อกลุ่มการเรียนรู้</Table.Th>
                            <Table.Th w={60} ta="center">หมายเหตุ</Table.Th>
                            <Table.Th w={40} ta="center">จำนวนวิชาทั้งหมด</Table.Th>
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
                        <Text size="sm" c="dimmed">กลุ่มการเรียนรู้ทั้งหมดถูกโหลดแล้ว</Text>
                    </Center>
                )}
            </ScrollArea>

            <Text size="xs" c="dimmed" mt="sm">
                โหลดแล้ว: {learningAreaData.length} จาก {learningAreaData[0]?.total_count} รายการ
            </Text>

            <LearningAreaEditModal
                learningArea={selectedLearningArea}
                opened={openedEditModal}
                close={closeEditModal}
                onSubmit={async (values) => {
                    await updateLearningAreaData(values);
                    closeEditModal();
                }}
                onDelete={async (learning_area_id) => {
                    await deleteLearningAreaData(learning_area_id);
                    closeEditModal();
                }}
            />

            <LearningAreaModal
                opened={openedAddLearningArea}
                close={closeAddLearningArea}
                onSubmit={async (values) => {
                    await addLearningAreaData(values);
                    closeAddLearningArea();
                }}
            />

        </div>
    );
}