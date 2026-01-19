import {
  Modal,
  Button,
  Group,
  TextInput,
  SegmentedControl,
  NumberInput,
  Stack,
  Divider,
  Text,
  Space
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";

export interface RoomPayload {
  building_id: number;
  floor: string;
  room_number: string;
  room_remark?: string;
}

interface AddRoomLocationModalProps {
  opened: boolean;
  close: () => void;
  onSubmit?: (values: RoomPayload[]) => void;
  buildingId: number;
}

type CreateMode = "single" | "floor" | "building";

export default function AddRoomLocationModal({
  opened,
  close,
  onSubmit,
  buildingId,
}: AddRoomLocationModalProps) {
  const [mode, setMode] = useState<CreateMode>("single");

  // Form จะเก็บค่า config สำหรับการ Gen
  const form = useForm({
    initialValues: {
      // Common
      room_remark: "",
      
      // Mode: Single
      single_floor: "",
      single_room: "",

      // Mode: Floor (สร้างหลายห้อง ใน 1 ชั้น)
      floor_target: "",
      room_start: 1,
      room_end: 10,

      // Mode: Building (สร้างหลายชั้น ชั้นละหลายห้อง)
      floor_start: 1,
      floor_end: 5,
      b_room_start: 1,
      b_room_end: 10,
    },
    validate: {
        single_floor: (value, values) => mode === 'single' && !value ? 'กรุณาระบุชั้น' : null,
        single_room: (value, values) => mode === 'single' && !value ? 'กรุณาระบุเลขห้อง' : null,
        floor_target: (value, values) => mode === 'floor' && !value ? 'กรุณาระบุชั้น' : null,
    }
  });

  // Reset form เมื่อเปิด Modal ใหม่ หรือเปลี่ยนโหมด
  useEffect(() => {
    if (opened) form.reset();
  }, [opened]);

  // Helper: เติมเลข 0 ข้างหน้า (เช่น 1 -> "01")
  const padNumber = (num: number) => num.toString().padStart(2, "0");

  const handleSubmit = (values: typeof form.values) => {
    const payloads: RoomPayload[] = [];

    if (mode === "single") {
      // 1. สร้างรายห้อง (Single)
      payloads.push({
        building_id: Number(buildingId),
        floor: values.single_floor,
        room_number: values.single_room,
        room_remark: values.room_remark,
      });
    } else if (mode === "floor") {
      // 2. สร้างรายชั้น (Floor) -> ระบุชั้น, รันเลขห้อง
      const start = Number(values.room_start);
      const end = Number(values.room_end);

      for (let i = start; i <= end; i++) {
        payloads.push({
          building_id: Number(buildingId),
          floor: values.floor_target,
          room_number: padNumber(i), // ผลลัพธ์จะเป็น "01", "02", ... "12"
          room_remark: values.room_remark,
        });
      }
    } else if (mode === "building") {
      // 3. สร้างรายตึก (Building) -> รันชั้น, รันเลขห้อง
      const fStart = Number(values.floor_start);
      const fEnd = Number(values.floor_end);
      const rStart = Number(values.b_room_start);
      const rEnd = Number(values.b_room_end);

      for (let f = fStart; f <= fEnd; f++) {
        for (let r = rStart; r <= rEnd; r++) {
          payloads.push({
            building_id: Number(buildingId),
            floor: f.toString(),
            room_number: padNumber(r),
            room_remark: values.room_remark, 
          });
        }
      }
    }

    console.log("Generated Payloads:", payloads);
    onSubmit?.(payloads);
    close();
  };

  return (
    <Modal
      opened={opened}
      onClose={close}
      centered
      size="lg"
      radius={16}
      padding={24}
    >
      <h1 className="color-black font-bold text-2xl mb-8 text-center">เพิ่มห้องเรียน</h1>
      <Stack gap="md">

        <SegmentedControl
          fullWidth
          value={mode}
          radius={8}
          size="md"
          onChange={(val) => setMode(val as CreateMode)}
          data={[
            { label: "รายห้อง", value: "single" },
            { label: "รายชั้น", value: "floor" },
            { label: "รายตึก", value: "building" },
          ]}
        />

        <Divider />

        <form onSubmit={form.onSubmit(handleSubmit)} className="flex flex-col gap-4">
          
          {/* --- MODE 1: SINGLE --- */}
          {mode === "single" && (
            <>
              <Group grow>
                <TextInput
                  label="ชั้น"
                  placeholder="เช่น 6"
                  {...form.getInputProps("single_floor")}
                  required
                  radius={8}
                />
                <TextInput
                  label="หมายเลขห้อง"
                  placeholder="เช่น 07"
                  {...form.getInputProps("single_room")}
                  required
                  radius={8}
                />
              </Group>
            </>
          )}

          {/* --- MODE 2: FLOOR --- */}
          {mode === "floor" && (
            <>
              <TextInput
                label="ชั้นที่ต้องการสร้าง"
                placeholder="เช่น 6"
                description="ระบุชั้นที่ต้องการเพิ่มห้อง"
                {...form.getInputProps("floor_target")}
                required
                radius={8}
              />
              <Group grow>
                <NumberInput
                  label="เริ่มห้องเลขที่"
                  min={1}
                  {...form.getInputProps("room_start")}
                  radius={8}
                />
                <NumberInput
                  label="ถึงห้องเลขที่"
                  min={1}
                  {...form.getInputProps("room_end")}
                  radius={8}
                />
              </Group>
              <Text size="xs" c="dimmed">
                ระบบจะสร้างห้องตั้งแต่ {padNumber(form.values.room_start)} ถึง {padNumber(form.values.room_end)} ในชั้น {form.values.floor_target || "?"}
              </Text>
            </>
          )}

          {/* --- MODE 3: BUILDING --- */}
          {mode === "building" && (
            <>
              <Text fw={500} size="sm">ช่วงของชั้น (Floor Range)</Text>
              <Group grow>
                <NumberInput
                  label="เริ่มชั้นที่"
                  min={1}
                  {...form.getInputProps("floor_start")}
                  radius={8}
                />
                <NumberInput
                  label="ถึงชั้นที่"
                  min={1}
                  {...form.getInputProps("floor_end")}
                  radius={8}
                />
              </Group>
              
              <Text fw={500} size="sm" mt="xs">ช่วงของห้องในแต่ละชั้น (Room Range per Floor)</Text>
              <Group grow>
                <NumberInput
                  label="เริ่มห้องเลขที่"
                  min={1}
                  {...form.getInputProps("b_room_start")}
                  radius={8}
                />
                <NumberInput
                  label="ถึงห้องเลขที่"
                  min={1}
                  {...form.getInputProps("b_room_end")}
                  radius={8}
                />
              </Group>
               <Text size="xs" c="dimmed">
                ระบบจะสร้างห้อง {padNumber(form.values.b_room_start)}-{padNumber(form.values.b_room_end)} ให้กับทุกชั้นตั้งแต่ชั้น {form.values.floor_start} ถึง {form.values.floor_end}
              </Text>
            </>
          )}


          <TextInput
            label="หมายเหตุ (ใช้ร่วมกัน)"
            placeholder="เช่น ห้องเล็คเชอร์, ห้องแล็บ"
            {...form.getInputProps("room_remark")}
            radius={8}
          />

          <Group justify="flex-end" mt="2xl">
            <Button variant="default" onClick={close} radius={8}>
              ยกเลิก
            </Button>
            <Button type="submit" radius={8}>
              สร้างข้อมูล ({mode === 'single' ? 1 : 'Multiple'})
            </Button>
          </Group>
        </form>
      </Stack>
    </Modal>
  );
}