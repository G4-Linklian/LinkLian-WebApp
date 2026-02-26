import {
  Modal,
  Button,
  Group,
  TextInput,
  Select,
  Loader
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { UserSysFields } from "@/utils/interface/user.types";
import { useEffect, useState } from "react";
import { IconFilter, IconSelector } from "@tabler/icons-react";
import { useDebouncedValue } from "@mantine/hooks";
import { getProgram } from "@/utils/api/program";
import { decodeRegistrationToken } from '@/utils/authToken';
import { studentStatusOptions } from "@/enums/userStatus";

interface FilterStudentModalProps {
  opened: boolean;
  close: () => void;
  onSubmit: (values: UserSysFields) => void;
  onClear: () => void;
  eduLevelOptions?: { value: string; label: string }[];
  initialValues: UserSysFields;
}

type ProgramOption = {
  value: string;
  label: string;
};

export default function FilterStudentModal({
  opened,
  close,
  onSubmit,
  onClear,
  eduLevelOptions = [],
  initialValues,
}: FilterStudentModalProps) {
  const [token, setToken] = useState<any | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchValue, 300);
  const [programOptions, setProgramOptions] = useState<{ value: string; label: string }[]>([]);
  const [loadingProgram, setLoadingProgram] = useState(false);

  useEffect(() => {
    const token = decodeRegistrationToken();
    setToken(token);
  }, []);

  const fetchProgram = async (keyword: string) => {

    if (!token) return;

    try {
      setLoadingProgram(true);

      const subjectData = await getProgram({
        inst_id: token.institution.inst_id,
        keyword,
        sort_order: "desc",
        tree_type: "leaf",
        limit: 10,
      });

      const options: ProgramOption[] = subjectData.data.map((programs: any) => ({
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
    } else if (debouncedSearch.length === 0 && initialValues.program_id && initialValues.program_name) {
      const programOption = {
        value: String(initialValues.program_id),
        label: `${initialValues.program_name}`,
      };
      setProgramOptions([programOption]);
    }
  }, [debouncedSearch, token]);


  const form = useForm<UserSysFields>({
    initialValues: {
      user_status: "Active",
      edu_lev_id: undefined,
      program_id: undefined,
    },
  });

  // Sync form values with initialValues when modal opens or initialValues changes
  useEffect(() => {
    if (opened) {
      form.setValues(initialValues);
    }
  }, [opened, initialValues]);

  const handleSubmit = (values: UserSysFields) => {
    const filteredValues: UserSysFields = {};

    // Helper to check if value exists
    const hasValue = (val: any) => val !== "" && val !== undefined && val !== null;

    if (hasValue(values.user_status)) filteredValues.user_status = values.user_status;
    if (hasValue(values.edu_lev_id)) filteredValues.edu_lev_id = values.edu_lev_id;
    if (hasValue(values.program_id)) filteredValues.program_id = values.program_id;

    onSubmit(filteredValues);
    close();
  };

  const handleClear = () => {
    form.reset();
    setProgramOptions([]);
    setSearchValue('');
    onClear();
    close();
  }

  return (
    <Modal
      id="filter-student-modal"
      opened={opened}
      onClose={close}
      centered
      size="md"
      radius={16}
    >
      <h1 className="color-black font-bold text-2xl mb-4 text-center">ตัวกรองนักเรียน</h1>
      <form onSubmit={form.onSubmit(handleSubmit)} className="gap-2 flex flex-col" id="filter-student-form">
        <Select
          id="select-edu-level"
          className="mt-2"
          label="ระดับชั้น"
          placeholder="เลือกระดับชั้น"
          data={eduLevelOptions}
          {...form.getInputProps("edu_lev_id")}
          radius={8}
          clearable
        />

        <Select
          id="select-classroom" 
          className="mt-2"
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
        />

        <Select
          id="select-student-status"
          className="mt-2"
          label="สถานะ"
          placeholder="เลือกสถานะ"
          data={studentStatusOptions}
          {...form.getInputProps("user_status")}
          radius={8}
          clearable
        />

        <Group justify="right" mt="lg">
          <Button
            variant="default"
            onClick={handleClear}
            radius={8}
            id="clear-filter-button"
          >
            ล้างค่า
          </Button>
          <Button
            id="apply-filter-button"
            type="submit"
            radius={8}
            leftSection={<IconFilter size={16} />}
          >
            ค้นหา
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
