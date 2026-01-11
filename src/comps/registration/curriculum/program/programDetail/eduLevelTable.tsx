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
import { eduLevelFields } from '@/utils/interface/eduLevel.types';
import { decodeRegistrationToken } from '@/utils/authToken';
import { useRouter } from "next/router";
import { Modal, Button, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useNotification } from '@/comps/noti/notiComp';
import { getEduLevel, getEduLevelMaster, createEduLevelNorm, deleteEduLevelNorm  } from '@/utils/api/eduLevel';
import AddEduLevelModal from '@/comps/registration/curriculum/program/programDetail/AddEduLevelModal';
import EduLevelEditModal from '@/comps/registration/curriculum/program/programDetail/EditEduLevelModal';

const BATCH_SIZE = 20;

export default function eduLevelTable({programData} : any) {
    const [eduLevelData, setEduLevelData] = useState<eduLevelFields[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const router = useRouter();
    const [token, setToken] = useState<any | null>(false);
    const [instId, setInstId] = useState<number | null>(null);
    const [offset, setOffset] = useState<number>(0);
    const [programName, setProgramName] = useState<string>("");

    const [openedEditModal, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
    const [openedAddEduLevel, { open: openAddEduLevel, close: closeAddEduLevel }] = useDisclosure(false);
    const [selectedEduLevel, setSelectedEduLevel] =
        useState<eduLevelFields | null>(null);

    const [eduLevelOptions, setEduLevelOptions] = useState<{ value: string; label: string }[]>([]);

    const { showNotification } = useNotification();
    const { root_id } = router.query;

    const openEditModals = (eduLevel: eduLevelFields) => {
        setSelectedEduLevel(eduLevel);
        console.log("Selected eduLevel for edit:", eduLevel);
        openEditModal();
    };

    const openAddEduLevelModal = () => {
        openAddEduLevel();
    };

    const viewportRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        const token = decodeRegistrationToken();
        if (token && token.institution && token.institution.inst_id) {
            setInstId(token.institution.inst_id);
            if (token.institution.inst_type === "school") {
                setProgramName("ห้อง");
            } else if (token.institution.inst_type === "uni") {
                setProgramName("สาขา");
            }
        }
        setToken(token);
    }, [router.isReady]);


    const fetchData = async (offset: number) => {
        setLoading(true);

        const { root_id, twig_id } = router.query;

        if (instId && root_id) {
            const eduLevelDatas = await getEduLevel({
                inst_id: instId,
                parent_id: twig_id ? Number(twig_id) : Number(root_id),
                offset: offset,
                limit: BATCH_SIZE,
                sort_by: "edu_lev_id",
            })

            setEduLevelData((prev) => [...prev, ...eduLevelDatas.data]);

            if (eduLevelDatas.data.length < BATCH_SIZE) {
                setHasMore(false);
            }
        }
        setLoading(false);
    };

    const addEduLevelData = async (values: eduLevelFields) => {
        if (!instId) return;

        try {
            const res = await createEduLevelNorm({
                ...values,
            });

            setEduLevelData([]);
            setHasMore(true);
            fetchData(offset);

            if (res.success) {
                showNotification("สร้าง" + programName + "สำเร็จ!", "", "success");
            } else {
                showNotification("สร้าง" + programName + "ล้มเหลว!", res.message, "error");
            }
        } catch (error) {
            console.error("Create program failed:", error);
            showNotification("สร้าง" + programName + "ล้มเหลว!", "An error occurred while creating the program.", "error");
        }
    };

    useEffect(() => {
        fetchData(0);
    }, [router.isReady, instId]);

    useEffect(() => {
        const fetchLearningAreas = async () => {
            try {

                if (instId) {
                    const eduLevelData = await getEduLevelMaster({
                        flag_valid : true,
                    });

                    const options = eduLevelData.data.map((area: any) => ({
                        value: area.edu_lev_id.toString(),
                        label: area.level_name,
                    }));

                    setEduLevelOptions(options);
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
                    const nextOffset = eduLevelData.length;
                    fetchData(nextOffset);
                    setOffset(nextOffset);
                }
            }
        }
    };


    const rows = eduLevelData.map((element, index) => (
        <Table.Tr
            key={String(element.edu_lev_id) + String(element.program_id)}
            className='text-xs'
        >
            <Table.Td ta="center">{index + 1}</Table.Td>
            <Table.Td ta="center">{element.level_name}</Table.Td>
            <Table.Td ta="center">{element.program_name}</Table.Td>
            <Table.Td ta="center">{element.level_name + " / " + element.program_name}</Table.Td>

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
                    ชั้นเรียน
                </Text>
                <Button
                    size="xs"
                    radius="md"
                    onClick={() => {
                        openAddEduLevelModal();
                    }}
                >
                    เพิ่มชั้นเรียน
                </Button>
            </div>

            <ScrollArea
                h={450}
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
                            <Table.Th w={40} ta="center">ระดับชั้น</Table.Th>
                            <Table.Th w={40} ta="center">{programName}</Table.Th>
                            <Table.Th w={40} ta="center">ชื่อรวม</Table.Th>
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
                        <Text size="sm" c="dimmed">{programName}ทั้งหมดถูกโหลดแล้ว</Text>
                    </Center>
                )}
            </ScrollArea>

            <Text size="xs" c="dimmed" mt="sm">
                โหลดแล้ว: {eduLevelData.length} จาก {eduLevelData[0]?.total_count} รายการ
            </Text>

            <EduLevelEditModal
                eduLevel={selectedEduLevel}
                opened={openedEditModal}
                close={closeEditModal}
                onSubmit={async (values) => {
                    // await updateProgramData(values);
                    closeEditModal();
                }}
                eduLevelData={eduLevelOptions}
                ProgramData={programData}
            />

            <AddEduLevelModal
                opened={openedAddEduLevel}
                close={closeAddEduLevel}
                onSubmit={async (values) => {
                    await addEduLevelData(values);
                    // console.log("Add semester values:", values);
                    closeAddEduLevel();
                }}
                token={token}
                eduLevelData={eduLevelOptions}
                ProgramData={programData}
            />

        </div>
    );
}