import {
  Modal,
  Button,
  Group,
  TextInput,
  Select
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { eduLevelFields } from '@/utils/interface/eduLevel.types';
import { useRouter } from "next/router";

interface AddEduLevelModalProps {
  opened: boolean;
  close: () => void;
  onSubmit?: (values: eduLevelFields) => void;
  token?: any;
  eduLevelData?: any;
  ProgramData?: any;
}

export default function AddEduLevelModal({
  opened,
  close,
  onSubmit,
  token,
  eduLevelData,
  ProgramData
}: AddEduLevelModalProps) {
  const router = useRouter();
  const { root_id } = router.query;

  const form = useForm<eduLevelFields>({
    initialValues: {
      edu_lev_id: undefined,
      program_id: undefined,
    },
  });

  const handleSubmit = (values: eduLevelFields) => {
    onSubmit?.(values);
    form.reset();
    close();
  };

  return (
    <Modal
      id="add-edu-level-modal"
      opened={opened}
      onClose={close}
      centered
      size="md"
      radius={16}
    >
      <h1 className="text-black font-bold text-2xl mb-4 text-center">
        เพิ่มชั้นเรียน
      </h1>

      <form
        id="add-edu-level-form"
        onSubmit={form.onSubmit(handleSubmit)}
        className="flex flex-col gap-2"
      >
        <Select
          id="select-edu-level"
          label="ระดับการศึกษา"
          placeholder="เลือกระดับการศึกษา"
          data={eduLevelData}
          {...form.getInputProps("edu_lev_id")}
          required
          radius={8}
        />

        <Select
          id="select-program-for-edu-level"
          label="เลือกห้องเรียน"
          placeholder="เลือกห้องเรียน"
          data={ProgramData.map((program: any) => ({
            value: program.program_id.toString(),
            label: program.program_name + " - " + program.remark,
          }))}
          {...form.getInputProps("program_id")}
          required
          radius={8}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={close} radius={8} id="cancel-add-edu-level-button">
            ยกเลิก
          </Button>

          <Button type="submit" radius={8} id="submit-add-edu-level-button">
            เพิ่มชั้นเรียน
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
