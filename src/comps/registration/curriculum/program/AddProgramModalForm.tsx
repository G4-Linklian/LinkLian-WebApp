import {
  Button,
  Group,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { programFields } from '@/utils/interface/program.types';
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface AddProgramModalFormProps {
  onSubmit: (values: programFields) => void;
  close: () => void;
  token?: any;
}

export default function AddProgramModalForm({
  onSubmit,
  close,
  token,
}: AddProgramModalFormProps) {
  const router = useRouter();
  const { root_id, twig_id } = router.query;

  const [unitText, setUnitText] = useState("");
  const instType = token?.institution?.inst_type;

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
    const instType = token?.institution?.inst_type;
    const payload = { ...values };

    if (!root_id && instType === "school") {
      payload.program_type = "study_plan";
      payload.tree_type = "root";
    } else if (!root_id && instType === "uni") {
      payload.program_type = "faculty";
      payload.tree_type = "root";
    } else if (root_id && instType === "school") {
      payload.program_type = "class";
      payload.tree_type = "leaf";
      payload.parent_id = Number(root_id);
    } else if (twig_id && instType === "uni") {
      payload.program_type = "major";
      payload.tree_type = "leaf";
      payload.parent_id = Number(twig_id);
    } else if (root_id && instType === "uni") {
      payload.program_type = "department";
      payload.tree_type = "twig";
      payload.parent_id = Number(root_id);
    } else if (root_id) {
      payload.parent_id = Number(root_id);
    }

    onSubmit(payload);
    form.reset();
    close();
  };

  useEffect(() => {
    if (!instType) return;

    if (!root_id && instType === "school") {
      setUnitText("แผนการเรียน");
    } else if (!root_id && instType === "uni") {
      setUnitText("คณะ");
    } else if (root_id && instType === "school") {
      setUnitText("ห้องเรียน");
    } else if (twig_id && instType === "uni") {
      setUnitText("สาขา");
    } else if (root_id && instType === "uni") {
      setUnitText("ภาควิชา");
    }
  }, [instType, root_id, twig_id]);

  return (
    <form
      id="add-program-form"
      onSubmit={form.onSubmit(handleSubmit)}
      className="flex flex-col gap-2"
    >
      <TextInput
        id="input-program-name"
        label={`ชื่อ${unitText}`}
        {...form.getInputProps("program_name")}
        radius={8}
        required
      />

      <TextInput
        id="input-program-remark"
        label={`หมายเหตุ${unitText}`}
        {...form.getInputProps("remark")}
        radius={8}
      />

      <Group justify="flex-end" mt="md">
        <Button variant="outline" onClick={close} radius={8} id="cancel-button">
          ยกเลิก
        </Button>

        <Button type="submit" radius={8} id="submit-button">
          เพิ่ม{`${unitText}`}
        </Button>
      </Group>
    </form>
  );
}
