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
    IconFilter,
} from '@tabler/icons-react';
import { sectionFields, SectionSchedulePayload } from '@/utils/interface/section.types';
import { decodeRegistrationToken } from '@/utils/authToken';
import { useRouter } from "next/router";
import { Modal, Button, Group } from "@mantine/core";
import { useDisclosure, useDebouncedValue } from "@mantine/hooks";
import { PushRouter } from '@/utils/function/navigation';
import { getSectionMaster, updateSectionSchedule, createSectionSchedule, deleteSection } from '@/utils/api/section';
import AddSectionModal from '@/comps/registration/schedule/section/AddSectionModal';
import EditSectionModal from '@/comps/registration/schedule/section/EditSectionModal';
import FilterSectionModal from '@/comps/registration/schedule/section/FilterSectionModal';
import { useNotification } from '@/comps/noti/notiComp';
import { dayOfWeekFormatter, timeFormatter, normalizeTime } from '@/config/formatters';

const BATCH_SIZE = 20;

export default function sectionTable({ semesterData }: any) {
    const [sectionData, setSectionData] = useState<sectionFields[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const router = useRouter();
    const [token, setToken] = useState<any | null>(false);
    const [instId, setInstId] = useState<number | null>(null);
    const [offset, setOffset] = useState<number>(0);

    const [openedEditModal, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
    const [openedAddSection, { open: openAddSection, close: closeAddSection }] = useDisclosure(false);
    const [openedFilterModal, { open: openFilterModal, close: closeFilterModal }] = useDisclosure(false);
    const [selectedSection, setSelectedSection] =
        useState<sectionFields | null>(null);
    const [filterParams, setFilterParams] = useState<sectionFields>({});

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

    const { showNotification } = useNotification();

    const openEditModals = (section: sectionFields) => {
        setSelectedSection(section);
        openEditModal();
    };

    const openAddSectionModal = () => {
        openAddSection();
    };

    const viewportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const token = decodeRegistrationToken();
        setToken(token);
        if (token && token.institution && token.institution.inst_id) {
            setInstId(token.institution.inst_id);
        }

    }, [router.isReady]);

    const fetchData = async (offset: number, reset = false) => {
        setLoading(true);

        const semesterId = router.query.semester_id;

        if (instId && semesterId) {
            const sectionDatas = await getSectionMaster({
                inst_id: instId,
                semester_id: Number(semesterId),
                sort_by: "section_id",
                sort_order: "asc",
                limit: BATCH_SIZE,
                offset,
                ...filterParams
            });

            setSectionData((prev) =>
                reset ? sectionDatas.data : [...prev, ...sectionDatas.data]
            );

            setHasMore(sectionDatas.data.length === BATCH_SIZE);
        }

        setLoading(false);
    };


    useEffect(() => {
        if (!router.isReady || !instId) return;

        setSectionData([]);
        setHasMore(true);
        fetchData(0, true);
    }, [instId, router.isReady, router.query.semester_id, filterParams]);

    const addSectionData = async (values: sectionFields) => {
        const semesterId = router.query.semester_id;

        if (!semesterId) {
            showNotification("เพิ่มกลุ่มเรียนล้มเหลว!", "กรุณาเลือกภาคการศึกษาก่อนเพิ่มกลุ่มเรียน", "error");
            return;
        }

        try {

            const sectionData = await getSectionMaster({
                semester_id: Number(semesterId),
                subject_id: Number(values.subject_id),
                section_name: values.section_name,
                limit: 1,
            });

            if (sectionData.data.length > 0 && sectionData.data[0].section_id !== values.section_id) {
                showNotification("แก้ไขกลุ่มเรียนล้มเหลว!", "มีชื่อกลุ่มเรียนนี้อยู่ในระบบแล้ว", "error");
                return;
            }

            const payload = {
                semester_id: Number(semesterId),
                subject_id: Number(values.subject_id),
                section_name: values.section_name,
            };

            const res = await createSectionSchedule(payload);

            setSectionData([]);
            setHasMore(true);
            fetchData(offset);

            if (res.success) {
                showNotification("เพิ่มกลุ่มเรียนสำเร็จ!", "", "success");
            } else {
                showNotification("เพิ่มกลุ่มเรียนล้มเหลว!", res.message, "error");
            }
        } catch (error) {
            console.error("Create section failed:", error);
            showNotification("เพิ่มกลุ่มเรียนล้มเหลว!", "An error occurred while creating the section.", "error");
        }
    };

    const updateSectionData = async (values: sectionFields) => {
        const semesterId = router.query.semester_id;

        if (!semesterId) {
            showNotification("เพิ่มกลุ่มเรียนล้มเหลว!", "กรุณาเลือกภาคการศึกษาก่อนเพิ่มกลุ่มเรียน", "error");
            return;
        }

        try {
            const sectionData = await getSectionMaster({
                semester_id: Number(semesterId),
                subject_id: Number(values.subject_id),
                section_name: values.section_name,
                limit: 1,
            });

            if (sectionData.data.length > 0 && sectionData.data[0].section_id !== values.section_id) {
                showNotification("แก้ไขกลุ่มเรียนล้มเหลว!", "มีชื่อกลุ่มเรียนนี้อยู่ในระบบแล้ว", "error");
                return;
            }

            const payload = {
                section_id: Number(values.section_id),
                semester_id: Number(semesterId),
                subject_id: Number(values.subject_id),
                section_name: values.section_name,
            };

            const res = await updateSectionSchedule(payload);

            setSectionData([]);
            setHasMore(true);
            fetchData(0);

            if (res.success) {
                showNotification("แก้ไขกลุ่มเรียนสำเร็จ!", "", "success");
            } else {
                showNotification("แก้ไขกลุ่มเรียนล้มเหลว!", res.message, "error");
            }
        } catch (error) {
            console.error("Update section failed:", error);
            showNotification("แก้ไขกลุ่มเรียนล้มเหลว!", "An error occurred while updating the section.", "error");
        }
    };

    const deleteSectionData = async () => {
        setSectionData([]);
        setHasMore(true);
        fetchData(0, true);
    };


    const onScroll = () => {
        if (viewportRef.current) {
            const { scrollHeight, scrollTop, clientHeight } = viewportRef.current;

            // ตรวจสอบระยะ Scroll
            if (scrollHeight - scrollTop <= clientHeight + 50) {
                if (!loading && hasMore) {
                    const nextOffset = sectionData.length;
                    fetchData(nextOffset);
                    setOffset(nextOffset);
                }
            }
        }
    };


    const rows = sectionData.map((element, index) => (
        <Table.Tr
            key={element.section_id}
            className='text-xs'
        >
            <Table.Td ta="center">{index + 1}</Table.Td>
            <Table.Td ta="center">{element.subject_code}</Table.Td>
            <Table.Td ta="center">{element.name_th}</Table.Td>
            <Table.Td ta="center">{element.learning_area_name}</Table.Td>
            <Table.Td ta="center">{element.hour_per_week}</Table.Td>
            <Table.Td ta="center">{element.section_name}</Table.Td>


            <Table.Td ta="center" className='flex justify-center gap-2'>
                <IconEye size={20} stroke={2} color='#636363ff'
                    onClick={() =>
                        PushRouter(router, "/registration/scheduling/section", "section_id", element.section_id)
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
                    กลุ่มเรียนทั้งหมด
                </Text>

                <div className="flex items-center gap-2">
                    <TextInput
                        id="search-section-input"
                        placeholder="ค้นหา..."
                        size="xs"
                        radius="md"
                        leftSection={<IconSearch size={14} />}
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.currentTarget.value)}
                    />

                    <Button
                        id="filter-button"
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
                        id="add-section-button"
                        size="xs"
                        radius="md"
                        onClick={() => {
                            openAddSectionModal();
                        }}
                    >
                        เพิ่มกลุ่มเรียน
                    </Button>
                </div>
            </div>

            <ScrollArea
                h={550}
                onScrollPositionChange={onScroll}
                viewportRef={viewportRef}
                type="always"
                bd="1px solid gray.3"
                style={{ borderRadius: 8 }}
            >
                <Table stickyHeader horizontalSpacing="md" verticalSpacing="sm" layout="fixed" id="section-table">
                    <Table.Thead style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.08)' }}>
                        <Table.Tr>
                            <Table.Th w={5} ta="center">ลำดับ</Table.Th>
                            <Table.Th w={20} ta="center">รหัสวิชา</Table.Th>
                            <Table.Th w={40} ta="center">ชื่อวิชา</Table.Th>
                            <Table.Th w={40} ta="center">กลุ่มการเรียนรู้</Table.Th>
                            <Table.Th w={30} ta="center">ชั่วโมง/สัปดาห์</Table.Th>
                            <Table.Th w={40} ta="center">ชื่อ Section</Table.Th>
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
                        <Text size="sm" c="dimmed">Section การเรียนทั้งหมดถูกโหลดแล้ว</Text>
                    </Center>
                )}
            </ScrollArea>

            <Text size="xs" c="dimmed" mt="sm">
                โหลดแล้ว: {sectionData.length} จาก {sectionData[0]?.total_count} รายการ
            </Text>

            <EditSectionModal
                section={selectedSection}
                opened={openedEditModal}
                close={closeEditModal}
                onSubmit={async (values) => {
                    await updateSectionData(values);
                    closeEditModal();
                }}
                onDelete={deleteSectionData}
                semesterData={semesterData}
                token={token}
            />

            <AddSectionModal
                opened={openedAddSection}
                close={closeAddSection}
                onSubmit={async (values) => {
                    await addSectionData(values);
                    closeAddSection();
                }}
                semesterData={semesterData}
                token={token}
            />

            <FilterSectionModal
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