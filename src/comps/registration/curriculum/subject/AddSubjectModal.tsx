import { useState } from "react";
import {
  Modal,
  SegmentedControl,
} from "@mantine/core";
import { subjectFields } from '@/utils/interface/subject.types';
import AddSubjectModalForm from "./AddSubjectModalForm";
import AddSubjectModalImport from "./AddSubjectModalImport";

interface AddSubjectModalProps {
  opened: boolean;
  close: () => void;
  onSubmit?: (values: subjectFields) => void;
  learningAreaOptions: { value: string; label: string }[];
}

export default function AddSubjectModal({
  opened,
  close,
  onSubmit,
  learningAreaOptions
}: AddSubjectModalProps) {
  const [tab, setTab] = useState<"manual" | "csv">("manual");

  const handleSubmit = (values: subjectFields) => {
    onSubmit?.(values);
    close();
  };

  return (
    <Modal
      opened={opened}
      onClose={close}
      centered
      size={tab === "manual" ? "md" : "1200px"}
      radius={16}
    >
      <h1 className="text-black font-bold text-2xl mb-4 text-center">
        เพิ่มวิชา
      </h1>

      <SegmentedControl
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
        <AddSubjectModalForm
          onSubmit={handleSubmit}
          close={close}
          learningAreaOptions={learningAreaOptions}
        />
      )}

      {/* ================= CSV UPLOAD ================= */}
      {tab === "csv" && (
        <AddSubjectModalImport />
      )}
    </Modal>
  );
}
