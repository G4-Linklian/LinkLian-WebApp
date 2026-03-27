import {
  Modal,
  Button,
  Group,
  TextInput,
  Select,
  Loader,
} from "@mantine/core";
import { IconSelector } from '@tabler/icons-react';
import { useForm } from "@mantine/form";
import { UserSysFields } from "@/utils/interface/user.types";
import { useEffect, useState } from "react";
import { useDebouncedValue } from '@mantine/hooks';
import { getProgram } from "@/utils/api/program";
import { studentStatusOptions } from "@/enums/userStatus";
import { deleteUserSys } from '@/utils/api/userData';
import { ConfirmModalEx } from '@/comps/public/ConfirmModal';
import { useNotification } from '@/comps/noti/notiComp';

interface EditStudentModalProps {
  student: UserSysFields | null;
  opened: boolean;
  close: () => void;
  onSubmit?: (values: UserSysFields) => void;
  onDelete?: (user_sys_id: number) => void;
  eduLevelOptions: { value: string; label: string }[];
  token?: any;
}

type ProgramOption = {
  value: string;
  label: string;
};

export default function EditStudentModal({
  student,
  opened,
  close,
  onSubmit,
  onDelete,
  eduLevelOptions,
  token
}: EditStudentModalProps) {
  if (!student) return null;

  const { showNotification } = useNotification();
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchValue, 300);
  const [programOptions, setProgramOptions] = useState<{ value: string; label: string }[]>([]);
  const [loadingProgram, setLoadingProgram] = useState(false);
  const [confirmDeleteOpened, setConfirmDeleteOpened] = useState(false);

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

  useEffect(() => {
    if (!student) return;

    form.setValues({
      email: student.email ?? "",
      first_name: student.first_name ?? "",
      middle_name: student.middle_name ?? "",
      last_name: student.last_name ?? "",
      phone: student.phone ?? "",
      code: student.code ?? "",
      user_status: student.user_status ?? "",
      edu_lev_id: student.edu_lev_id,
      program_id: student.program_id,
      user_sys_id: student.user_sys_id,
    });

    if (student.program_id) {
      setProgramOptions([
        {
          value: String(student.program_id),
          label: `${student.program_name} - ${student.remark}` || ""
        }
      ]);
    }

  }, [student]);


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
    } else if (debouncedSearch.length === 0) {
      const programOption = {
        value: String(student.program_id),
        label: `${student.program_name} - ${student.remark}`,
      };

      setProgramOptions([programOption]);
    }
  }, [debouncedSearch]);

  const handleSubmit = (values: UserSysFields) => {
    const payload = {
      ...values,
      program_id: values.program_id ? Number(values.program_id) : undefined,
      edu_lev_id: values.edu_lev_id ? Number(values.edu_lev_id) : undefined,
    };
    onSubmit?.(payload);
    close();
  };

  const handleDelete = () => {
    setConfirmDeleteOpened(true);
  };

  const handleConfirmDelete = async () => {
    if (!student?.user_sys_id) return;

    try {
      const result = await deleteUserSys(student.user_sys_id);

      if (result.success) {
        showNotification(
          'ลบนักเรียนสำเร็จ',
          '',
          'success',
        );
        onDelete?.(student.user_sys_id);
        setConfirmDeleteOpened(false);
        close();
      } else {
        showNotification(
          'ลบนักเรียนไม่สำเร็จ',
          result.message || 'เกิดข้อผิดพลาดในการลบข้อมูล',
          'error',
        );
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      showNotification(
        'ลบนักเรียนไม่สำเร็จ',
        'เกิดข้อผิดพลาดในการเชื่อมต่อ',
        'error',
      );
    }
  };

  return (
    <>
      <Modal
        id="edit-student-modal"
        opened={opened}
        onClose={close}
        centered
        size="md"
        radius={16}
      >
        <h1 className="color-black font-bold text-2xl mb-4 text-center">จัดการนักเรียน</h1>
        <form onSubmit={form.onSubmit(handleSubmit)} className="gap-2 flex flex-col" id="edit-student-form">
          <TextInput
            id="input-student-code"
            label="รหัสนักเรียน"
            placeholder="กรอกรหัสนักเรียน"
            {...form.getInputProps("code")}
            radius={8}
            required
          />
          <TextInput
            id="input-student-first-name"
            label="ชื่อ"
            placeholder="กรอกชื่อ"
            {...form.getInputProps("first_name")}
            radius={8}
            required
          />
          {/* <TextInput
            label="ชื่อกลาง"
            placeholder="กรอกชื่อกลาง"
            {...form.getInputProps("middle_name")}
            radius={8}
          /> */}
          <TextInput
            id="input-student-last-name"
            label="นามสกุล"
            placeholder="กรอกนามสกุล"
            {...form.getInputProps("last_name")}
            radius={8}
            required
          />
          <TextInput
            id="input-student-email"
            label="อีเมล"
            placeholder="กรอกอีเมล"
            {...form.getInputProps("email")}
            radius={8}
            required
          />
          <TextInput
            id="input-student-phone"
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
              id="select-classroom"
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
            id="select-student-status"
            className="w-full mt-3"
            label="สถานะผู้ใช้"
            placeholder="เลือกสถานะ"
            data={studentStatusOptions}
            {...form.getInputProps("user_status")}
            radius={8}
            required
          />

          <Group justify="flex-end" className="mt-8">
            <Button
              id="delete-button"
              color="red"
              variant="outline"
              radius={8}
              onClick={handleDelete}
              type="button"
            >
              ลบ
            </Button>

            <Button type="submit" radius={8} id="save-button">
              บันทึก
            </Button>
          </Group>
        </form>
      </Modal>

      <ConfirmModalEx
        opened={confirmDeleteOpened}
        onClose={() => setConfirmDeleteOpened(false)}
        title="ยืนยันการลบนักเรียน"
        size="lg"
        description={
          <div className="text-center mb-4">
            คุณต้องการลบนักเรียน <strong>{student?.first_name} {student?.last_name}</strong> ใช่หรือไม่?
          </div>
        }
        handleConfirm={handleConfirmDelete}
        color="red"
      />
    </>
  );
}
