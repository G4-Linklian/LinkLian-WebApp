import { useState } from "react";
import {
  Modal,
  SegmentedControl,
} from "@mantine/core";
import { UserSysFields } from "@/utils/interface/user.types";
import AddStudentModalForm from "./AddStudentModalForm";
import AddStudentModalImport from "./AddStudentModalImport";

interface AddStudentModalProps {
  opened: boolean;
  close: () => void;
  onSubmit?: (values: UserSysFields) => void;
  eduLevelOptions: { value: string; label: string }[];
  token?: any;
}

export default function AddStudentModal({
  opened,
  close,
  onSubmit,
  eduLevelOptions,
  token
}: AddStudentModalProps) {
  const [tab, setTab] = useState<"manual" | "csv">("manual");

  const handleSubmit = (values: UserSysFields) => {
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
      <h1 className="color-black font-bold text-2xl mb-4 text-center">เพิ่มนักเรียน</h1>

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
        <AddStudentModalForm
          onSubmit={handleSubmit}
          close={close}
          eduLevelOptions={eduLevelOptions}
          token={token}
        />
      )}

      {/* ================= CSV UPLOAD ================= */}
      {tab === "csv" && (
        <AddStudentModalImport />
      )}
    </Modal>
  );
}
