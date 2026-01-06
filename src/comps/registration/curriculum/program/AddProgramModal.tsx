import {
  Modal,
  Button,
  Group,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { programFields } from '@/utils/interface/program.types';
import { useRouter } from "next/router";

interface AddProgramModalProps {
  opened: boolean;
  close: () => void;
  onSubmit?: (values: programFields) => void;
  token?: any;
}

export default function AddProgramModal({
  opened,
  close,
  onSubmit,
  token,
}: AddProgramModalProps) {
  const router = useRouter();
  const { root_id } = router.query;
  const form = useForm<programFields>({
    initialValues: {
      inst_id: undefined,
      program_name: "",
      program_type: "",
      parent_id: undefined,
      remark: "",
      flag_valid: true,
      tree_type: "",
    },
  });

  const handleSubmit = (values: programFields) => {
    console.log("add program:", values);

    const instType = token?.institution?.inst_type;

    if (!root_id && instType === "school") {
      values.program_type = "study_plan";
      values.tree_type = "root";
    } else if (!root_id && instType === "uni") {
      values.program_type = "faculty";
      values.tree_type = "root";
    }else if (root_id && instType === "school") {
      values.program_type = "class";
      values.tree_type = "leaf";
      values.parent_id = Number(root_id);
    } 
    else {
      values.parent_id = Number(root_id);
    }

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
        เพิ่ม{token?.institution?.inst_type === "school" ? "แผนการเรียน" : "คณะ"}
      </h1>

      <form
        onSubmit={form.onSubmit(handleSubmit)}
        className="flex flex-col gap-2"
      >
        <TextInput
          label={`ชื่อ${token?.institution?.inst_type === "school" ? "แผนการเรียน" : "คณะ"}`}
          placeholder={`เช่น ${token?.institution?.inst_type === "school" ? "แผนการเรียนคณิตศาสตร์" : "คณะวิทยาศาสตร์"}`}
          {...form.getInputProps("program_name")}
          radius={8}
          required
        />

        <TextInput
          label="หมายเหตุ"
          placeholder="เช่น ชั้นเรียนสำหรับนักเรียน"
          {...form.getInputProps("remark")}
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
