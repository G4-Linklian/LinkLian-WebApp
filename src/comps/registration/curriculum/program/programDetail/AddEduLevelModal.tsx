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
    console.log("add eduLevel:", values);

    onSubmit?.(values);
    form.reset();
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
      <h1 className="text-black font-bold text-2xl mb-4 text-center">
        เพิ่มชั้นเรียน
      </h1>

      <form
        onSubmit={form.onSubmit(handleSubmit)}
        className="flex flex-col gap-2"
      >
        <Select
          label="กลุ่มการเรียนรู้"
          placeholder="เลือกกลุ่มการเรียนรู้"
          data={eduLevelData}
          {...form.getInputProps("edu_lev_id")}
          required
          radius={8}
        />

        <Select
          label="กลุ่มการเรียนรู้"
          placeholder="เลือกกลุ่มการเรียนรู้"
          data={ProgramData.map((program: any) => ({
            value: program.program_id.toString(),
            label: program.program_name + " - " + program.remark,
          }))}
          {...form.getInputProps("program_id")}
          required
          radius={8}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={close} radius={8}>
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
