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
import { teacherStatusOptions } from "@/enums/userStatus";

interface EditStaffModalProps {
  staff: UserSysFields | null;
  opened: boolean;
  close: () => void;
  onSubmit?: (values: UserSysFields) => void;
  learningAreaOptions?: { value: string; label: string }[];
}

export default function EditStaffModal({
  staff,
  opened,
  close,
  onSubmit,
  learningAreaOptions = [],
}: EditStaffModalProps) {
  if (!staff) return null;

  const form = useForm<UserSysFields>({
    initialValues: {
      email: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      phone: "",
      code: "",
      user_status: "",
      learning_area_id: undefined,
      user_sys_id: undefined,
    },

    validate: {
      phone: (value) => {
        if (!value) return null;
        if (!/^\d{10}$/.test(value)) {
          return "เบอร์โทรต้องเป็นตัวเลข 10 หลักเท่านั้น";
        }
        return null;
      },
    },
  });

  useEffect(() => {
    if (!staff) return;

    form.setValues({
      email: staff.email ?? "",
      first_name: staff.first_name ?? "",
      middle_name: staff.middle_name ?? "",
      last_name: staff.last_name ?? "",
      phone: staff.phone ?? "",
      code: staff.code ?? "",
      user_status: staff.user_status ?? "",
      learning_area_id: staff.learning_area_id,
      user_sys_id: staff.user_sys_id,
    });
  }, [staff]);

  const handleSubmit = (values: UserSysFields) => {
    const payload = {
      ...values,
      learning_area_id: values.learning_area_id ? Number(values.learning_area_id) : undefined,
    };
    onSubmit?.(payload);
    close();
  };

  return (
    <Modal
      id="edit-staff-modal"
      opened={opened}
      onClose={close}
      centered
      size="md"
      radius={16}
    >
      <h1 className="color-black font-bold text-2xl mb-4 text-center">จัดการบุคลากร</h1>
      <form onSubmit={form.onSubmit(handleSubmit)} className="gap-2 flex flex-col" id="edit-staff-form">
        <TextInput
          id="input-email"
          label="อีเมล"
          placeholder="กรอกอีเมล"
          {...form.getInputProps("email")}
          radius={8}
          required
        />
        <TextInput
          id="input-first-name"
          label="ชื่อ"
          placeholder="กรอกชื่อ"
          {...form.getInputProps("first_name")}
          radius={8}
          required
        />
        <TextInput
          id="input-last-name"
          label="นามสกุล"
          placeholder="กรอกนามสกุล"
          {...form.getInputProps("last_name")}
          radius={8}
          required
        />
        <div className="flex gap-2 justify-between mt-2">
          <TextInput
            id="input-phone"
            className="w-[50%]"
            label="เบอร์โทร"
            placeholder="กรอกเบอร์โทร"
            {...form.getInputProps("phone")}
            radius={8}
            pattern="[0-9]*"
          />
          <TextInput
            id="input-code"
            className="w-[50%]"
            label="รหัสบุคลากร"
            placeholder="กรอกรหัสบุคลากร"
            {...form.getInputProps("code")}
            radius={8}
            required
          />
        </div>
        <div className="flex gap-2 justify-between mt-3">
          <Select
            id="select-user-status"
            className="w-[40%]"
            label="สถานะผู้ใช้"
            placeholder="เลือกสถานะ"
            data={teacherStatusOptions}
            {...form.getInputProps("user_status")}
            radius={8}
            required
          />

          <Select
            id="select-learning-area"
            className="w-[60%]"
            label="กลุ่มการเรียนรู้"
            placeholder="เช่น คณิตศาสตร์"
            data={learningAreaOptions}
            {...form.getInputProps("learning_area_id")}
            radius={8}
            required
          />
        </div>

        <Group justify="flex-end" className="mt-8" id="delete-button">
          <Button color="blue" variant="outline" onClick={close} radius={8}>
            ยกเลิก
          </Button>

          <Button type="submit" radius={8} id="save-button">
            บันทึก
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
