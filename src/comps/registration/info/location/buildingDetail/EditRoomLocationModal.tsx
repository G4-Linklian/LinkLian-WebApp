import {
  Modal,
  Button,
  Group,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { buildingFields } from "@/utils/interface/building.types";
import { useEffect } from "react";

interface EditRoomLocationModalProps {
  roomLocation: buildingFields | null;
  opened: boolean;
  close: () => void;
  onSubmit?: (values: buildingFields) => void;
}

export default function EditRoomLocationModal({
  roomLocation,
  opened,
  close,
  onSubmit,
}: EditRoomLocationModalProps) {
  if (!roomLocation) return null;

  const form = useForm<buildingFields>({
    initialValues: {
      floor: "",
      room_number: "",
      room_remark: "",
    },
  });

  useEffect(() => {
    if (!roomLocation) return;

    form.setValues({
      floor: roomLocation.floor ?? "",
      room_number: roomLocation.room_number ?? "",
      room_remark: roomLocation.room_remark ?? "",
    });
  }, [roomLocation]);

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
      <h1 className="color-black font-bold text-2xl mb-4 text-center">จัดการห้องเรียน</h1>
      <form onSubmit={form.onSubmit(handleSubmit)} className="gap-2 flex flex-col">
        <TextInput
          label="ชั้น"
          placeholder="เช่น 1"
          {...form.getInputProps("floor")}
          required
          mb="sm"
          radius={8}
        />

        <TextInput
          label="หมายเลขห้อง"
          placeholder="เช่น 01, 02, 11"
          {...form.getInputProps("room_number")}
          required
          mb="sm"
          radius={8}
        />

        <TextInput
          label="หมายเหตุ"
          placeholder="เช่น ห้องปฏิบัติการคอมพิวเตอร์"
          {...form.getInputProps("room_remark")}
          mb="sm"
          radius={8}
        />

        <Group justify="flex-end" className="mt-4">
          <Button color="blue" variant="outline" radius={8} onClick={close} >
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
