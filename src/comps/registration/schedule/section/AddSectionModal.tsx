import { useState } from 'react';
import {
  Modal,
  SegmentedControl,
} from "@mantine/core";
import { sectionFields } from "@/utils/interface/section.types";
import AddSectionModalForm from "./AddSectionModalForm";
import AddSectionModalImport from "./AddSectionModalImport";

interface SectionEditModalProps {
  opened: boolean;
  close: () => void;
  onSubmit?: (values: sectionFields) => void;
  semesterData?: { value: string; label: string }[];
  token?: any;
}

export default function AddSectionModal({
  opened,
  close,
  onSubmit,
  semesterData,
  token
}: SectionEditModalProps) {
  const [tab, setTab] = useState<"manual" | "csv">("manual");

  const handleSubmit = (values: sectionFields) => {
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
      <h1 className="color-black font-bold text-2xl mb-4 text-center">เพิ่มกลุ่มเรียน</h1>

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
        <AddSectionModalForm
          onSubmit={handleSubmit}
          close={close}
          semesterData={semesterData}
          token={token}
          opened={opened}
        />
      )}

      {/* ================= CSV UPLOAD ================= */}
      {tab === "csv" && (
        <AddSectionModalImport />
      )}
    </Modal>
  );
}
