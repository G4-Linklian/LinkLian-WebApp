import {
  Modal,
  Button,
  Group,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { learningAreaFields } from '@/utils/interface/learningArea.types';

interface AddLearningAreaModalProps {
  opened: boolean;
  close: () => void;
  onSubmit?: (values: learningAreaFields) => void;
}

export default function AddLearningAreaModal({
  opened,
  close,
  onSubmit,
}: AddLearningAreaModalProps) {
  const form = useForm<learningAreaFields>({
    initialValues: {
      learning_area_id: undefined,
      inst_id: undefined,
      learning_area_name: "",
      remark: "",
      flag_valid: true,
    },
  });
  const handleSubmit = (values: learningAreaFields) => {
    onSubmit?.(values);
    form.reset();
    close();
  };

  return (
    <Modal
      id="add-learning-area-modal"
      opened={opened}
      onClose={close}
      centered
      size="md"
      radius={16}
    >
      <h1 className="text-black font-bold text-2xl mb-4 text-center">
        เพิ่มกลุ่มการเรียนรู้
      </h1>

      <form
        id="learning-area-form"
        onSubmit={form.onSubmit(handleSubmit)}
        className="flex flex-col gap-2"
      >
        <TextInput
          id="input-learning-area-name"
          label="ชื่อกลุ่มการเรียนรู้"
          placeholder="เช่น คณิตศาสตร์"
          {...form.getInputProps("learning_area_name")}
          required
          radius={8}
        />

        <TextInput
          id="input-learning-area-remark"
          label="หมายเหตุ"
          placeholder="เช่น ชั้นเรียนสำหรับนักเรียน"
          {...form.getInputProps("remark")}
          radius={8}
        />

        <Group justify="flex-end" mt="md">
          <Button id="cancel-button" variant="outline" onClick={close} radius={8}>
            ยกเลิก
          </Button>

          <Button id="submit-button" type="submit" radius={8}>
            เพิ่มกลุ่มการเรียนรู้
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
