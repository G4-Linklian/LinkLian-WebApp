import { useState, useEffect } from 'react';
import {
  Button,
  Group,
  TextInput,
  Select,
  Loader,
} from "@mantine/core";
import {
  IconSelector,
} from '@tabler/icons-react';
import { useForm } from "@mantine/form";
import { sectionFields } from "@/utils/interface/section.types";
import { useRouter } from "next/router";
import { getSubject } from "@/utils/api/subject";
import { getBuilding } from "@/utils/api/building";
import { getRoomLocation } from '@/utils/api/roomLocation';
import { decodeRegistrationToken } from '@/utils/authToken';
import { useDebouncedValue } from '@mantine/hooks';

interface AddSectionModalFormProps {
  onSubmit: (values: sectionFields) => void;
  close: () => void;
  semesterData?: { value: string; label: string }[];
  token?: any;
  opened: boolean;
}

type SubjectOption = {
  value: string;
  label: string;
};

export default function AddSectionModalForm({
  onSubmit,
  close,
  semesterData,
  token,
  opened
}: AddSectionModalFormProps) {
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
          label: `${r.floor ?? ""}${r.room_number ?? ""}`.trim(),
        }));
        setRoomOptions(options);
      })
      .finally(() => setLoadingRoom(false));
  }, [form.values.building_id]);

  const handleSubmit = (values: sectionFields) => {
    const payload = {
      ...values,
      subject_id: values.subject_id ? Number(values.subject_id) : undefined,
      semester_id: values.semester_id ? Number(values.semester_id) : undefined,
    };
    onSubmit(payload);
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
      setSubjectOptions([]);
    }
  }, [debouncedSearch]);

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} className="gap-4 flex flex-col" id="add-section-form">

      <Select
        id="select-subject"
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
        radius={8}
        required
        rightSection={loading ? <Loader size={16} /> : <IconSelector size={16} />}
      />

      <Select
        id="select-semester"
        label="ปีการศึกษา"
        placeholder="เลือกปีการศึกษา"
        data={semesterData}
        value={router.query.semester_id as string || null}
        disabled={true}
        clearable={false}
        radius={8}
        required
      />

      <TextInput
        id="section-name"
        label="ชื่อกลุ่มเรียน"
        placeholder="เช่น S1"
        {...form.getInputProps("section_name")}
        required
        radius={8}
      />

      <Group justify="flex-end" className="mt-4">
        <Button color="blue" variant="outline" radius={8}
          onClick={() => close()}
          id="cancel-button"
        >
          ยกเลิก
        </Button>

        <Button type="submit" radius={8} id="submit-button">
          เพิ่มกลุ่มเรียน
        </Button>
      </Group>
    </form>
  );
}
