import {
  Modal,
  Button,
  Group,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { programFields } from '@/utils/interface/program.types';
import { useEffect } from 'react';

interface ProgramEditModalProps {
  program: programFields | null;
  opened: boolean;
  close: () => void;
  onSubmit?: (values: programFields) => void;
}

export default function ProgramEditModal({
  program,
  opened,
  close,
  onSubmit,
}: ProgramEditModalProps) {
  if (!program) return null;

  const form = useForm<programFields>({
    initialValues: {
      program_id: undefined,
      inst_id: undefined,
      program_name: "",
      program_type: "",
      parent_id: undefined,
      remark: "",
      flag_valid: true,
    },
  });

  useEffect(() => {
    if (program) {
      form.setValues({
        program_id: program.program_id,
        inst_id: program.inst_id,
        program_name: program.program_name ?? "",
        program_type: program.program_type ?? "",
        parent_id: program.parent_id ?? undefined,
        remark: program.remark ?? "",
        flag_valid: program.flag_valid ?? true,
      });
    }
  }, [program]);

  const handleSubmit = (values: programFields) => {
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
      <h1 className="color-black font-bold text-2xl mb-4 text-center">จัดการโปรแกรม</h1>
      <form onSubmit={form.onSubmit(handleSubmit)} className="gap-2 flex flex-col">
        <TextInput
          label="ชื่อโปรแกรม"
          placeholder="เช่น โปรแกรมคณิตศาสตร์"
          {...form.getInputProps("program_name")}
          required
          mb="sm"
          radius={8}
        />

        <TextInput
          label="หมายเหตุ"
          placeholder="เช่น ชั้นเรียนสำหรับนักเรียน"
          {...form.getInputProps("remark")}
          mb="sm"
          radius={8}
        />


        <Group justify="flex-end" className="mt-4">
          <Button color="blue" variant="outline" radius={8} onClick={close}>
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
