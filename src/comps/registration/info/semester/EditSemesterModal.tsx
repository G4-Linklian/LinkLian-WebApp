import {
  Modal,
  Button,
  Group,
  TextInput,
  Text,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useNotification } from '@/comps/noti/notiComp';
import { semesterFields } from "@/utils/interface/semester.types";
import { useEffect, useState } from 'react';
import { ConfirmModalEx } from '@/comps/public/ConfirmModal';
import { getSectionMaster } from '@/utils/api/section';
import { sectionFields } from '@/utils/interface/section.types';
import { deleteSemester } from '@/utils/api/semester';

interface SemesterEditModalProps {
  semester: semesterFields | null;
  opened: boolean;
  close: () => void;
  onSubmit?: (values: semesterFields) => void;
  onDelete?: (semester_id: number) => void;
}

export default function SemesterEditModal({
  semester,
  opened,
  close,
  onSubmit,
  onDelete,
}: SemesterEditModalProps) {

  const { showNotification } = useNotification();
  const [confirmDeleteOpened, setConfirmDeleteOpened] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState<string>("");
  const [sectionCount, setSectionCount] = useState<number>(0);
  const [relatedSections, setRelatedSections] = useState<sectionFields[]>([]);

  const form = useForm<semesterFields>({
    initialValues: {
      semester_id: undefined,
      inst_id: undefined,
      semester: "",
      start_date: undefined,
      end_date: undefined,
      flag_valid: true,
    },
  });

  useEffect(() => {
    if (!semester) return;
    form.setValues({
      semester_id: semester.semester_id,
      inst_id: semester.inst_id,
      semester: semester.semester ?? "",
      start_date: semester.start_date ? new Date(semester.start_date) : undefined,
      end_date: semester.end_date ? new Date(semester.end_date) : undefined,
      flag_valid: semester.flag_valid ?? true,
    });
  }, [semester]);

  const handleSubmit = (values: semesterFields) => {
    if (!values.start_date || !values.end_date) {
      showNotification(
        'บันทึกข้อมูลไม่สำเร็จ',
        'กรุณาเลือกวันที่เริ่มต้นและวันที่สิ้นสุด',
        'error',
      );
      return;
    }

    const start = new Date(values.start_date);
    const end = new Date(values.end_date);

    if (end < start) {
      showNotification(
        'บันทึกข้อมูลไม่สำเร็จ',
        'วันที่สิ้นสุดต้องหลังจากวันที่เริ่มต้น',
        'error',
      );
      return;
    }

    onSubmit?.(values);
    close();
  };

  const handleDelete = async () => {
    if (!semester?.semester_id) return;

    try {
      // เช็คว่ามี section ที่ใช้ semester นี้หรือไม่
      const result = await getSectionMaster({ semester_id: Number(semester.semester_id) });

      if (result.success && result.data) {
        const sections = result.data || [];
        const count = sections.length;
        setSectionCount(count);
        setRelatedSections(sections);

        if (count > 0) {
          setDeleteWarning(`ภาคเรียนนี้มี ${count} รายการที่เกี่ยวข้อง กรุณาลบข้อมูลที่เกี่ยวข้องก่อน`);
        } else {
          setDeleteWarning("");
        }
      }

      setConfirmDeleteOpened(true);
    } catch (error) {
      console.error("Error checking sections:", error);
      showNotification(
        'เกิดข้อผิดพลาด',
        'ไม่สามารถตรวจสอบข้อมูลได้',
        'error',
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!semester?.semester_id) return;

    try {
      const result = await deleteSemester(semester.semester_id);

      if (result.success) {
        showNotification(
          'ลบภาคเรียนสำเร็จ',
          '',
          'success',
        );
        onDelete?.(semester.semester_id);
        setConfirmDeleteOpened(false);
        close();
      } else {
        showNotification(
          'ลบภาคเรียนไม่สำเร็จ',
          result.message || 'เกิดข้อผิดพลาดในการลบข้อมูล',
          'error',
        );
      }
    } catch (error) {
      console.error('Error deleting semester:', error);
      showNotification(
        'ลบภาคเรียนไม่สำเร็จ',
        'เกิดข้อผิดพลาดในการเชื่อมต่อ',
        'error',
      );
    }
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        centered
        size="md"
        radius={16}
      >
        <h1 className="color-black font-bold text-2xl mb-4 text-center">จัดการภาคเรียน</h1>
        <form onSubmit={form.onSubmit(handleSubmit)} className="gap-2 flex flex-col">
          <TextInput
            label="ปีการศึกษา"
            placeholder="เช่น 2567/1"
            {...form.getInputProps("semester")}
            required
            mb="sm"
            radius={8}
          />

          <DateInput
            label="วันที่เริ่มต้น"
            valueFormat="DD/MM/YYYY"
            {...form.getInputProps("start_date")}
            mb="sm"
            radius={8}
            required
          />

          <DateInput
            label="วันที่สิ้นสุด"
            valueFormat="DD/MM/YYYY"
            {...form.getInputProps("end_date")}
            mb="sm"
            radius={8}
            required
          />

          <Group justify="flex-end" className="mt-4">
            <Button
              color="red"
              variant="outline"
              radius={8}
              onClick={handleDelete}
              type="button"
            >
              ลบ
            </Button>

            <Button type="submit" radius={8}>
              บันทึก
            </Button>
          </Group>
        </form>
      </Modal>

      <ConfirmModalEx
        opened={confirmDeleteOpened}
        onClose={() => setConfirmDeleteOpened(false)}
        title="ยืนยันการลบภาคเรียน"
        size="lg"
        description={
          <>
            <div className="text-center mb-4">
              คุณต้องการลบภาคเรียน <strong>{semester?.semester}</strong> ใช่หรือไม่?
            </div>

            {sectionCount > 0 && (
              <div className="mt-4 text-left">
                <Text size="sm" fw={600} mb="xs" c="red">
                  พบข้อมูลที่เกี่ยวข้อง :
                </Text>
                <div className="max-h-48 overflow-y-auto rounded-lg p-2 px-4 bg-gray-50">
                  <Text size="sm" fw={600} mb="xs" c="red">
                    กลุ่มการเรียน ({sectionCount} รายการ):
                  </Text>
                  {relatedSections.slice(0, 10).map((section, index) => (
                    <div key={section.section_id || index} className="text-sm py-2">
                      <div className="ml-4">
                        <strong>กลุ่มการเรียน:</strong> {section.section_name || '-'}
                      </div>
                      <div className="text-gray-600 text-xs ml-4">
                        {section.subject_code} - {section.name_th}
                      </div>
                    </div>
                  ))}
                  {relatedSections.length > 10 && (
                    <div className="text-xs text-gray-500 mt-2 text-center">
                      ... และอีก {relatedSections.length - 10} รายการ
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
        disableConfirm={sectionCount > 0}
      />
    </>
  );
}