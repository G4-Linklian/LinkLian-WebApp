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
import { programFields } from '@/utils/interface/program.types';
import { decodeRegistrationToken } from '@/utils/authToken';
import { useRouter } from "next/router";
import { Modal, Button, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { PushRouter } from '@/utils/function/navigation';
import { getProgram, createProgram, updateProgram } from '@/utils/api/program';
import ProgramEditModal from '@/comps/registration/curriculum/program/EditProgramModal';
import AddProgramModal from '@/comps/registration/curriculum/program/AddProgramModal';
import { useNotification } from '@/comps/noti/notiComp';

const BATCH_SIZE = 20;

export default function leafTable({ onDataUpdate, onSetRootName }: any) {
    const [programData, setProgramData] = useState<programFields[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const router = useRouter();
    const [token, setToken] = useState<any | null>(false);
    const [instId, setInstId] = useState<number | null>(null);
    const [offset, setOffset] = useState<number>(0);
    const [programName, setProgramName] = useState<string>("");

    const [openedEditModal, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
    const [openedAddProgram, { open: openAddProgram, close: closeAddProgram }] = useDisclosure(false);
    const [selectedProgram, setSelectedProgram] =
        useState<programFields | null>(null);

    const { showNotification } = useNotification();
    const { root_id } = router.query;

    const openEditModals = (program: programFields) => {
        setSelectedProgram(program);
        openEditModal();
    };

    const openAddProgramModal = () => {
        openAddProgram();
    };

    const viewportRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        const token = decodeRegistrationToken();
        if (token && token.institution && token.institution.inst_id) {
            setInstId(token.institution.inst_id);
            if (token.institution.inst_type === "school") {
                setProgramName("ห้องเรียน");
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
            const programDatas = await getProgram({
                inst_id: instId,
                inst_type: token?.institution?.inst_type,
                parent_id: twig_id ? Number(twig_id) : Number(root_id),
                tree_type: "leaf",
                limit: BATCH_SIZE,
            })

            console.log("Fetched program data:", programDatas);

            setProgramData((prev) => [...prev, ...programDatas.data]);
            onDataUpdate([...programData, ...programDatas.data]);

            if (programDatas.data.length < BATCH_SIZE) {
                setHasMore(false);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData(0);
    }, [router.isReady, instId]);

    useEffect(() => {
        const fetchProgramNameData = async (offset: number) => {

            const { root_id, twig_id } = router.query;

            if (instId && root_id) {
                const rootProgramDatas = await getProgram({
                    inst_id: instId,
                    program_id: twig_id ? Number(twig_id) : Number(root_id),
                    tree_type: "root",
                    limit: 1,
                })

                onSetRootName(rootProgramDatas.data[0]?.program_name || "");
            }
        };

        fetchProgramNameData(0);

    }, [router.isReady, instId]);

    const addProgramData = async (values: programFields) => {
        if (!instId) return;

        try {
            const res = await createProgram({
                ...values,
                inst_id: instId,
            });

            setProgramData([]);
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

    const updateProgramData = async (values: programFields) => {
        if (!instId) return;

        try {

            const payload = {
                ...values,
                inst_id: Number(values.inst_id),
            };

            const res = await updateProgram(payload);

            setProgramData([]);
            setHasMore(true);
            fetchData(0);

            if (res.success) {
                showNotification("แก้ไข" + programName + "สำเร็จ!", "", "success");
            } else {
                showNotification("แก้ไข" + programName + "ล้มเหลว!", res.message, "error");
            }

        } catch (error) {
            console.error("Update program failed:", error);
            showNotification("แก้ไข" + programName + "ล้มเหลว!", "An error occurred while updating the program.", "error");
        }
    };


    const onScroll = () => {
        if (viewportRef.current) {
            const { scrollHeight, scrollTop, clientHeight } = viewportRef.current;

            // ตรวจสอบระยะ Scroll
            if (scrollHeight - scrollTop <= clientHeight + 50) {
                if (!loading && hasMore) {
                    const nextOffset = programData.length;
                    fetchData(nextOffset);
                    setOffset(nextOffset);
                }
            }
        }
    };


    const rows = programData.map((element, index) => (
        <Table.Tr
            key={element.program_id}
            className='text-xs'
        >
            <Table.Td ta="center">{index + 1}</Table.Td>
            <Table.Td ta="center">{element.program_name}</Table.Td>
            <Table.Td ta="center">{element.remark ? element.remark : "-"}</Table.Td>

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
                    {programName}
                </Text>
                <Button
                    size="xs"
                    radius="md"
                    onClick={() => {
                        openAddProgramModal();
                    }}
                >
                    เพิ่ม{programName}
                </Button>
            </div>

            <ScrollArea
                h={250}
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
                            <Table.Th w={40} ta="center">ชื่อ{programName}</Table.Th>
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
                        <Text size="sm" c="dimmed">{programName}ทั้งหมดถูกโหลดแล้ว</Text>
                    </Center>
                )}
            </ScrollArea>

            <Text size="xs" c="dimmed" mt="sm">
                โหลดแล้ว: {programData.length} จาก {programData[0]?.total_count} รายการ
            </Text>

            <ProgramEditModal
                program={selectedProgram}
                opened={openedEditModal}
                close={closeEditModal}
                onSubmit={async (values) => {
                    await updateProgramData(values);
                    closeEditModal();
                }}
            />

            <AddProgramModal
                opened={openedAddProgram}
                close={closeAddProgram}
                onSubmit={async (values) => {
                    await addProgramData(values);
                    closeAddProgram();
                }}
                token={token}
            />

        </div>
    );
}