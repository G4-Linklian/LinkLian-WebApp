import {
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
import { studentStatusOptions } from "@/enums/userStatus";

interface AddStudentModalFormProps {
  onSubmit: (values: UserSysFields) => void;
  close: () => void;
  eduLevelOptions: { value: string; label: string }[];
  token?: any;
}

type ProgramOption = {
  value: string;
  label: string;
};

export default function AddStudentModalForm({
  onSubmit,
  close,
  eduLevelOptions,
  token
}: AddStudentModalFormProps) {

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

    if (!token) return;

    try {
      setLoadingProgram(true);

      const programData = await getProgram({
        inst_id: token.institution.inst_id,
        keyword,
        sort_order: "desc",
        tree_type: "leaf",
        limit: 10,
      });

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
    onSubmit(values);
    close();
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} className="gap-2 flex flex-col" id="add-student-form">
      <TextInput
        id="input-student-code"
        label="รหัสนักเรียน"
        placeholder="กรอกรหัสนักเรียน"
        {...form.getInputProps("code")}
        radius={8}
        required
      />
      <TextInput
        id="input-first-name"
        label="ชื่อ"
        placeholder="กรอกชื่อ"
        {...form.getInputProps("first_name")}
        radius={8}
        required
      />
      <TextInput
        id="input-last-name"
        label="นามสกุล"
        placeholder="กรอกนามสกุล"
        {...form.getInputProps("last_name")}
        radius={8}
        required
      />
      <TextInput
        id="input-email"
        label="อีเมล"
        placeholder="กรอกอีเมล"
        {...form.getInputProps("email")}
        radius={8}
        required
      />
      <TextInput
        id="input-phone"
        label="เบอร์โทร"
        placeholder="กรอกเบอร์โทร"
        {...form.getInputProps("phone")}
        radius={8}
      />
      <div className="flex gap-2 justify-between mt-3">
        <Select
          id="select-edu-level"
          className="w-[40%]"
          label="ชั้น"
          placeholder="เช่น ม.1"
          data={eduLevelOptions}
          {...form.getInputProps("edu_lev_id")}
          radius={8}
          required
        />

        <Select
          id="select-program"
          className="w-[60%]"
          label="ห้องเรียน"
          placeholder="ค้นหาห้องเรียน"
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
        id="select-student-status"
        className="w-[100%] mt-3"
        label="สถานะผู้ใช้"
        placeholder="เลือกสถานะ"
        data={studentStatusOptions}
        {...form.getInputProps("user_status")}
        radius={8}
        required
      />

      <Group justify="flex-end" className="mt-8">
        <Button color="blue" variant="outline" onClick={close} radius={8} id="cancel-button">
          ยกเลิก
        </Button>

        <Button type="submit" radius={8} id="submit-button">
          บันทึก
        </Button>
      </Group>
    </form>
  );
}
