import {
  Modal,
  Button,
  Group,
  TextInput,
  Checkbox,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { learningAreaFields } from '@/utils/interface/learningArea.types';
import { useEffect } from 'react';

interface LearningAreaEditModalProps {
  learningArea: learningAreaFields | null;
  opened: boolean;
  close: () => void;
  onSubmit?: (values: learningAreaFields) => void;
}

export default function LearningAreaEditModal({
  learningArea,
  opened,
  close,
  onSubmit,
}: LearningAreaEditModalProps) {
  if (!learningArea) return null;

  const form = useForm<learningAreaFields>({
    initialValues: {
      learning_area_id: undefined,
      inst_id: undefined,
      learning_area_name: "",
      remark: "",
      flag_valid: true,
    },
  });

  useEffect(() => {
    if (!learningArea) return;

    form.setValues({
      learning_area_id: learningArea.learning_area_id,
      inst_id: learningArea.inst_id,
      learning_area_name: learningArea.learning_area_name ?? "",
      remark: learningArea.remark ?? "",
      flag_valid: learningArea.flag_valid ?? true,
    });
  }, [learningArea]);

  const handleSubmit = (values: learningAreaFields) => {
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
      <h1 className="color-black font-bold text-2xl mb-4 text-center">จัดการกลุ่มการเรียนรู้</h1>
      <form onSubmit={form.onSubmit(handleSubmit)} className="gap-2 flex flex-col">
        <TextInput
          label="ชื่อกลุ่มการเรียนรู้"
          placeholder="เช่น คณิตศาสตร์"
          {...form.getInputProps("learning_area_name")}
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
