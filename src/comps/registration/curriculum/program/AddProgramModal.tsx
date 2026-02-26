import {
  Modal,
  SegmentedControl,
} from "@mantine/core";
import { programFields } from '@/utils/interface/program.types';
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AddProgramModalForm from "./AddProgramModalForm";
import AddProgramModalImport from "./AddProgramModalImport";

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
  const { root_id, twig_id } = router.query;

  const [tab, setTab] = useState<"manual" | "csv">("manual");
  const [unitText, setUnitText] = useState("");
  const instType = token?.institution?.inst_type;

  const handleSubmit = (values: programFields) => {
    onSubmit?.(values);
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
    <Modal
      id="add-program-modal"
      opened={opened}
      onClose={close}
      centered
      size={tab === "manual" ? "md" : "1200px"}
      radius={16}
    >
      <h1 className="text-black font-bold text-2xl mb-4 text-center">
        เพิ่ม{`${unitText}`}
      </h1>

      <SegmentedControl
        id="add-program-tab-control"
        value={tab}
        onChange={(value) => setTab(value as "manual" | "csv")}
        data={[
          { label: "กรอกข้อมูล", value: "manual" },
          { label: "นำเข้าไฟล์", value: "csv" },
        ]}
        fullWidth
        radius="md"
        mb="md"
      />

      {/* ================= MANUAL ================= */}
      {tab === "manual" && (
        <AddProgramModalForm
          onSubmit={handleSubmit}
          close={close}
          token={token}
        />
      )}

      {/* ================= CSV UPLOAD ================= */}
      {tab === "csv" && (
        <AddProgramModalImport />
      )}
    </Modal>
  );
}
