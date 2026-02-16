import { useState } from "react";
import {
  Modal,
  Button,
  Group,
  TextInput,
  Select,
  SegmentedControl,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { UserSysFields } from "@/utils/interface/user.types";
import { teacherStatusOptions } from "@/enums/userStatus";
import AddStaffModalForm from "./AddStaffModalForm";
import AddStaffModalImport from "./AddStaffModalImport";

interface AddStaffModalProps {
  opened: boolean;
  close: () => void;
  onSubmit?: (values: UserSysFields) => void;
  learningAreaOptions?: { value: string; label: string }[];
}

export default function AddStaffModal({
  opened,
  close,
  onSubmit,
  learningAreaOptions = [],
}: AddStaffModalProps) {
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
      size={tab === "manual" ? "sm" : "xl"}
      radius={16}
    >
      <h1 className="color-black font-bold text-2xl mb-4 text-center">เพิ่มบุคลากร</h1>

      <SegmentedControl
        value={tab}
        onChange={(value) => setTab(value as "manual" | "csv")}
        data={[
          { label: "เพิ่มแบบกรอกข้อมูล", value: "manual" },
          { label: "นำเข้า CSV", value: "csv" },
        ]}
        fullWidth
        radius="md"
        mb="md"
      />

      {/* ================= MANUAL ================= */}
      {tab === "manual" && (
        <AddStaffModalForm
          onSubmit={handleSubmit}
          close={close}
          learningAreaOptions={learningAreaOptions}
        />
      )}


      {/* ================= CSV UPLOAD ================= */}
      {tab === "csv" && (
        <AddStaffModalImport />
      )}
    </Modal>
  );
}
