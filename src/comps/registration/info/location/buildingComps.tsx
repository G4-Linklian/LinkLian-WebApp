import { useState, useRef, useEffect } from 'react';
import { Badge, ThemeIcon, ActionIcon, Menu, rem } from '@mantine/core';
import { IconBuildingBank, IconEdit, IconArrowRight, IconSearch } from '@tabler/icons-react';
import { buildingFields } from '@/utils/interface/building.types';
import { decodeRegistrationToken } from '@/utils/authToken';
import { useRouter } from "next/router";
import {
    Modal,
    Button,
    Group,
    Card,
    Text,
    Loader,
    Center,
    TextInput
} from "@mantine/core";
import { useDisclosure, useDebouncedValue } from "@mantine/hooks";
import { PushRouter } from '@/utils/function/navigation';
import { getBuilding, createBuilding, updateBuilding } from '@/utils/api/building';
import AddBuildingModal from '@/comps/registration/info/location/AddBuildingModal';
import EditBuildingModal from '@/comps/registration/info/location/EditBuildingModal';
import { useNotification } from '@/comps/noti/notiComp';

export default function BuildingComps() {
    const [buildingData, setBuildingData] = useState<buildingFields[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();
    const [token, setToken] = useState<any | null>(false);
    const [instId, setInstId] = useState<number | null>(null);
    const { showNotification } = useNotification();

    const [openedEditModal, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
    const [openedAddBuilding, { open: openAddBuilding, close: closeAddBuilding }] = useDisclosure(false);
    const [selectedBuilding, setSelectedBuilding] =
        useState<buildingFields | null>(null);

    // Debounce Search
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm] = useDebouncedValue(searchTerm, 500);

    const openEditBuildingModal = (building: buildingFields) => {
        setSelectedBuilding(building);
        openEditModal();
    };

    const openAddBuildingModal = () => {
        openAddBuilding();
    };

    const viewportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const token = decodeRegistrationToken();
        setToken(token);
        if (token && token.institution && token.institution.inst_id) {
            setInstId(token.institution.inst_id);
        }
    }, [router.isReady]);


    const fetchData = async () => {
        setLoading(true);

        if (instId) {
            const buildingDatas = await getBuilding({
                inst_id: instId,
                sort_by: "building_no",
                sort_order: "asc",
                keyword: debouncedSearchTerm
            })

            setBuildingData(buildingDatas.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [instId, debouncedSearchTerm]);


    const addBuildingData = async (values: buildingFields) => {
        if (!instId) return;

        try {
            const buildingDatas = await getBuilding({
                inst_id: instId,
                building_no: values.building_no,
                building_name: values.building_name,
            })

            if (buildingDatas.data.length > 0) {
                showNotification("เพิ่มอาคารเรียนล้มเหลว!", "มีอาคารเรียนนี้อยู่ในระบบแล้ว", "error");
                return;
            }

            const res = await createBuilding({
                ...values,
                inst_id: instId,
            });

            setBuildingData([]);
            fetchData();

            if (res.success) {
                showNotification("เพิ่มอาคารเรียนสำเร็จ!", "", "success");
            } else {
                showNotification("เพิ่มอาคารเรียนล้มเหลว!", res.message, "error");
            }
        } catch (error) {
            console.error("Create building failed:", error);
            showNotification("เพิ่มอาคารเรียนล้มเหลว!", "An error occurred while creating the building.", "error");
        }
    };

    const updateBuildingData = async (values: buildingFields) => {
        if (!instId) return;

        try {

            const payload = {
                ...values,
                inst_id: instId,
            };

            const res = await updateBuilding(payload);

            setBuildingData([]);
            fetchData();

            if (res.success) {
                showNotification("แก้ไขอาคารเรียนสำเร็จ!", "", "success");
            } else {
                showNotification("แก้ไขอาคารเรียนล้มเหลว!", res.message, "error");
            }
        } catch (error) {
            console.error("แก้ไขอาคารเรียนล้มเหลว:", error);
            showNotification("แก้ไขอาคารเรียนล้มเหลว!", "An error occurred while updating the building.", "error");
        }
    };

    const deleteBuildingData = async (building_id: number) => {
        // Refresh data after delete (actual deletion is handled in EditBuildingModal)
        setBuildingData([]);
        fetchData();
    };



    return (
        <div
            id="building-info-section"
            className='bg-white'
            style={{ padding: '1px' }}>
            <div className="flex justify-between items-center mb-3 mt-1">
                <Text size="xl" fw={500}>
                    อาคารเรียน
                </Text>
                
                <div className="flex items-center gap-2">
                    <TextInput
                        id="search-building-input"
                        placeholder="ค้นหา..."
                        size="xs"
                        radius="md"
                        leftSection={<IconSearch size={14} />}
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.currentTarget.value)}
                    />

                    <Button
                        id="add-building-button"
                        size="xs"
                        radius="md"
                        onClick={() => {
                            openAddBuildingModal();
                        }}
                    >
                        เพิ่มอาคารเรียน
                    </Button>
                </div>
            </div>

            {loading ? (
                <Center p="md">
                    <Loader size="sm" />
                </Center>
            ) : buildingData.length === 0 ? (
                <Text>ไม่มีข้อมูลอาคารเรียน</Text>
            ) : buildingData.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
                    {buildingData.map((building) => (
                        <Card
                            key={building.building_id}
                            shadow="sm"
                            padding="lg"
                            radius={16}
                            withBorder
                            className="transition-all duration-200 hover:shadow-md hover:-translate-y-1 cursor-pointer"
                            onClick={() => router.push(`/registration/info/building?building_id=${building.building_id}`)}
                        >
                            <Group justify="space-between" mb="xs">
                                <ThemeIcon size="xl" radius={8} variant="light" color="orange">
                                    <IconBuildingBank style={{ width: rem(24), height: rem(24) }} />
                                </ThemeIcon>
                                <Badge variant="outline" color="gray" size="xl" radius="md">
                                    ตึก {building.building_no}
                                </Badge>
                            </Group>

                            <div className="min-h-[80px]">
                                <Text fw={700} size="lg" mt="md" lineClamp={1} id="building-name">
                                    {building.building_name}
                                </Text>
                                <Text size="sm" c="dimmed" mt={5} lineClamp={2} id="building-remark">
                                    {building.remark || "-"}
                                </Text>
                            </div>

                            <Group mt="md" grow>

                                <Button
                                    id="edit-building-button"
                                    variant="default"
                                    radius="md"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openEditBuildingModal(building);
                                    }}
                                >
                                    แก้ไข
                                </Button>

                                <Button
                                    id="view-building-button"
                                    radius="md"
                                    variant="light"
                                    rightSection={<IconArrowRight size={16} />}
                                >
                                    ดูข้อมูล
                                </Button>

                            </Group>
                        </Card>
                    ))}
                </div>
            )}

            <EditBuildingModal
                building={selectedBuilding}
                opened={openedEditModal}
                close={closeEditModal}
                onSubmit={async (values) => {
                    await updateBuildingData(values);
                    closeEditModal();
                }}
                onDelete={async (building_id) => {
                    await deleteBuildingData(building_id);
                    closeEditModal();
                }}
            />

            <AddBuildingModal
                opened={openedAddBuilding}
                close={closeAddBuilding}
                onSubmit={async (values) => {
                    await addBuildingData(values);
                    closeAddBuilding();
                }}
            />
        </div>
    );
}