import {
  Modal,
  Button,
  Group,
  TextInput,
  Checkbox,
  Select,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { subjectFields } from '@/utils/interface/subject.types';
import { useEffect, useState } from 'react';
import { getSection } from '@/utils/api/section';
import { deleteSubject } from '@/utils/api/subject';
import { ConfirmModalEx } from '@/comps/public/ConfirmModal';
import { useNotification } from '@/comps/noti/notiComp';
import { sectionFields } from '@/utils/interface/section.types';

interface SubjectEditModalProps {
  subject: subjectFields | null;
  opened: boolean;
  close: () => void;
  onSubmit?: (values: subjectFields) => void;
  onDelete?: (subject_id: number) => void;
  learningAreaOptions: { value: string; label: string }[];
}

export default function SubjectEditModal({
  subject,
  opened,
  close,
  onSubmit,
  onDelete,
  learningAreaOptions
}: SubjectEditModalProps) {

  const { showNotification } = useNotification();
  const [confirmDeleteOpened, setConfirmDeleteOpened] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState<string>("");
  const [sectionCount, setSectionCount] = useState<number>(0);
  const [relatedSections, setRelatedSections] = useState<sectionFields[]>([]);

  const form = useForm<subjectFields>({
    initialValues: {
      subject_id: undefined,
      learning_area_id: undefined,
      subject_code: "",
      name_th: "",
      name_en: "",
      credit: undefined,
      hour_per_week: undefined,
      flag_valid: true,
    },
  });

  useEffect(() => {
    if (subject) {
      form.setValues({
        subject_id: subject.subject_id,
        learning_area_id: subject.learning_area_id,
        subject_code: subject.subject_code ?? "",
        name_th: subject.name_th ?? "",
        name_en: subject.name_en ?? "",
        credit: subject.credit ?? undefined,
        hour_per_week: subject.hour_per_week ?? undefined,
        flag_valid: subject.flag_valid ?? true,
      });
    }
  }, [subject, learningAreaOptions]);


  const handleSubmit = (values: subjectFields) => {
    onSubmit?.(values);
    close();
  };

  const handleDelete = async () => {
    if (!subject?.subject_id) return;

    try {
      // เช็คว่ามี section ที่ใช้วิชานี้หรือไม่
      const sectionResult = await getSection({ subject_id: Number(subject.subject_id) });
      
      const sections = sectionResult.success && sectionResult.data ? sectionResult.data : [];
      const sCount = sections.length;
      
      setSectionCount(sCount);
      setRelatedSections(sections);
      
      if (sCount > 0) {
        setDeleteWarning(`วิชานี้มี ${sCount} กลุ่มเรียน (Section) ที่เกี่ยวข้อง กรุณาลบข้อมูลที่เกี่ยวข้องก่อน`);
      } else {
        setDeleteWarning("");
      }
      
      setConfirmDeleteOpened(true);
    } catch (error) {
      console.error("Error checking related sections:", error);
      showNotification(
        'เกิดข้อผิดพลาด',
        'ไม่สามารถตรวจสอบข้อมูลได้',
        'error',
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!subject?.subject_id) return;
    
    try {
      const result = await deleteSubject(Number(subject.subject_id));
      
      if (result.success) {
        showNotification(
          'ลบวิชาสำเร็จ',
          '',
          'success',
        );
        onDelete?.(Number(subject.subject_id));
        setConfirmDeleteOpened(false);
        close();
      } else {
        showNotification(
          'ลบวิชาไม่สำเร็จ',
          result.message || 'เกิดข้อผิดพลาดในการลบข้อมูล',
          'error',
        );
      }
    } catch (error) {
      console.error('Error deleting subject:', error);
      showNotification(
        'ลบวิชาไม่สำเร็จ',
        'เกิดข้อผิดพลาดในการเชื่อมต่อ',
        'error',
      );
    }
  };

  return (
    <>
      <Modal
        id="edit-subject-modal"
        opened={opened}
        onClose={close}
        centered
        size="md"
        radius={16}
      >
      <h1 className="color-black font-bold text-2xl mb-4 text-center">จัดการวิชา</h1>
      <form onSubmit={form.onSubmit(handleSubmit)} className="gap-2 flex flex-col" id="edit-subject-form">
        <Select
          id="select-subject-learning-area"
          label="กลุ่มการเรียนรู้"
          placeholder="เลือกกลุ่มการเรียนรู้"
          data={learningAreaOptions}
          {...form.getInputProps("learning_area_id")}
          required
          radius={8}
        />

        <TextInput
          id="input-subject-code"
          label="รหัสวิชา"
          placeholder="เช่น MATH101"
          {...form.getInputProps("subject_code")}
          required
          radius={8}
        />

        <TextInput
          id="input-subject-name-th"
          label="ชื่อวิชา (ภาษาไทย)"
          placeholder="เช่น คณิตศาสตร์พื้นฐาน"
          {...form.getInputProps("name_th")}
          required
          radius={8}
        />

        <TextInput
          id="input-subject-name-en"
          label="ชื่อวิชา (ภาษาอังกฤษ)"
          placeholder="เช่น Basic Mathematics"
          {...form.getInputProps("name_en")}
          radius={8}
        />

        <TextInput
          id="input-subject-credit"
          label="หน่วยกิต"
          placeholder="เช่น 3"
          type="number"
          {...form.getInputProps("credit")}
          radius={8}
          required
        />

        <TextInput
          id="input-subject-hour-per-week"
          label="ชั่วโมงต่อสัปดาห์"
          placeholder="เช่น 3"
          type="number"
          {...form.getInputProps("hour_per_week")}
          radius={8}
          required
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
      title="ยืนยันการลบวิชา"
      size="lg"
      description={
        <>
          <div className="text-center mb-4">
            คุณต้องการลบวิชา <strong>{subject?.subject_code} - {subject?.name_th}</strong> ใช่หรือไม่?
          </div>
          
          {sectionCount > 0 && (
            <div className="mt-4 text-left">
              <Text size="sm" fw={600} mb="xs" c="red">
                พบข้อมูลที่เกี่ยวข้อง:
              </Text>
              <div className="max-h-48 overflow-y-auto rounded-lg p-2 px-4 bg-gray-50">
                <Text size="sm" fw={600} mb="xs" c="red">
                  กลุ่มเรียน ({sectionCount} กลุ่ม):
                </Text>
                {relatedSections.slice(0, 10).map((section, index) => (
                  <div key={section.section_id || index} className="text-sm py-1">
                    • {section.section_name} - {section.subject_code}
                  </div>
                ))}
                {relatedSections.length > 10 && (
                  <div className="text-xs text-gray-500 mt-1">
                    ... และอีก {relatedSections.length - 10} กลุ่ม
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
