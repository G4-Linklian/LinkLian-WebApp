import {
  Button,
  Group,
  TextInput,
  Select,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { subjectFields } from '@/utils/interface/subject.types';

interface AddSubjectModalFormProps {
  onSubmit: (values: subjectFields) => void;
  close: () => void;
  learningAreaOptions: { value: string; label: string }[];
}

export default function AddSubjectModalForm({
  onSubmit,
  close,
  learningAreaOptions
}: AddSubjectModalFormProps) {
  const form = useForm<subjectFields>({
    initialValues: {
      learning_area_id: undefined,
      subject_code: "",
      name_th: "",
      name_en: "",
      credit: undefined,
      hour_per_week: undefined,
    },
  });

  const handleSubmit = (values: subjectFields) => {
    onSubmit(values);
    form.reset();
    close();
  };

  return (
    <form
      onSubmit={form.onSubmit(handleSubmit)}
      className="flex flex-col gap-2"
    >
      <Select
        label="กลุ่มการเรียนรู้"
        placeholder="เลือกกลุ่มการเรียนรู้"
        searchable
        clearable
        data={learningAreaOptions}
        {...form.getInputProps("learning_area_id")}
        required
        radius={8}
      />

      <TextInput
        label="รหัสวิชา"
        placeholder="เช่น MATH101, ค10105"
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
        placeholder="เช่น 1.5"
        type="number"
        {...form.getInputProps("credit")}
        required
        radius={8}
      />

      <TextInput
        label="ชั่วโมงต่อสัปดาห์"
        placeholder="เช่น 2"
        type="number"
        {...form.getInputProps("hour_per_week")}
        required
        radius={8}
      />

      <Group justify="flex-end" mt="md">
        <Button variant="outline" onClick={close} radius={8}>
          ยกเลิก
        </Button>

        <Button type="submit" radius={8}>
          เพิ่มวิชา
        </Button>
      </Group>
    </form>
  );
}
