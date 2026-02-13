import {
  Modal,
  Button,
  Group,
  TextInput,
  Select,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { semesterFields } from "@/utils/interface/semester.types";
import { useEffect } from "react";
import { IconFilter } from "@tabler/icons-react";

interface FilterSemesterModalProps {
  opened: boolean;
  close: () => void;
  onSubmit: (values: semesterFields) => void;
  onClear: () => void;
  initialValues: semesterFields;
}

export default function FilterSemesterModal({
  opened,
  close,
  onSubmit,
  onClear,
  initialValues,
}: FilterSemesterModalProps) {

  const form = useForm<semesterFields>({
    initialValues: {
      semester: "",
      status: "",
      start_date: undefined,
      end_date: undefined,
    },
  });

  // Sync form values with initialValues when modal opens or initialValues changes
  useEffect(() => {
    if (opened) {
      form.setValues({
        ...initialValues,
        start_date: initialValues.start_date ? new Date(initialValues.start_date) : undefined,
        end_date: initialValues.end_date ? new Date(initialValues.end_date) : undefined,
      });
    }
  }, [opened, initialValues]);

  const handleSubmit = (values: semesterFields) => {
    const filteredValues: semesterFields = {};

    // Helper to check if value exists
    const hasValue = (val: any) => val !== "" && val !== undefined && val !== null;

    if (hasValue(values.semester)) filteredValues.semester = values.semester;
    if (hasValue(values.status)) filteredValues.status = values.status;
    if (hasValue(values.start_date)) filteredValues.start_date = values.start_date;
    if (hasValue(values.end_date)) filteredValues.end_date = values.end_date;

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
      size="xs"
      radius={16}
    >
      <h1 className="color-black font-bold text-xl mb-4 text-center">ตัวกรองภาคเรียน</h1>
      <form onSubmit={form.onSubmit(handleSubmit)} className="gap-2 flex flex-col">
          <TextInput
            label="ปีการศึกษา"
            placeholder="เช่น 1/2568"
            {...form.getInputProps("semester")}
            radius={8}
          />
          <DateInput
            label="วันที่เริ่มต้น"
            valueFormat="DD/MM/YYYY"
            placeholder="เลือกวันที่เริ่มต้น"
            {...form.getInputProps("start_date")}
            radius={8}
            clearable
          />
          <DateInput
            label="วันที่สิ้นสุด"
            valueFormat="DD/MM/YYYY"
            placeholder="เลือกวันที่สิ้นสุด"
            {...form.getInputProps("end_date")}
            radius={8}
            clearable
          />
          <Select
            label="สถานะ"
            placeholder="เลือกสถานะ"
            data={[
                { value: "pending", label: "รอเปิดเทอม" },
                { value: "open", label: "เปิดเทอม" },
                { value: "close", label: "ปิดเทอม" },
            ]}
            {...form.getInputProps("status")}
            radius={8}
            clearable
            />

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
