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
import {
  IconSelector,
  IconClock
} from '@tabler/icons-react';
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { sectionFields } from "@/utils/interface/section.types";
import { useRouter } from "next/router";
import { getSubject } from "@/utils/api/subject";
import { getBuilding, getRoomLocation } from "@/utils/api/building";
import { decodeRegistrationToken } from '@/utils/authToken';
import { useDebouncedValue } from '@mantine/hooks';

interface SectionEditModalProps {
  section: sectionFields | null;
  opened: boolean;
  close: () => void;
  onSubmit?: (values: sectionFields) => void;
  semesterData?: { value: string; label: string }[];
  token?: any;
}

type SubjectOption = {
  value: string;
  label: string;
};

export default function SectionEditModal({
  section,
  opened,
  close,
  onSubmit,
  semesterData,
  token
}: SectionEditModalProps) {
  if (!section) return null;
  const router = useRouter();

  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchValue, 300);
  const [subjectOptions, setSubjectOptions] = useState<SubjectOption[]>([]);
  const [loading, setLoading] = useState(false);

  const [buildingOptions, setBuildingOptions] = useState<any[]>([]);
  const [roomOptions, setRoomOptions] = useState<any[]>([]);
  const [loadingBuilding, setLoadingBuilding] = useState(false);
  const [loadingRoom, setLoadingRoom] = useState(false);


  const form = useForm<sectionFields>({
    initialValues: {
      semester_id: undefined,
      subject_id: undefined,
      section_name: "",
    },
  });

  useEffect(() => {
    if (!section) return;

    form.setValues({
      section_id: section.section_id,
      semester_id: section.semester_id,
      subject_id: section.subject_id,
      section_name: section.section_name,
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
    onSubmit?.(values);
    close();
  };


  const fetchSubjects = async (keyword: string) => {
    const token = decodeRegistrationToken();
    const instId = token?.institution?.inst_id;

    if (!instId) return;

    try {
      setLoading(true);

      const subjectData = await getSubject({
        inst_id: instId,
        keyword,
        sort_order: "desc",
      });

      const options: SubjectOption[] = subjectData.data.map((subjects: any) => ({
        value: subjects.subject_id,
        label: `${subjects.subject_code} ${subjects.name_th}`,
      }));

      setSubjectOptions(prev => {
        const map = new Map<string, SubjectOption>();

        [...prev, ...options].forEach(item => {
          map.set(item.value, item);
        });

        return Array.from(map.values());
      });
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debouncedSearch.length >= 2) {
      fetchSubjects(debouncedSearch);
    } else if (debouncedSearch.length === 0) {
      const subjectOption = {
        value: String(section.subject_id),
        label: `${section.subject_code} ${section.name_th}`,
      };

      setSubjectOptions([subjectOption]);
    }
  }, [debouncedSearch]);

  return (
    <Modal
      opened={opened}
      onClose={close}
      centered
      size="md"
      radius={16}
    >
      <h1 className="color-black font-bold text-2xl mb-4 text-center">แก้ไข Section การเรียน</h1>
      <form onSubmit={form.onSubmit(handleSubmit)} className="gap-4 flex flex-col">

        <Select
          label="เลือกรายวิชา"
          placeholder="พิมพ์รหัสหรือชื่อวิชา (อย่างน้อย 2 ตัวอักษร)"
          data={subjectOptions}
          searchable
          nothingFoundMessage={loading ? "กำลังค้นหา..." : "ไม่พบรายวิชา"}
          onSearchChange={setSearchValue}
          searchValue={searchValue}
          clearable
          {...form.getInputProps("subject_id")}
          filter={({ options }) => options}

          rightSection={loading ? <Loader size={16} /> : <IconSelector size={16} />}
          radius={8}
        />

        <Select
          label="ปีการศึกษา"
          placeholder="เลือกปีการศึกษา"
          data={semesterData}
          value={router.query.semester_id as string || String(section.semester_id) || null}
          disabled={true}
          clearable={false}
          radius={8}
        />

        <TextInput
          label="ชื่อ Section"
          placeholder="เช่น S1"
          {...form.getInputProps("section_name")}
          required
          radius={8}
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
