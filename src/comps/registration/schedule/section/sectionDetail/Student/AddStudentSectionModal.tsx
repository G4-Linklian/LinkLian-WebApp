import {
  Modal,
  SegmentedControl,
} from "@mantine/core";
import { UserSysFieldsForm } from "@/utils/interface/user.types";
import { useState } from "react";
import AddStudentSectionModalForm from "./AddStudentSectionModalForm";
import AddStudentSectionModalImport from "./AddStudentSectionModalImport";

interface AddStudentSectionModalProps {
  opened: boolean;
  close: () => void;
  onSubmit?: (values: UserSysFieldsForm) => void;
  token?: any;
  roleID?: number;
}

export default function AddStudentSectionModal({
  opened,
  close,
  onSubmit,
  token,
  roleID
}: AddStudentSectionModalProps) {
  const [tab, setTab] = useState<"manual" | "csv">("manual");

  const handleFormSubmit = (values: UserSysFieldsForm) => {
    onSubmit?.(values);
    close();
  };

  const handleImportSubmit = () => {
    // Refresh data after import
  };

  return (
    <Modal
      id="add-student-modal"
      opened={opened}
      onClose={close}
      centered
      size={tab === "manual" ? "md" : "1200px"}
      radius={16}
    >
      <h1 className="color-black font-bold text-2xl mb-4 text-center">เพิ่มนักเรียน</h1>

      <SegmentedControl
        id="add-student-tab"
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
        <AddStudentSectionModalForm
          onSubmit={handleFormSubmit}
          close={close}
          token={token}
          roleID={roleID}
        />
      )}

      {/* ================= CSV UPLOAD ================= */}
      {tab === "csv" && (
        <AddStudentSectionModalImport
          close={close}
          onSubmit={handleImportSubmit}
          token={token}
        />
      )}
    </Modal>
  );
}