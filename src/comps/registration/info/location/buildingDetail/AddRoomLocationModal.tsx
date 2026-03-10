import {
  Modal,
  Button,
  Group,
  TextInput,
  SegmentedControl,
  Stack,
  Divider,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";

export interface RoomPayload {
  building_id: number;
  // floor: string;
  room_number: string;
  room_remark?: string;
}

interface AddRoomLocationModalProps {
  opened: boolean;
  close: () => void;
  onSubmit?: (values: RoomPayload[]) => void;
  buildingId: number;
}

type CreateMode = "single" | "floor";

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
      // floor_target: "",
      room_start: "",
      room_end: "",

    },
    validate: {
        // single_floor: (value, values) => mode === 'single' && !value ? 'กรุณาระบุชั้น' : null,
        single_room: (value, values) => mode === 'single' && !value ? 'กรุณาระบุเลขห้อง' : null,
        // floor_target: (value, values) => mode === 'floor' && !value ? 'กรุณาระบุชั้น' : null,
    }
  });

  // Reset form เมื่อเปิด Modal ใหม่ หรือเปลี่ยนโหมด
  useEffect(() => {
    if (opened) form.reset();
  }, [opened]);

  // แยก prefix กับเลขห้อง
  const parseRoomNumber = (roomStr: string) => {
    if (!roomStr) {
      roomStr = String(roomStr || ""); 
    }

    const match = roomStr.match(/^(.*?)(\d+)$/);
    if (match) {
      return {
        prefix: match[1],
        num: parseInt(match[2], 10),
        numLength: match[2].length,
      };
    }
    return null;
  };

  const formatRoomNumber = (prefix: string, num: number, length: number) => {
    const result = prefix + num.toString();
    return result;
  };

  const getRoomCount = (startRoom: string, endRoom: string) => {
    const startParsed = parseRoomNumber(startRoom);
    const endParsed = parseRoomNumber(endRoom);
    if (startParsed && endParsed && startParsed.prefix === endParsed.prefix) {
      return Math.max(0, endParsed.num - startParsed.num + 1);
    }
    return 0;
  };

  const handleSubmit = (values: typeof form.values) => {
    const payloads: RoomPayload[] = [];

    if (mode === "single") {
      // 1. สร้างรายห้อง (Single)
      payloads.push({
        building_id: Number(buildingId),
        room_number: values.single_room,
        room_remark: values.room_remark,
      });
    } else if (mode === "floor") {
      // 2. สร้างรายชั้น (Floor) -> ระบุห้องเริ่มต้นและสิ้นสุด
      const startParsed = parseRoomNumber(values.room_start);
      const endParsed = parseRoomNumber(values.room_end);

      if (startParsed && endParsed && startParsed.prefix === endParsed.prefix) {
        for (let i = startParsed.num; i <= endParsed.num; i++) {
          payloads.push({
            building_id: Number(buildingId),
            room_number: formatRoomNumber(startParsed.prefix, i, startParsed.numLength),
            room_remark: values.room_remark,
          });
        }
      }
    }

    onSubmit?.(payloads);
    close();
  };

  return (
    <Modal
      id="add-room-location-modal"
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
          ]}
        />

        <Divider />

        <form onSubmit={form.onSubmit(handleSubmit)} className="flex flex-col gap-4">
          
          {/* --- MODE 1: SINGLE --- */}
          {mode === "single" && (
            <>
              <Group grow>
                <TextInput
                  id="input-single-room"
                  label="หมายเลขห้อง"
                  placeholder="เช่น SCL607"
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
              <Group grow>
                <TextInput
                  id="input-room-start"
                  label="เริ่มห้องเลขที่"
                  placeholder="เช่น SCL601"
                  {...form.getInputProps("room_start")}
                  radius={8}
                  required
                />
                <TextInput
                  id="input-room-end"
                  label="ถึงห้องเลขที่"
                  placeholder="เช่น SCL607"
                  {...form.getInputProps("room_end")}
                  radius={8}
                  required
                />
              </Group>
              <Text size="xs" c="dimmed">
                {form.values.room_start && form.values.room_end 
                  ? `ระบบจะสร้างห้องตั้งแต่ ${form.values.room_start} ถึง ${form.values.room_end} (${getRoomCount(form.values.room_start, form.values.room_end)} ห้อง)`
                  : "กรุณาระบุห้องเริ่มต้นและสิ้นสุด"}
              </Text>
            </>
          )}

          <TextInput
            id="input-room-remark"
            label="หมายเหตุ (ใช้ร่วมกัน)"
            placeholder="เช่น ห้องเล็คเชอร์, ห้องแล็บ"
            {...form.getInputProps("room_remark")}
            radius={8}
          />

          <Group justify="flex-end" mt="2xl">
            <Button variant="default" onClick={close} radius={8} id="cancel-button">
              ยกเลิก
            </Button>
            <Button type="submit" radius={8} id="submit-button">
              สร้างข้อมูล ({mode === 'single' ? 1 : getRoomCount(form.values.room_start, form.values.room_end)} ห้อง)
            </Button>
          </Group>
        </form>
      </Stack>
    </Modal>
  );
}