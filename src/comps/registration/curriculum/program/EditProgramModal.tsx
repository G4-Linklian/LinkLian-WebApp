import {
  Modal,
  Button,
  Group,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { programFields } from '@/utils/interface/program.types';
import { useEffect, useState } from 'react';
import { decodeRegistrationToken } from "@/utils/authToken";
import { useRouter } from "next/router";

interface ProgramEditModalProps {
  program: programFields | null;
  opened: boolean;
  close: () => void;
  onSubmit?: (values: programFields) => void;
}

export default function EditProgramModal({
  program,
  opened,
  close,
  onSubmit,
}: ProgramEditModalProps) {
  const token = decodeRegistrationToken();
  const router = useRouter();

  if (!program) return null;
  const [unitText, setUnitText] = useState("");
  const instType = token?.institution?.inst_type;
  const { root_id, twig_id } = router.query;

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

  useEffect(() => {


    if (!instType) return;

    if (!root_id && instType === "school") {
      setUnitText("แผนการเรียน");
    } else if (!root_id && instType === "uni") {
      setUnitText("คณะ");
    } else if (root_id && instType === "school") {
      setUnitText("ห้องเรียน");
    } else if (root_id && instType === "uni") {
      setUnitText("ภาควิชา");
    } else if (twig_id && instType === "uni") {
      setUnitText("สาขา");
    }
  }, [instType, root_id, twig_id]);

  const handleSubmit = (values: programFields) => {
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

      <h1 className="color-black font-bold text-2xl mb-4 text-center">
        จัดการ{`${unitText}`}
      </h1>

      <form onSubmit={form.onSubmit(handleSubmit)} className="gap-2 flex flex-col">
        <TextInput
          label={`ชื่อ${unitText}`}
          //placeholder={`เช่น คณิตศาสตร์`}
          {...form.getInputProps("program_name")}
          required
          mb="sm"
          radius={8}
        />

        <TextInput
          label={`หมายเหตุ${unitText}`}
          //placeholder={`เช่น ${unitText === "ห้องเรียน" ? "ห้องเรียนสำหรับนักเรียน" : "สาขาวิทยาการคอมพิวเตอร์"}`}
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
