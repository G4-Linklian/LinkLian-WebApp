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
import { subjectFields } from '@/utils/interface/subject.types';
import { decodeRegistrationToken } from '@/utils/authToken';
import { useRouter } from "next/router";
import { Modal, Button, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { getSubject, createSubject, updateSubject } from '@/utils/api/subject';
import AddSubjectModal from '@/comps/registration/curriculum/subject/AddSubjectModal';
import SubjectEditModal from '@/comps/registration/curriculum/subject/EditSubjectModal';
import { getLearningArea } from '@/utils/api/learningArea';
import { useNotification } from '@/comps/noti/notiComp';

const BATCH_SIZE = 20;

export default function subjectTable() {
    const [subjectData, setSubjectData] = useState<subjectFields[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const router = useRouter();
    const [token, setToken] = useState<any | null>(false);
    const [instId, setInstId] = useState<number | null>(null);
    const [offset, setOffset] = useState<number>(0);

    const [openedEditModal, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
    const [openedAddSubject, { open: openAddSubject, close: closeAddSubject }] = useDisclosure(false);
    const [selectedSubject, setSelectedSubject] =
        useState<subjectFields | null>(null);

    const { showNotification } = useNotification();
    
    const [learningAreaOptions, setLearningAreaOptions] = useState<{ value: string; label: string }[]>([]);

    const openEditModals = (subject: subjectFields) => {
        setSelectedSubject(subject);
        openEditModal();
    };

    const openAddSubjectModal = () => {
        openAddSubject();
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
            const subjectData = await getSubject({
                inst_id: instId,
                sort_by: "learning_area_id",
                sort_order: "desc",
                limit: BATCH_SIZE,
                offset: offset,
            })

            setSubjectData((prev) => [...prev, ...subjectData.data]);

            if (subjectData.data.length < BATCH_SIZE) {
                setHasMore(false);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData(0);
    }, [instId]);

    const addSubjectData = async (values: subjectFields) => {
        if (!instId) return;

        try {
            const res = await createSubject({
                ...values
            });

            setSubjectData([]);
            setHasMore(true);
            fetchData(offset);

            if (res.success) {
                showNotification("เพิ่มวิชาสำเร็จ!", "", "success");
            } else {
                showNotification("เพิ่มวิชาล้มเหลว!", res.message, "error");
            }
        } catch (error) {
            console.error("Create subject failed:", error);
            showNotification("เพิ่มวิชาล้มเหลว!", "An error occurred while creating the subject.", "error");
        }
    };

    const updateSubjectData = async (values: subjectFields) => {
        if (!instId) return;

        try {

            const payload = {
                ...values,
                inst_id: Number(values.inst_id),
            };

            const res = await updateSubject(payload);

            setSubjectData([]);
            setHasMore(true);
            fetchData(0);

            if (res.success) {
                showNotification("แก้ไขวิชาสำเร็จ!", "", "success");
            } else {
                showNotification("แก้ไขวิชาล้มเหลว!", res.message, "error");
            }
        } catch (error) {
            console.error("Update subject failed:", error);
            showNotification("แก้ไขวิชาล้มเหลว!", "An error occurred while updating the subject.", "error");
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
                    const nextOffset = subjectData.length;
                    fetchData(nextOffset);
                    setOffset(nextOffset);
                }
            }
        }
    };


    const rows = subjectData.map((element) => (
        <Table.Tr
            key={element.subject_id}
            className='text-xs'
        >
            <Table.Td ta="center">{element.subject_code}</Table.Td>
            <Table.Td ta="center">{element.name_th}</Table.Td>
            <Table.Td ta="center">{element.learning_area_name}</Table.Td>
            <Table.Td ta="center">{element.credit}</Table.Td>
            <Table.Td ta="center">{element.hour_per_week}</Table.Td>

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
                    รายวิชาทั้งหมด
                </Text>
                <Button
                    size="xs"
                    radius="md"
                    onClick={() => {
                        openAddSubjectModal();
                    }}
                >
                    เพิ่มรายวิชา
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
                <Table stickyHeader horizontalSpacing="md" verticalSpacing="sm" layout="fixed" >
                    <Table.Thead style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.08)' }}>
                        <Table.Tr>
                            <Table.Th w={40} ta="center">รหัสวิชา</Table.Th>
                            <Table.Th w={60} ta="center">ชื่อวิชา</Table.Th>
                            <Table.Th w={50} ta="center">กลุ่มการเรียนรู้</Table.Th>
                            <Table.Th w={30} ta="center">หน่วยกิต</Table.Th>
                            <Table.Th w={40} ta="center">ชั่วโมง/สัปดาห์</Table.Th>
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
                        <Text size="sm" c="dimmed">รายวิชาทั้งหมดถูกโหลดแล้ว</Text>
                    </Center>
                )}
            </ScrollArea>

            <Text size="xs" c="dimmed" mt="sm">
                โหลดแล้ว: {subjectData.length} จาก {subjectData[0]?.total_count} รายการ
            </Text>

            <SubjectEditModal
                subject={selectedSubject}
                opened={openedEditModal}
                close={closeEditModal}
                onSubmit={async (values) => {
                    await updateSubjectData(values);
                    closeEditModal();
                }}
                learningAreaOptions={learningAreaOptions}
            />

            <AddSubjectModal
                opened={openedAddSubject}
                close={closeAddSubject}
                onSubmit={async (values) => {
                    await addSubjectData(values);
                    closeAddSubject();
                }}
                learningAreaOptions={learningAreaOptions}
            />

        </div>
    );
}