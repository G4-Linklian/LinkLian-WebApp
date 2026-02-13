import {
  Modal,
  Button,
  Group,
  TextInput,
  Select,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { UserSysFields } from "@/utils/interface/user.types";
import { useEffect } from "react";
import { IconFilter, IconX } from "@tabler/icons-react";
import { teacherStatusOptions } from "@/enums/userStatus";

interface FilterStaffModalProps {
  opened: boolean;
  close: () => void;
  onSubmit: (values: UserSysFields) => void;
  onClear: () => void;
  learningAreaOptions?: { value: string; label: string }[];
  initialValues: UserSysFields;
}

export default function FilterStaffModal({
  opened,
  close,
  onSubmit,
  onClear,
  learningAreaOptions = [],
  initialValues,
}: FilterStaffModalProps) {

  const form = useForm<UserSysFields>({
    initialValues: {
      code: "",
      first_name: "",
      last_name: "",
      email: "",
      user_status: "",
      learning_area_id: undefined,
    },
  });

  // Sync form values with initialValues when modal opens or initialValues changes
  useEffect(() => {
    if (opened) {
      form.setValues(initialValues);
    }
  }, [opened, initialValues]);

  const handleSubmit = (values: UserSysFields) => {
    const filteredValues: UserSysFields = {};

    // Helper to check if value exists
    const hasValue = (val: any) => val !== "" && val !== undefined && val !== null;

    if (hasValue(values.code)) filteredValues.code = values.code;
    if (hasValue(values.first_name)) filteredValues.first_name = values.first_name;
    if (hasValue(values.last_name)) filteredValues.last_name = values.last_name;
    if (hasValue(values.email)) filteredValues.email = values.email;
    if (hasValue(values.user_status)) filteredValues.user_status = values.user_status;
    if (hasValue(values.learning_area_id)) filteredValues.learning_area_id = (values.learning_area_id as number);

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
      size="md"
      radius={16}
    >
      <h1 className="color-black font-bold text-2xl mb-4 text-center">ตัวกรองบุคลากร</h1>
      <form onSubmit={form.onSubmit(handleSubmit)} className="gap-2 flex flex-col">
        <Select
          label="สถานะ"
          placeholder="เลือกสถานะ"
          data={teacherStatusOptions}
          {...form.getInputProps("user_status")}
          radius={8}
          clearable
        />
        <Select
          className="mt-2"
          label="กลุ่มการเรียนรู้"
          placeholder="เลือกกลุ่มการเรียนรู้"
          data={learningAreaOptions}
          {...form.getInputProps("learning_area_id")}
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
