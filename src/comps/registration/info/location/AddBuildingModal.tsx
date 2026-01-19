import {
  Modal,
  Button,
  Group,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { buildingFields } from "@/utils/interface/building.types";

interface AddBuildingModalProps {
  opened: boolean;
  close: () => void;
  onSubmit?: (values: buildingFields) => void;
}

export default function AddBuildingModal({
  opened,
  close,
  onSubmit,
}: AddBuildingModalProps) {
  const form = useForm<buildingFields>({
    initialValues: {
      inst_id: 0,
      building_name: "",
      building_no: "",
      remark: "",
    },
  });

  const handleSubmit = (values: buildingFields) => {
    console.log("add building:", values);
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
        เพิ่มอาคาร
      </h1>

      <form
        onSubmit={form.onSubmit(handleSubmit)}
        className="flex flex-col gap-2"
      >
        <TextInput
          label="ชื่ออาคาร"
          placeholder="เช่น อาคารเรียนรวม"
          {...form.getInputProps("building_name")}
          required
          radius={8}
        />

        <TextInput
          label="หมายเลขอาคาร"
          placeholder="เช่น 1"
          {...form.getInputProps("building_no")}
          required
          radius={8}
        />

        <TextInput
          label="หมายเหตุ"
          placeholder="เช่น เป็นอาคารเรียนสำหรับ"
          {...form.getInputProps("remark")}
          radius={8}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={close} radius={8}>
            ยกเลิก
          </Button>

          <Button type="submit" radius={8}>
            เพิ่มอาคาร
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
