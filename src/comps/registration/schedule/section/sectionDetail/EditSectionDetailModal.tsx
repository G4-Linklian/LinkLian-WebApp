import { useRef, RefObject, useState, useEffect } from 'react';
import {
  Modal,
  Button,
  Group,
  TextInput,
  Checkbox,
  Select,
  Loader,
  Divider,
  Text,
  ActionIcon
} from "@mantine/core";
import { TimeInput } from '@mantine/dates';
import {
  IconSelector,
  IconClock
} from '@tabler/icons-react';
import { useForm } from "@mantine/form";
import { sectionFields } from "@/utils/interface/section.types";
import { useRouter } from "next/router";
import { getBuilding, getRoomLocation } from "@/utils/api/building";
import { dayOptions } from "@/utils/function/options";
import { useNotification } from '@/comps/noti/notiComp';
import { timeFormatter } from '@/config/formatters';

interface SectionEditModalProps {
  section: sectionFields | null;
  opened: boolean;
  close: () => void;
  onSubmit?: (values: sectionFields) => void;
  semesterData?: { value: string; label: string }[];
  token?: any;
}

export default function SectionDetailEditModal({
  section,
  opened,
  close,
  onSubmit,
  semesterData,
  token
}: SectionEditModalProps) {
  if (!section) return null;
  const router = useRouter();

  const [buildingOptions, setBuildingOptions] = useState<any[]>([]);
  const [roomOptions, setRoomOptions] = useState<any[]>([]);
  const [loadingBuilding, setLoadingBuilding] = useState(false);
  const [loadingRoom, setLoadingRoom] = useState(false);
  const { showNotification } = useNotification();

  const form = useForm<sectionFields>({
    initialValues: {
      day_of_week: 0,
      start_time: undefined,
      end_time: undefined,
      room_location_id: undefined,
      building_id: undefined,
      schedule_id: undefined,
      section_id: undefined
    },
  });
  useEffect(() => {
    if (!section) return;

    form.setValues({
      section_id: section.section_id,
      schedule_id: section.schedule_id,
      day_of_week: String(section.day_of_week),
      start_time: section.start_time,
      end_time: section.end_time,
      building_id: section.building_id
        ? String(section.building_id)
        : undefined,
      room_location_id: section.room_location_id
    });

    if (section.building_id) {
      setRoomOptions([
        {
          value: String(section.room_location_id),
          label: `${section.floor ?? ""}${section.room_number ?? ""}` || ""
        }
      ]);
    }

  }, [section]);


  useEffect(() => {
    if (!opened) return;

    setLoadingBuilding(true);
    getBuilding({ inst_id: token.institution.inst_id })
      .then((res) => {
        const options = res.data.map((b: any) => ({
          value: String(b.building_id),
          label: b.building_name,
        }));
        setBuildingOptions(options);
      })
      .finally(() => setLoadingBuilding(false));
  }, [opened]);

  useEffect(() => {
    const buildingId = form.values.building_id;
    if (!buildingId || buildingId === "" || buildingId === null || buildingId === undefined || buildingId === "null") {
      setRoomOptions([]);
      return;
    }

    setLoadingRoom(true);
    getRoomLocation({ building_id: Number(buildingId) })
      .then((res) => {
        const options = res.data.map((r: any) => ({
          value: String(r.room_location_id),
          label: `${r.floor ?? ""}${r.room_number ?? ""}`.trim(), // หรือ floor + room
        }));
        setRoomOptions(options);
      })
      .finally(() => setLoadingRoom(false));
  }, [form.values.building_id]);



  const handleSubmit = (values: sectionFields) => {

    if (!values.start_time || !values.end_time) {
      showNotification(
        'บันทึกข้อมูลไม่สำเร็จ',
        'กรุณาเลือกเวลาเริ่มต้นและเวลาสิ้นสุด',
        'error',
      );
      return;
    }

    const start = timeFormatter(String(values.start_time))
    const end = timeFormatter(String(values.end_time))

    if (end < start) {
      showNotification(
        'บันทึกข้อมูลไม่สำเร็จ',
        'กรุณาเลือกเวลาสิ้นสุดที่มากกว่าเวลาเริ่มต้น',
        'error',
      );
      return;
    }

    onSubmit?.(values);
    close();
  };


  const startTimeRef = useRef<HTMLInputElement>(null);
  const endTimeRef = useRef<HTMLInputElement>(null);

  const getPickerControl = (ref: RefObject<HTMLInputElement | null>) => (
    <ActionIcon variant="subtle" color="gray" onClick={() => ref.current?.showPicker()}>
      <IconClock size={16} stroke={1.5} />
    </ActionIcon>
  );

  return (
    <Modal
      opened={opened}
      onClose={close}
      centered
      size="md"
      radius={16}
    >
      <h1 className="color-black font-bold text-2xl mb-4 text-center">แก้ไขเวลาเรียน</h1>
      <form onSubmit={form.onSubmit(handleSubmit)} className="gap-4 flex flex-col">

        <Select
          label="วันเรียน"
          placeholder="เลือกวัน"
          data={dayOptions}
          {...form.getInputProps("day_of_week")}
          radius={8}
          required
        />

        <div className="flex space-x-4">
          <TimeInput
            label="เวลาเริ่มเรียน"
            lang="th"
            {...form.getInputProps("start_time")}
            ref={startTimeRef}
            rightSection={getPickerControl(startTimeRef)}
            className="w-[50%]"
            radius={8}
            required
          />

          <TimeInput
            label="เวลาสิ้นสุด"
            lang="th"
            {...form.getInputProps("end_time")}
            ref={endTimeRef}
            rightSection={getPickerControl(endTimeRef)}
            className="w-[50%]"
            radius={8}
            required
          />
        </div>


        <Divider />


        <Select
          label="ตึก"
          placeholder="เลือกตึก"
          data={buildingOptions}
          searchable
          clearable
          rightSection={loadingBuilding ? <Loader size={16} /> : <IconSelector size={16} />}
          {...form.getInputProps("building_id")}
          radius={8}
          required
          onChange={(value) => {
            form.setFieldValue("building_id", String(value));
            form.setFieldValue("room_location_id", undefined);
            setRoomOptions([]);
          }}
        />

        <Select
          label="ห้องเรียน"
          placeholder="เลือกห้อง"
          data={roomOptions}
          searchable
          clearable
          disabled={!form.values.building_id}
          rightSection={loadingRoom ? <Loader size={16} /> : <IconSelector size={16} />}
          {...form.getInputProps("room_location_id")}
          radius={8}
          required
        />


        <Group justify="flex-end" className="mt-4">

          <Button color="blue" variant="outline" radius={8}
            onClick={() => close()}
          >
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
