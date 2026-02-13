import { useState, useRef, useEffect } from 'react';
import { sectionFields, sectionFieldsForm } from '@/utils/interface/section.types';
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
import { getSectionEducator, createSectionEducator, updateSectionEducator } from '@/utils/api/section';
import InstructorCard from '@/comps/registration/schedule/section/sectionDetail/Teacher/InstructorCard';
import AddTeacherSectionModal from '@/comps/registration/schedule/section/sectionDetail/Teacher/AddTeacherSectionModal';
import { useNotification } from '@/comps/noti/notiComp';

export default function TeacherComps() {
    const [sectionData, setSectionData] = useState<sectionFields[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();
    const [token, setToken] = useState<any | null>(false);
    const [instId, setInstId] = useState<number | null>(null);
    const [sectionId, setSectionId] = useState<number | null>(null);
    const [roleID, setRoleID] = useState<number | null>(null);
    const { showNotification } = useNotification();


    const [openedEditModal, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
    const [openedAddSection, { open: openAddSection, close: closeAddSection }] = useDisclosure(false);
    const [selectedSection, setSelectedSection] =
        useState<sectionFields | null>(null);

    const openEditSectionModal = (section: sectionFields) => {
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

        if (router.query.section_id) {
            setSectionId(Number(router.query.section_id));
        }

        const role_id = token.institution.inst_type === "school" ? 4 : 5;
        setRoleID(role_id);
    }, [router.isReady]);


    const fetchData = async () => {
        setLoading(true);

        if (sectionId) {
            const sectionData = await getSectionEducator({
                section_id: Number(sectionId),
                sort_by: "position",
                sort_order: "desc",
            })

            setSectionData(sectionData.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [instId]);

    // ตรวจสอบว่ามีผู้สอนหลัก (MAIN_TEACHER) หรือไม่
    const hasMainTeacher = sectionData.some(teacher => teacher.position === "main_teacher");

    const addSectionData = async (values: sectionFieldsForm) => {

        try {
            const res = await createSectionEducator({
                user_sys_id: Number(values.user_sys_id),
                section_id: Number(sectionId),
                position: values.position || ""
            });

            setSectionData([]);
            fetchData();

            if (res.success) {
                showNotification("เพิ่มผู้สอนสำเร็จ!", "", "success");
            } else {
                showNotification("เพิ่มผู้สอนล้มเหลว!", res.message, "error");
            }
        } catch (error) {
            console.error("Create staff failed:", error);
            showNotification("เพิ่มผู้สอนล้มเหลว!", "An error occurred while creating the staff.", "error");
        }
    };

    const updateSectionData = async (values: sectionFieldsForm) => {
        if (!instId) return;

        try {

            const payload = {
                ...values,
                inst_id: Number(values.inst_id),
                user_sys_id: Number(values.user_sys_id),
            };


            const res = await updateSectionEducator(payload);

            setSectionData([]);
            fetchData();

            if (res.success) {
                showNotification("แก้ไขผู้สอนสำเร็จ!", "", "success");
            } else {
                showNotification("แก้ไขผู้สอนล้มเหลว!", res.message, "error");
            }
        } catch (error) {
            console.error("Create staff failed:", error);
            showNotification("แก้ไขผู้สอนล้มเหลว!", "An error occurred while editing the staff.", "error");
        }
    };



    return (
        <div
            className='bg-white'
            style={{ padding: '1px' }}>
            <div className="flex justify-between items-center mb-3 mt-1">
                <Text size="xl" fw={500}>
                    ผู้สอน
                </Text>
                <Button
                    size="xs"
                    radius="md"
                    onClick={() => {
                        openAddSectionModal();
                    }}
                >
                    เพิ่มผู้สอน
                </Button>
            </div>

            {loading ? (
                <Center p="md">
                    <Loader size="sm" />
                </Center>
            ) : (
                <>
                    {!hasMainTeacher && (
                        <Card withBorder radius="md" p="md" mb="md" className="bg-yellow-50 border-yellow-300">
                            <Text size="sm" c="orange" fw={500} ta="center">
                                ⚠️ ต้องมีผู้สอนหลักอย่างน้อย 1 คน
                            </Text>
                        </Card>
                    )}
                    
                    {sectionData.length === 0 ? (
                        <Text c="dimmed" ta="center">ยังไม่มีผู้สอน กรุณาเพิ่มผู้สอน</Text>
                    ) : (
                        <div className="grid grid-cols-4 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-4">
                            {sectionData.map((instructor) => (
                                <InstructorCard
                                    key={instructor.user_sys_id}
                                    instructor={instructor}
                                    sectionId={sectionId}
                                    onDelete={(user_sys_id: number) => {
                                        fetchData();
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* <EditSectionModal
                section={selectedSection}
                opened={openedEditModal}
                close={closeEditModal}
                onSubmit={async (values) => {
                    await updateSectionData(values);
                    closeEditModal();
                }}
            /> */}

            <AddTeacherSectionModal
                opened={openedAddSection}
                close={closeAddSection}
                onSubmit={async (values) => {
                    await addSectionData(values);
                    closeAddSection();
                }}
                token={token}
                roleID={Number(roleID)}
            />
        </div>
    );
}