import {
  Modal,
  Button,
  Group,
  TextInput,
  Select,
  Loader
} from "@mantine/core";
import { IconSelector } from '@tabler/icons-react';
import { useForm } from "@mantine/form";
import { UserSysFields } from "@/utils/interface/user.types";
import { useEffect, useState } from "react";
import { useDebouncedValue } from '@mantine/hooks';
import { getProgram } from "@/utils/api/program";

interface AddStudentModalProps {
  opened: boolean;
  close: () => void;
  onSubmit?: (values: UserSysFields) => void;
  eduLevelOptions: { value: string; label: string }[];
  token?: any;
}

type ProgramOption = {
  value: string;
  label: string;
};

export default function AddStudentModal({
  opened,
  close,
  onSubmit,
  eduLevelOptions,
  token
}: AddStudentModalProps) {

  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchValue, 300);
  const [programOptions, setProgramOptions] = useState<{ value: string; label: string }[]>([]);
  const [loadingProgram, setLoadingProgram] = useState(false);

  const form = useForm<UserSysFields>({
    initialValues: {
      email: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      phone: "",
      code: "",
      user_status: "",
      edu_lev_id: undefined,
      program_id: undefined,
      user_sys_id: undefined,
    },
  });

  const fetchProgram = async (keyword: string) => {
    console.log("Fetching programs with keyword:", keyword);

    if (!token) return;

    try {
      setLoadingProgram(true);

      const programData = await getProgram({
        inst_id: token.institution.inst_id,
        keyword,
        sort_order: "desc",
      });

      console.log("Fetched program data:", programData);

      const options: ProgramOption[] = programData.data.map((programs: any) => ({
        value: programs.program_id,
        label: `${programs.program_name} - ${programs.remark}`,
      }));

      setProgramOptions(prev => {
        const map = new Map<string, ProgramOption>();
        [...prev, ...options].forEach(item => {
          map.set(item.value, item);
        });

        return Array.from(map.values());
      });
    } catch (error) {
      console.error("Failed to fetch programs:", error);
    } finally {
      setLoadingProgram(false);
    }
  };

  useEffect(() => {
    if (debouncedSearch.length >= 1) {
      fetchProgram(debouncedSearch);
    } else if (debouncedSearch.length === 0) {
      setProgramOptions([]);
    }
  }, [debouncedSearch]);

  const handleSubmit = (values: UserSysFields) => {
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
      <h1 className="color-black font-bold text-2xl mb-4 text-center">เพิ่มนักเรียน</h1>
      <form onSubmit={form.onSubmit(handleSubmit)} className="gap-2 flex flex-col">
        <TextInput
            label="รหัสนักเรียน"
            placeholder="กรอกรหัสนักเรียน"
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
          label="ชื่อกลาง"
          placeholder="กรอกชื่อกลาง"
          {...form.getInputProps("middle_name")}
          radius={8}
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
        <TextInput
            label="เบอร์โทร"
            placeholder="กรอกเบอร์โทร"
            {...form.getInputProps("phone")}
            radius={8}
          />
        <div className="flex gap-2 justify-between mt-3">

          <Select
            className="w-[40%]"
            label="ชั้น"
            placeholder="เช่น ม.1"
            data={eduLevelOptions}
            {...form.getInputProps("edu_lev_id")}
            radius={8}
            required
          />

          <Select
            className="w-[60%]"
            label="ห้องเรียน"
            placeholder="พิมพ์ชื่อห้องเรียน"
            data={programOptions}
            searchable
            nothingFoundMessage={loadingProgram ? "กำลังค้นหา..." : "ไม่พบรายห้องเรียน"}
            onSearchChange={setSearchValue}
            searchValue={searchValue}
            clearable
            {...form.getInputProps("program_id")}
            filter={({ options }) => options}
            radius={8}
            rightSection={loadingProgram ? <Loader size={16} /> : <IconSelector size={16} />}
            required
          />


        </div>

        <Select
          className="w-[100%] mt-3"
          label="สถานะผู้ใช้"
          placeholder="เลือกสถานะ"
          data={[
            { value: "Active", label: "Active (ใช้งาน)" },
            { value: "Inactive", label: "Inactive (ไม่ใช้งาน)" },
            // { value: "Resigned", label: "Resigned (ลาออก)" },
            // { value: "Graduated", label: "Graduated (สำเร็จการศึกษา)" },
          ]}
          {...form.getInputProps("user_status")}
          radius={8}
          required
        />

        <Group justify="flex-end" className="mt-8">
          <Button color="blue" variant="outline" onClick={close} radius={8}>
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
