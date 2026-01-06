import {
  Modal,
  Button,
  Group,
  TextInput,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { semesterFields } from "@/utils/interface/semester.types";

interface AddSemesterModalProps {
  opened: boolean;
  close: () => void;
  onSubmit?: (values: semesterFields) => void;
}

export default function AddSemesterModal({
  opened,
  close,
  onSubmit,
}: AddSemesterModalProps) {
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

  const handleSubmit = (values: semesterFields) => {
    console.log("add semester:", values);
    onSubmit?.(values);
    form.reset();
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
      <h1 className="text-black font-bold text-2xl mb-4 text-center">
        เพิ่มภาคเรียน
      </h1>

      <form
        onSubmit={form.onSubmit(handleSubmit)}
        className="flex flex-col gap-2"
      >
        <TextInput
          label="ปีการศึกษา"
          placeholder="เช่น 1/2568"
          {...form.getInputProps("semester")}
          required
          radius={8}
        />

        <DateInput
          label="วันที่เริ่มต้น"
          valueFormat="DD/MM/YYYY"
          placeholder="เช่น 01/01/2567"
          {...form.getInputProps("start_date")}
          required
          radius={8}
        />

        <DateInput
          label="วันที่สิ้นสุด"
          valueFormat="DD/MM/YYYY"
            placeholder="เช่น 30/04/2567"
          {...form.getInputProps("end_date")}
          required
          radius={8}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={close} radius={8}>
            ยกเลิก
          </Button>

          <Button type="submit" radius={8}>
            เพิ่มภาคเรียน
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
