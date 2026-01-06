import {
  Modal,
  Button,
  Group,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { buildingFields } from "@/utils/interface/building.types";
import { useEffect } from "react";

interface EditBuildingModalProps {
  building: buildingFields | null;
  opened: boolean;
  close: () => void;
  onSubmit?: (values: buildingFields) => void;
}

export default function EditBuildingModal({
  building,
  opened,
  close,
  onSubmit,
}: EditBuildingModalProps) {
  if (!building) return null;

  const form = useForm<buildingFields>({
    initialValues: {
      building_name: "",
      building_no: "",
      remark: "",
    },
  });

  useEffect(() => {
    if (!building) return;

    form.setValues({
      building_name: building.building_name ?? "",
      building_no: building.building_no ?? "",
      remark: building.remark ?? "",
    });
  }, [building]);

  const handleSubmit = (values: buildingFields) => {
    console.log("submit values:", values);
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
      <h1 className="color-black font-bold text-2xl mb-4 text-center">จัดการอาคาร</h1>
      <form onSubmit={form.onSubmit(handleSubmit)} className="gap-2 flex flex-col">
        <TextInput
          label="ชื่ออาคาร"
          placeholder="เช่น อาคารเรียนรวม"
          {...form.getInputProps("building_name")}
          required
          mb="sm"
          radius={8}
        />

        <TextInput
          label="หมายเลขอาคาร"
          placeholder="เช่น 101"
          {...form.getInputProps("building_no")}
          required
          mb="sm"
          radius={8}
        />

        <TextInput
          label="หมายเหตุ"
          placeholder="เช่น อาคารใหม่"
          {...form.getInputProps("remark")}
          mb="sm"
          radius={8}
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
