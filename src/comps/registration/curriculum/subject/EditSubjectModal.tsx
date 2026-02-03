import {
  Modal,
  Button,
  Group,
  TextInput,
  Checkbox,
  Select,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { subjectFields } from '@/utils/interface/subject.types';
import { useEffect, useState } from 'react';

interface SubjectEditModalProps {
  subject: subjectFields | null;
  opened: boolean;
  close: () => void;
  onSubmit?: (values: subjectFields) => void;
  learningAreaOptions: { value: string; label: string }[];
}

export default function SubjectEditModal({
  subject,
  opened,
  close,
  onSubmit,
  learningAreaOptions
}: SubjectEditModalProps) {

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

  return (
    <Modal
      opened={opened}
      onClose={close}
      centered
      size="md"
      radius={16}
    >
      <h1 className="color-black font-bold text-2xl mb-4 text-center">จัดการวิชา</h1>
      <form onSubmit={form.onSubmit(handleSubmit)} className="gap-2 flex flex-col">
        <Select
          label="กลุ่มการเรียนรู้"
          placeholder="เลือกกลุ่มการเรียนรู้"
          data={learningAreaOptions}
          {...form.getInputProps("learning_area_id")}
          required
          radius={8}
        />

        <TextInput
          label="รหัสวิชา"
          placeholder="เช่น MATH101"
          {...form.getInputProps("subject_code")}
          required
          radius={8}
        />

        <TextInput
          label="ชื่อวิชา (ภาษาไทย)"
          placeholder="เช่น คณิตศาสตร์พื้นฐาน"
          {...form.getInputProps("name_th")}
          required
          radius={8}
        />

        <TextInput
          label="ชื่อวิชา (ภาษาอังกฤษ)"
          placeholder="เช่น Basic Mathematics"
          {...form.getInputProps("name_en")}
          radius={8}
        />

        <TextInput
          label="หน่วยกิต"
          placeholder="เช่น 3"
          type="number"
          {...form.getInputProps("credit")}
          radius={8}
          required
        />

        <TextInput
          label="ชั่วโมงต่อสัปดาห์"
          placeholder="เช่น 3"
          type="number"
          {...form.getInputProps("hour_per_week")}
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
