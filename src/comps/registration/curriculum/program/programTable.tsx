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
    IconEye,
    IconSearch,
} from '@tabler/icons-react';
import { programFields } from '@/utils/interface/program.types';
import { decodeRegistrationToken } from '@/utils/authToken';
import { useRouter } from "next/router";
import { Modal, Button, Group } from "@mantine/core";
import { useDisclosure, useDebouncedValue } from "@mantine/hooks";
import { PushRouter } from '@/utils/function/navigation';
import { getProgram, createProgram, updateProgram } from '@/utils/api/program';
import EditProgramModal from '@/comps/registration/curriculum/program/EditProgramModal';
import AddProgramModal from '@/comps/registration/curriculum/program/AddProgramModal';
import { useNotification } from '@/comps/noti/notiComp';

const BATCH_SIZE = 6;

export default function programTable() {
    const [programData, setProgramData] = useState<programFields[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const router = useRouter();
    const [token, setToken] = useState<any | null>(false);
    const [instId, setInstId] = useState<number | null>(null);
    const [offset, setOffset] = useState<number>(0);
    const [programName, setProgramName] = useState<string>("");

    // Debounce Search
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm] = useDebouncedValue(searchTerm, 500);

    const [openedEditModal, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
    const [openedAddProgram, { open: openAddProgram, close: closeAddProgram }] = useDisclosure(false);
    const [selectedProgram, setSelectedProgram] =
        useState<programFields | null>(null);

    const { showNotification } = useNotification();

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
                setProgramName("แผนการเรียน");
            } else if (token.institution.inst_type === "uni") {
                setProgramName("คณะ");
            }
        }
        setToken(token);
    }, [router.isReady]);


    const fetchData = async (offset: number) => {
        setLoading(true);

        if (instId) {
            const programDatas = await getProgram({
                inst_id: instId,
                inst_type: token?.institution?.inst_type,
                tree_type: "root",
                children_count: true,
                limit: BATCH_SIZE,
                offset: offset,
                keyword: debouncedSearchTerm
            })

            const newData = programDatas?.data || [];

            if (offset === 0) {
                setProgramData(newData);
            } else {
                setProgramData((prev) => [...prev, ...newData]);
            }

            if (newData.length < BATCH_SIZE) {
                setHasMore(false);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData(0);
    }, [instId, debouncedSearchTerm]);

    const addProgramData = async (values: programFields) => {
        if (!instId) return;

        try {

            const programDatas = await getProgram({
                inst_id: instId,
                tree_type: "root",
                program_name: values.program_name,
            })

            if (programDatas.data.length > 0) {
                showNotification("สร้าง" + programName + "ล้มเหลว!", "มี" + programName + "นี้อยู่ในระบบแล้ว", "error");
                return;
            }

            const res = await createProgram({
                ...values,
                inst_id: instId,
            });

            setProgramData([]);
            setHasMore(true);
            fetchData(0);

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

            const programDatas = await getProgram({
                inst_id: instId,
                tree_type: "root",
                program_name: values.program_name,
            })

            if (programDatas.data.length > 0) {
                showNotification("แก้ไข" + programName + "ล้มเหลว!", "มี" + programName + "นี้อยู่ในระบบแล้ว", "error");
                return;
            }

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
            <Table.Td ta="center">{element.children_count}</Table.Td>

            <Table.Td ta="center" className='flex justify-center gap-2'>
                <IconEye size={20} stroke={2} color='#636363ff'
                    onClick={() => {
                        if (token.institution.inst_type === "school") {
                            PushRouter(router, "/registration/curriculum/leaf", "root_id", element.program_id);
                        } else if (token.institution.inst_type === "uni") {
                            PushRouter(router, "/registration/curriculum/twig", "root_id", element.program_id);
                        }
                    }
                    }
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
                <Text size="xl" fw={500}>
                    {programName}
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
                            openAddProgramModal();
                        }}
                    >
                        เพิ่ม{programName}
                    </Button>
                </div>
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
                            <Table.Th w={70} ta="center">หมายเหตุ</Table.Th>
                            <Table.Th w={30} ta="center">จำนวน{programName === "แผนการเรียน" ? "ห้องเรียน" : "สาขา"}</Table.Th>
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



            {token && (
                <AddProgramModal
                    opened={openedAddProgram}
                    close={closeAddProgram}
                    onSubmit={async (values) => {
                        await addProgramData(values);
                        closeAddProgram();
                    }}
                    token={token}
                />
            )}

            {token && (
                <EditProgramModal
                    program={selectedProgram}
                    opened={openedEditModal}
                    close={closeEditModal}
                    onSubmit={async (values) => {
                        await updateProgramData(values);
                        closeEditModal();
                    }}
                    onDelete={(program_id) => {
                        setProgramData([]);
                        setHasMore(true);
                        fetchData(0);
                    }}
                />
            )}


        </div>
    );
}