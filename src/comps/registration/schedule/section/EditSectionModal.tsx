import { useRef, RefObject, useState, useEffect } from 'react';
import {
  Modal,
  Button,
  Group,
  TextInput,
  Checkbox,
  Select,
  Loader,
  Divider,
  Text,
  ActionIcon
} from "@mantine/core";
import {
  IconSelector,
  IconClock
} from '@tabler/icons-react';
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { sectionFields } from "@/utils/interface/section.types";
import { useRouter } from "next/router";
import { getSubject } from "@/utils/api/subject";
import { getBuilding } from "@/utils/api/building";
import { getRoomLocation } from '@/utils/api/roomLocation';
import { decodeRegistrationToken } from '@/utils/authToken';
import { useDebouncedValue } from '@mantine/hooks';
import { getSectionEnrollment, getSectionEducator, deleteSection } from '@/utils/api/section';
import { ConfirmModalEx } from '@/comps/public/ConfirmModal';
import { useNotification } from '@/comps/noti/notiComp';
import { TeacherPositionLabel, TeacherPosition } from '@/enums/teacher';

interface SectionEditModalProps {
  section: sectionFields | null;
  opened: boolean;
  close: () => void;
  onSubmit?: (values: sectionFields) => void;
  onDelete?: (section_id: number) => void;
  semesterData?: { value: string; label: string }[];
  token?: any;
}

type SubjectOption = {
  value: string;
  label: string;
};

export default function SectionEditModal({
  section,
  opened,
  close,
  onSubmit,
  onDelete,
  semesterData,
  token
}: SectionEditModalProps) {
  if (!section) return null;
  const router = useRouter();

  const { showNotification } = useNotification();
  const [confirmDeleteOpened, setConfirmDeleteOpened] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState<string>("");
  const [enrollmentCount, setEnrollmentCount] = useState<number>(0);
  const [educatorCount, setEducatorCount] = useState<number>(0);
  const [relatedEnrollments, setRelatedEnrollments] = useState<sectionFields[]>([]);
  const [relatedEducators, setRelatedEducators] = useState<sectionFields[]>([]);

  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchValue, 300);
  const [subjectOptions, setSubjectOptions] = useState<SubjectOption[]>([]);
  const [loading, setLoading] = useState(false);

  const [buildingOptions, setBuildingOptions] = useState<any[]>([]);
  const [roomOptions, setRoomOptions] = useState<any[]>([]);
  const [loadingBuilding, setLoadingBuilding] = useState(false);
  const [loadingRoom, setLoadingRoom] = useState(false);


  const form = useForm<sectionFields>({
    initialValues: {
      semester_id: undefined,
      subject_id: undefined,
      section_name: "",
    },
  });

  useEffect(() => {
    if (!section) return;

    form.setValues({
      section_id: section.section_id,
      semester_id: section.semester_id,
      subject_id: section.subject_id,
      section_name: section.section_name,
    });

    if (section.building_id) {
      setRoomOptions([
        {
          value: String(section.room_location_id),
          label: `${section.floor ?? ""}${section.room_number ?? ""}` || ""
        }
      ]);
    }

  }, [section]);


  useEffect(() => {
    if (!opened) return;

    setLoadingBuilding(true);
    getBuilding({ inst_id: token.institution.inst_id })
      .then((res) => {
        const options = res.data.map((b: any) => ({
          value: String(b.building_id),
          label: b.building_name,
        }));
        setBuildingOptions(options);
      })
      .finally(() => setLoadingBuilding(false));
  }, [opened]);

  useEffect(() => {
    const buildingId = form.values.building_id;
    if (!buildingId || buildingId === "" || buildingId === null || buildingId === undefined || buildingId === "null") {
      setRoomOptions([]);
      return;
    }

    setLoadingRoom(true);
    getRoomLocation({ building_id: Number(buildingId) })
      .then((res) => {
        const options = res.data.map((r: any) => ({
          value: String(r.room_location_id),
          label: `${r.floor ?? ""}${r.room_number ?? ""}`.trim(), // หรือ floor + room
        }));
        setRoomOptions(options);
      })
      .finally(() => setLoadingRoom(false));
  }, [form.values.building_id]);



  const handleSubmit = (values: sectionFields) => {
    const payload = {
      ...values,
      subject_id: values.subject_id ? Number(values.subject_id) : undefined,
      semester_id: values.semester_id ? Number(values.semester_id) : undefined,
      building_id: values.building_id ? Number(values.building_id) : undefined,
      room_location_id: values.room_location_id ? Number(values.room_location_id) : undefined,
    };
    onSubmit?.(payload);
    close();
  };

  const handleDelete = async () => {
    if (!section?.section_id) return;

    try {
      // เช็คว่ามีนักเรียนลงทะเบียนในกลุ่มเรียนนี้หรือไม่
      const enrollmentResult = await getSectionEnrollment({ section_id: Number(section.section_id) });
      // เช็คว่ามีอาจารย์ผู้สอนในกลุ่มเรียนนี้หรือไม่
      const educatorResult = await getSectionEducator({ section_id: Number(section.section_id) });

      const enrollments = enrollmentResult.success && enrollmentResult.data ? enrollmentResult.data : [];
      const educators = educatorResult.success && educatorResult.data ? educatorResult.data : [];

      const eCount = enrollments.length;
      const eduCount = educators.length;
      const totalCount = eCount + eduCount;

      setEnrollmentCount(eCount);
      setEducatorCount(eduCount);
      setRelatedEnrollments(enrollments);
      setRelatedEducators(educators);

      if (totalCount > 0) {
        const warnings = [];
        if (eCount > 0) warnings.push(`${eCount} นักเรียนที่ลงทะเบียน`);
        if (eduCount > 0) warnings.push(`${eduCount} อาจารย์ผู้สอน`);
        setDeleteWarning(`กลุ่มเรียนนี้มี ${warnings.join(' และ ')} กรุณาลบข้อมูลที่เกี่ยวข้องก่อน`);
      } else {
        setDeleteWarning("");
      }

      setConfirmDeleteOpened(true);
    } catch (error) {
      console.error("Error checking enrollment:", error);
      showNotification(
        'เกิดข้อผิดพลาด',
        'ไม่สามารถตรวจสอบข้อมูลได้',
        'error',
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!section?.section_id) return;

    try {
      const result = await deleteSection(section.section_id);

      if (result.success) {
        showNotification(
          'ลบกลุ่มเรียนสำเร็จ',
          '',
          'success',
        );
        onDelete?.(section.section_id);
        setConfirmDeleteOpened(false);
        close();
      } else {
        showNotification(
          'ลบกลุ่มเรียนไม่สำเร็จ',
          result.message || 'เกิดข้อผิดพลาดในการลบข้อมูล',
          'error',
        );
      }
    } catch (error) {
      console.error('Error deleting section:', error);
      showNotification(
        'ลบกลุ่มเรียนไม่สำเร็จ',
        'เกิดข้อผิดพลาดในการเชื่อมต่อ',
        'error',
      );
    }
  };


  const fetchSubjects = async (keyword: string) => {
    const token = decodeRegistrationToken();
    const instId = token?.institution?.inst_id;

    if (!instId) return;

    try {
      setLoading(true);

      const subjectData = await getSubject({
        inst_id: instId,
        keyword,
        sort_order: "desc",
      });

      const options: SubjectOption[] = subjectData.data.map((subjects: any) => ({
        value: subjects.subject_id,
        label: `${subjects.subject_code} ${subjects.name_th}`,
      }));

      setSubjectOptions(prev => {
        const map = new Map<string, SubjectOption>();

        [...prev, ...options].forEach(item => {
          map.set(item.value, item);
        });

        return Array.from(map.values());
      });
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debouncedSearch.length >= 2) {
      fetchSubjects(debouncedSearch);
    } else if (debouncedSearch.length === 0) {
      const subjectOption = {
        value: String(section.subject_id),
        label: `${section.subject_code} ${section.name_th}`,
      };

      setSubjectOptions([subjectOption]);
    }
  }, [debouncedSearch]);

  return (
    <>
      <Modal
        id="edit-section-modal"
        opened={opened}
        onClose={close}
        centered
        size="md"
        radius={16}
      >
        <h1 className="color-black font-bold text-2xl mb-4 text-center">แก้ไขกลุ่มเรียน</h1>
        <form onSubmit={form.onSubmit(handleSubmit)} className="gap-4 flex flex-col" id="edit-section-form">

          <Select
            id="select-subject"
            label="เลือกรายวิชา"
            placeholder="พิมพ์รหัสหรือชื่อวิชา (อย่างน้อย 2 ตัวอักษร)"
            data={subjectOptions}
            searchable
            nothingFoundMessage={loading ? "กำลังค้นหา..." : "ไม่พบรายวิชา"}
            onSearchChange={setSearchValue}
            searchValue={searchValue}
            clearable
            {...form.getInputProps("subject_id")}
            filter={({ options }) => options}
            required
            rightSection={loading ? <Loader size={16} /> : <IconSelector size={16} />}
            radius={8}
          />

          <Select
            id="select-semester"
            label="ปีการศึกษา"
            placeholder="เลือกปีการศึกษา"
            data={semesterData}
            value={router.query.semester_id as string || String(section.semester_id) || null}
            disabled={true}
            clearable={false}
            radius={8}
            required
          />

          <TextInput
            id="section-name"
            label="ชื่อกลุ่มเรียน"
            placeholder="เช่น S1"
            {...form.getInputProps("section_name")}
            required
            radius={8}
          />

          <Group justify="flex-end" className="mt-4">
            <Button
              id="delete-button"
              color="red"
              variant="outline"
              radius={8}
              onClick={handleDelete}
              type="button"
            >
              ลบ
            </Button>

            <Button id="save-button" type="submit" radius={8}>
              บันทึก
            </Button>
          </Group>
        </form>
      </Modal>

      <ConfirmModalEx
        opened={confirmDeleteOpened}
        onClose={() => setConfirmDeleteOpened(false)}
        title="ยืนยันการลบกลุ่มเรียน"
        size="lg"
        description={
          <>
            <div className="text-center mb-4">
              คุณต้องการลบกลุ่มเรียน <strong>{section?.section_name} ({section?.subject_code} - {section?.name_th})</strong> ใช่หรือไม่?
            </div>

            {(enrollmentCount > 0 || educatorCount > 0) && (
              <div className="mt-4 text-left">
                <Text size="sm" fw={600} mb="xs" c="red">
                  พบข้อมูลที่เกี่ยวข้อง:
                </Text>
                <div className="max-h-48 overflow-y-auto rounded-lg p-2 px-4 bg-gray-50">
                  {enrollmentCount > 0 && (
                    <div className="mb-3">
                      <Text size="sm" fw={600} mb="xs" c="red">
                        นักเรียน ({enrollmentCount} คน):
                      </Text>
                      {relatedEnrollments.slice(0, 5).map((enrollment, index) => (
                        <div key={enrollment.user_sys_id || index} className="text-sm py-1 ml-4">
                          <div>
                            <strong>{enrollment.first_name} {enrollment.last_name}</strong>
                          </div>
                          {enrollment.code} - {enrollment.level_name}
                        </div>
                      ))}
                      {relatedEnrollments.length > 5 && (
                        <div className="text-xs text-gray-500 mt-1">
                          ... และอีก {relatedEnrollments.length - 5} คน
                        </div>
                      )}
                    </div>
                  )}
                  {educatorCount > 0 && (
                    <div>
                      <Text size="sm" fw={600} mb="xs" c="red">
                        อาจารย์ผู้สอน ({educatorCount} คน):
                      </Text>
                      {relatedEducators.slice(0, 5).map((educator, index) => (
                        <div key={educator.user_sys_id || index} className="text-sm py-1 ml-4">
                          <div>
                            <strong>{educator.first_name} {educator.last_name}</strong>
                          </div>
                          {educator.code} - {educator.position ? TeacherPositionLabel[educator.position as TeacherPosition] : undefined}
                        </div>
                      ))}
                      {relatedEducators.length > 5 && (
                        <div className="text-xs text-gray-500 mt-1">
                          ... และอีก {relatedEducators.length - 5} คน
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        }
        warningText={deleteWarning}
        handleConfirm={handleConfirmDelete}
        color="red"
        disableConfirm={enrollmentCount > 0 || educatorCount > 0}
      />
    </>
  );
}
