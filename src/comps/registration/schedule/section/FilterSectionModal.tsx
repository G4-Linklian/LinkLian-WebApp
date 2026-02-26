import {
  Modal,
  Button,
  Group,
  Select,
  Loader,
  TextInput
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { sectionFields } from "@/utils/interface/section.types";
import { useEffect, useState } from "react";
import { IconFilter, IconSelector } from "@tabler/icons-react";
import { useDebouncedValue } from "@mantine/hooks";
import { getSubject } from "@/utils/api/subject";
import { getLearningArea } from "@/utils/api/learningArea";
import { decodeRegistrationToken } from '@/utils/authToken';

interface FilterSectionModalProps {
  opened: boolean;
  close: () => void;
  onSubmit: (values: sectionFields) => void;
  onClear: () => void;
  initialValues: sectionFields;
}

type SubjectOption = {
    value: string;
    label: string;
};

export default function FilterSectionModal({
  opened,
  close,
  onSubmit,
  onClear,
  initialValues,
}: FilterSectionModalProps) {
  const [token, setToken] = useState<any | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchValue, 300);
  const [subjectOptions, setSubjectOptions] = useState<SubjectOption[]>([]);
  const [learningAreaOptions, setLearningAreaOptions] = useState<{ value: string; label: string }[]>([]);
  const [loadingSubject, setLoadingSubject] = useState(false);

  useEffect(() => {
    const token = decodeRegistrationToken();
    setToken(token);
  }, []);

  const fetchSubject = async (keyword: string) => {
    if (!token) return;

    try {
      setLoadingSubject(true);

      const subjectData = await getSubject({
        inst_id: token.institution.inst_id,
        keyword,
        sort_order: "desc",
        limit: 10,
      });

      const options: SubjectOption[] = subjectData.data.map((subject: any) => ({
        value: subject.subject_id,
        label: `${subject.subject_code} - ${subject.name_th}`,
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
      setLoadingSubject(false);
    }
  };

  useEffect(() => {
    if (debouncedSearch.length >= 1) {
      fetchSubject(debouncedSearch);
    } else if (debouncedSearch.length === 0 && initialValues.subject_id && initialValues.name_th) {
       const subjectOption = {
        value: String(initialValues.subject_id),
        label: `${initialValues.subject_code} - ${initialValues.name_th}`, 
      };
       setSubjectOptions([subjectOption]);
    }
  }, [debouncedSearch, token]);

  useEffect(() => {
    const fetchLearningAreas = async () => {
        try {
            if (token?.institution?.inst_id) {
                const learningAreaData = await getLearningArea({
                    inst_id: token.institution.inst_id,
                });

                const options = learningAreaData.data.map((area: any) => ({
                    value: area.learning_area_id.toString(),
                    label: area.learning_area_name,
                }));

                setLearningAreaOptions(options);
            }
        } catch (error) {
            console.error("Failed to fetch learning areas:", error);
        }
    };

    if (token) {
        fetchLearningAreas();
    }
}, [token]);

  const form = useForm<sectionFields>({
    initialValues: {
      subject_id: undefined,
      learning_area_id: undefined,
      hour_per_week: undefined,
    },
  });

  // Sync form values with initialValues when modal opens or initialValues changes
  useEffect(() => {
    if (opened) {
        form.setValues(initialValues);
    }
  }, [opened, initialValues]);

  const handleSubmit = (values: sectionFields) => {
    const filteredValues: sectionFields = {};

    // Helper to check if value exists
    const hasValue = (val: any) => val !== "" && val !== undefined && val !== null;

    if (hasValue(values.subject_id)) filteredValues.subject_id = Number(values.subject_id);
    if (hasValue(values.learning_area_id)) filteredValues.learning_area_id = Number(values.learning_area_id);
    if (hasValue(values.hour_per_week)) filteredValues.hour_per_week = Number(values.hour_per_week);

    onSubmit(filteredValues);
    close();
  };

  const handleClear = () => {
      form.reset();
      setSubjectOptions([]); 
      setSearchValue('');
      onClear();
      close();
  }

  return (
    <Modal
      id="filter-section-modal"
      opened={opened}
      onClose={close}
      centered
      size="md"
      radius={16}
    >
      <h1 className="color-black font-bold text-2xl mb-4 text-center">ตัวกรองกลุ่มเรียน</h1>
      <form onSubmit={form.onSubmit(handleSubmit)} className="gap-2 flex flex-col" id="filter-section-form">
         
         <Select
          id="select-learning-area"
          className="mt-2"
          label="กลุ่มการเรียนรู้"
          placeholder="เลือกกลุ่มการเรียนรู้"
          data={learningAreaOptions}
          {...form.getInputProps("learning_area_id")}
          radius={8}
          clearable
        />

        <Select
            id="select-subject"
            className="mt-2"
            label="วิชา"
            placeholder="พิมพ์ชื่อวิชาหรือรหัสวิชา"
            data={subjectOptions}
            searchable
            nothingFoundMessage={loadingSubject ? "กำลังค้นหา..." : "ไม่พบรายวิชา"}
            onSearchChange={setSearchValue}
            searchValue={searchValue}
            clearable
            {...form.getInputProps("subject_id")}
            filter={({ options }) => options}
            radius={8}
            rightSection={loadingSubject ? <Loader size={16} /> : <IconSelector size={16} />}
        />

        <TextInput
          id="input-hour-per-week"
          className="mt-2"
          label="ชั่วโมง/สัปดาห์"
          placeholder="กรอกจำนวนชั่วโมง"
          type="number"
          {...form.getInputProps("hour_per_week")}
          radius={8}
        />

        <Group justify="right" mt="lg">
            <Button
                id="clear-filter-button"
                variant="default"
                onClick={handleClear}
                radius={8}
            >
                ล้างค่า
            </Button>
            <Button
                id="submit-button"
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
