import {
  Modal,
  Button,
  Group,
  TextInput,
  Select,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { subjectFields } from "@/utils/interface/subject.types";
import { useEffect } from "react";
import { IconFilter } from "@tabler/icons-react";

interface FilterSubjectModalProps {
  opened: boolean;
  close: () => void;
  onSubmit: (values: subjectFields) => void;
  onClear: () => void;
  learningAreaOptions?: { value: string; label: string }[];
  initialValues: subjectFields;
}

export default function FilterSubjectModal({
  opened,
  close,
  onSubmit,
  onClear,
  learningAreaOptions = [],
  initialValues,
}: FilterSubjectModalProps) {

  const form = useForm<subjectFields>({
    initialValues: {
      learning_area_id: undefined,
      credit: undefined,
      hour_per_week: undefined,
    },
  });

  // Sync form values with initialValues when modal opens or initialValues changes
  useEffect(() => {
    if (opened) {
        form.setValues(initialValues);
    }
  }, [opened, initialValues]);

  const handleSubmit = (values: subjectFields) => {
    const filteredValues: subjectFields = {};

    // Helper to check if value exists
    const hasValue = (val: any) => val !== "" && val !== undefined && val !== null;

    if (hasValue(values.learning_area_id)) filteredValues.learning_area_id = values.learning_area_id;
    if (hasValue(values.credit)) filteredValues.credit = values.credit;
    if (hasValue(values.hour_per_week)) filteredValues.hour_per_week = values.hour_per_week;

    onSubmit(filteredValues);
    close();
  };

  const handleClear = () => {
      form.reset();
      onClear();
      close();
  }

  return (
    <Modal
      opened={opened}
      onClose={close}
      centered
      size="sm"
      radius={16}
    >
      <h1 className="color-black font-bold text-xl mb-4 text-center">ตัวกรองรายวิชา</h1>
      <form onSubmit={form.onSubmit(handleSubmit)} className="gap-2 flex flex-col">
         <Select
          label="กลุ่มการเรียนรู้"
          placeholder="เลือกกลุ่มการเรียนรู้"
          data={learningAreaOptions}
          {...form.getInputProps("learning_area_id")}
          radius={8}
          clearable
        />

        <div className="flex gap-2 justify-between">
            <TextInput
            className="w-[50%]"
            label="หน่วยกิต"
            placeholder="เช่น 3"
            type="number"
            {...form.getInputProps("credit")}
            radius={8}
            />
            <TextInput
            className="w-[50%]"
            label="ชั่วโมง/สัปดาห์"
            placeholder="เช่น 3"
            type="number"
            {...form.getInputProps("hour_per_week")}
            radius={8}
            />
        </div>

        <Group justify="right" mt="lg">
            <Button
                variant="default"
                onClick={handleClear}
                radius={8}
            >
                ล้างค่า
            </Button>
            <Button
                type="submit"
                radius={8}
                leftSection={<IconFilter size={16} />}
            >
                ค้นหา
            </Button>
        </Group>
      </form>
    </Modal>
  );
}
