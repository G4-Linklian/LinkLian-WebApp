import { useState, useRef, useEffect } from 'react';
import {
    IconBuildingBank
} from '@tabler/icons-react';
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
    Center
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { PushRouter } from '@/utils/function/navigation';
import { getBuilding, createBuilding, updateBuilding } from '@/utils/api/building';
import AddBuildingModal from '@/comps/registration/info/location/AddBuildingModal';
import EditBuildingModal from '@/comps/registration/info/location/EditBuildingModal';

export default function BuildingComps() {
    const [buildingData, setBuildingData] = useState<buildingFields[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();
    const [token, setToken] = useState<any | null>(false);
    const [instId, setInstId] = useState<number | null>(null);

    const [openedEditModal, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
    const [openedAddBuilding, { open: openAddBuilding, close: closeAddBuilding }] = useDisclosure(false);
    const [selectedBuilding, setSelectedBuilding] =
        useState<buildingFields | null>(null);

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
            const semesterData = await getBuilding({
                inst_id: instId,
            })

            setBuildingData(semesterData.data);

        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [instId]);


    const addBuildingData = async (values: buildingFields) => {
        if (!instId) return;

        try {
            const res = await createBuilding({
                ...values,
                inst_id: instId,
            });

            setBuildingData([]);
            fetchData();

            console.log("Created building:", res.data);
        } catch (error) {
            console.error("Create building failed:", error);
        }
    };

    const updateBuildingData = async (values: buildingFields) => {
        if (!instId) return;

        try {

            const payload = {
                ...values,
                inst_id: Number(values.inst_id),
            };

            const res = await updateBuilding(payload);

            setBuildingData([]);
            fetchData();

            console.log("Updated building:", res.data);
        } catch (error) {
            console.error("Update building failed:", error);
        }
    };



    return (
        <div
            className='bg-white'
            style={{ padding: '1px' }}>
            <div className="flex justify-between items-center mb-3 mt-1">
                <Text size="xl" fw={500}>
                    อาคารเรียน
                </Text>
                <Button
                    size="xs"
                    radius="md"
                    onClick={() => {
                        openAddBuildingModal();
                    }}
                >
                    เพิ่มอาคารเรียน
                </Button>
            </div>

            {loading ? (
                <Center p="md">
                    <Loader size="sm" />
                </Center>
            ) : buildingData.length === 0 ? (
                <Text>ไม่มีข้อมูลอาคารเรียน</Text>
            ) : buildingData.length > 0 && (
                <div className="grid grid-cols-4 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-4">
                    {buildingData.map((building) => (
                        <Card
                            key={building.building_id}
                            shadow="sm"
                            radius={12}
                            // w={250}
                            withBorder
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <Text size="lg" fw={600}>ตึกที่ : {building.building_no}</Text>
                                    <Text size="md" fw={400}>{building.building_name}</Text>

                                    <Text size="sm" c="dimmed" mt={5}>
                                        {building.remark}
                                    </Text>
                                </div>

                                <IconBuildingBank
                                    size={22}
                                    color="#ff8e3dff"
                                />
                            </div>

                            <Group justify="flex-end" mt="md">
                                <Button variant="outline" size="xs" radius={8}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openEditBuildingModal(building);
                                    }}
                                >
                                    แก้ไข
                                </Button>
                                <Button size="xs" radius={8}
                                    onClick={() =>
                                        router.push(`/registration/info/building?building_id=${building.building_id}&room_format=${router.query.room_format || "by_building_no"}`)
                                    }
                                    style={{ cursor: "pointer" }}
                                >
                                    ดูเพิ่มเติม
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