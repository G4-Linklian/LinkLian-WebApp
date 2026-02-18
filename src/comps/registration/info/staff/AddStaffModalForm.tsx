import { Button, Group, Select, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { UserSysFields } from "@/utils/interface/user.types";
import { teacherStatusOptions } from "@/enums/userStatus";

interface AddStaffModalFormProps {
  onSubmit: (values: UserSysFields) => void;
  close: () => void;
  learningAreaOptions?: { value: string; label: string }[];
}

export default function AddStaffModalForm({
  onSubmit,
  close,
  learningAreaOptions = [],
}: AddStaffModalFormProps) {
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

  const handleSubmit = (values: UserSysFields) => {
    onSubmit(values);
    close();
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} className="gap-2 flex flex-col">
      <TextInput
        label="รหัสบุคลากร"
        placeholder="กรอกรหัสบุคลากร"
        {...form.getInputProps("code")}
        radius={8}
        required
      />

      <TextInput
        label="ชื่อ"
        placeholder="กรอกชื่อ"
        {...form.getInputProps("first_name")}
        radius={8}
        required
      />
      <TextInput
        label="นามสกุล"
        placeholder="กรอกนามสกุล"
        {...form.getInputProps("last_name")}
        radius={8}
        required
      />

      <TextInput
        label="อีเมล"
        placeholder="กรอกอีเมล"
        {...form.getInputProps("email")}
        radius={8}
        required
      />

      <div className="flex gap-2 justify-between mt-2">
        <TextInput
          className="w-[50%]"
          label="เบอร์โทร"
          placeholder="กรอกเบอร์โทร"
          {...form.getInputProps("phone")}
          radius={8}
        />

        <Select
          className="w-[60%]"
          label="กลุ่มการเรียนรู้"
          placeholder="เช่น คณิตศาสตร์"
          data={learningAreaOptions}
          {...form.getInputProps("learning_area_id")}
          radius={8}
          required
        />
      </div>

      <Select
        label="สถานะผู้ใช้"
        placeholder="เลือกสถานะ"
        data={teacherStatusOptions}
        {...form.getInputProps("user_status")}
        radius={8}
        required
      />

      <Group justify="flex-end" className="mt-8">
        <Button color="blue" variant="outline" onClick={close} radius={8}>
          ยกเลิก
        </Button>

        <Button type="submit" radius={8}>
          เพิ่มบุคลากร
        </Button>
      </Group>
    </form>
  );
}
