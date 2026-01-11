import {
  Modal,
  Button,
  Group,
  TextInput,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useNotification } from '@/comps/noti/notiComp';
import { semesterFields } from "@/utils/interface/semester.types";
import { useEffect } from 'react';

interface SemesterEditModalProps {
  semester: semesterFields | null;
  opened: boolean;
  close: () => void;
  onSubmit?: (values: semesterFields) => void;
}

export default function SemesterEditModal({
  semester,
  opened,
  close,
  onSubmit,
}: SemesterEditModalProps) {

  const { showNotification } = useNotification();

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

  return (
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
          <Button color="blue" variant="outline" radius={8} onClick={close}>
            ยกเลิก
          </Button>

          <Button type="submit" radius={8}>
            บันทึก
          </Button>
        </Group>
      </form>
    </Modal>
  );
}