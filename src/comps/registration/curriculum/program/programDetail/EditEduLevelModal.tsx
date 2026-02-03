import {
  Modal,
  Button,
  Group,
  TextInput,
  Checkbox,
  Select,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { eduLevelFields } from '@/utils/interface/eduLevel.types';
import { useEffect } from 'react';

interface EduLevelEditModalProps {
  eduLevel: eduLevelFields | null;
  opened: boolean;
  close: () => void;
  onSubmit?: (values: eduLevelFields) => void;
  eduLevelData?: any;
  ProgramData?: any;
}

export default function EduLevelEditModal({
  eduLevel,
  opened,
  close,
  onSubmit,
  eduLevelData,
  ProgramData,
}: EduLevelEditModalProps) {
  if (!eduLevel) return null;

  const form = useForm<eduLevelFields>({
    initialValues: {
      edu_lev_id: undefined,
      program_id: undefined,
    },
  });

  useEffect(() => {
    if (eduLevel) {
      form.setValues({
        program_id: eduLevel.program_id,
        edu_lev_id: eduLevel.edu_lev_id,
      });
    }
  }, [eduLevel]);

  const handleSubmit = (values: eduLevelFields) => {
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
      <h1 className="color-black font-bold text-2xl mb-4 text-center">จัดการชั้นเรียน</h1>
      <form onSubmit={form.onSubmit(handleSubmit)} className="gap-2 flex flex-col">


        <Select
          label="ระดับการศึกษา"
          placeholder="เลือกระดับการศึกษา"
          data={eduLevelData}
          {...form.getInputProps("edu_lev_id")}
          required
          disabled
          radius={8}
        />

        <Select
          label="เลือกห้องเรียน"
          placeholder="เลือกห้องเรียน"
          data={ProgramData.map((program: any) => ({
            value: program.program_id.toString(),
            label: program.program_name + " - " + program.remark,
          }))}
          {...form.getInputProps("program_id")}
          required
          disabled
          radius={8}
        />

        <Group justify="flex-end" className="mt-4">
          <Button color="red" variant="outline" radius={8}>
            ลบ
          </Button>

          <Button type="submit" radius={8}>
            บันทึก
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
