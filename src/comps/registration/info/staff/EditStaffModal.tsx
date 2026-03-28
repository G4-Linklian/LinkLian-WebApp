import {
  Modal,
  Button,
  Group,
  TextInput,
  Select,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { UserSysFields } from "@/utils/interface/user.types";
import { useEffect, useState } from "react";
import { teacherStatusOptions } from "@/enums/userStatus";
import { deleteUserSys } from '@/utils/api/userData';
import { getSectionEducator } from '@/utils/api/section';
import { sectionFields } from "@/utils/interface/section.types";
import { ConfirmModalEx } from '@/comps/public/ConfirmModal';
import { useNotification } from '@/comps/noti/notiComp';

interface EditStaffModalProps {
  staff: UserSysFields | null;
  opened: boolean;                 
  close: () => void;
  onSubmit?: (values: UserSysFields) => void;
  onDelete?: (user_sys_id: number) => void;
  learningAreaOptions?: { value: string; label: string }[];
}

export default function EditStaffModal({
  staff,
  opened,
  close,
  onSubmit,
  onDelete,
  learningAreaOptions = [],
}: EditStaffModalProps) {
  if (!staff) return null;

  const { showNotification } = useNotification();
  const [confirmDeleteOpened, setConfirmDeleteOpened] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState<string>("");
  const [sectionCount, setSectionCount] = useState<number>(0);
  const [relatedSections, setRelatedSections] = useState<sectionFields[]>([]);

  const form = useForm<UserSysFields>({
    initialValues: {
      email: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      phone: "",
      code: "",
      user_status: "",
      learning_area_id: undefined,
      user_sys_id: undefined,
    },

    validate: {
      phone: (value) => {
        if (!value) return null;
        if (!/^\d{10}$/.test(value)) {
          return "เบอร์โทรต้องเป็นตัวเลข 10 หลักเท่านั้น";
        }
        return null;
      },
    },
  });

  useEffect(() => {
    if (!staff) return;

    form.setValues({
      email: staff.email ?? "",
      first_name: staff.first_name ?? "",
      middle_name: staff.middle_name ?? "",
      last_name: staff.last_name ?? "",
      phone: staff.phone ?? "",
      code: staff.code ?? "",
      user_status: staff.user_status ?? "",
      learning_area_id: staff.learning_area_id,
      user_sys_id: staff.user_sys_id,
    });
  }, [staff]);

  const handleSubmit = (values: UserSysFields) => {
    const payload = {
      ...values,
      learning_area_id: values.learning_area_id ? Number(values.learning_area_id) : undefined,
    };
    onSubmit?.(payload);
    close();
  };



  const handleDelete = async () => {
    if (!staff?.user_sys_id) return;

    try {
      const educatorResult = await getSectionEducator({
        user_sys_id: Number(staff.user_sys_id),
        position: "main_teacher",
      });

      const sections = educatorResult.success && educatorResult.data ? educatorResult.data : [];
      const mtSections = sections.filter((section: sectionFields) => section.position === "main_teacher");
      const mtCount = mtSections.length;

      setSectionCount(mtCount);
      setRelatedSections(mtSections);

      if (mtCount > 0) {
        setDeleteWarning(`บุคลากรนี้เป็นผู้สอนหลัก ${mtCount} กลุ่มเรียน กรุณาเปลี่ยนผู้สอนหลักก่อนลบ`);
      } else {
        setDeleteWarning("");
      }

      setConfirmDeleteOpened(true);
    } catch (error) {
      console.error("Error checking related data:", error);
      showNotification(
        'เกิดข้อผิดพลาด',
        'ไม่สามารถตรวจสอบข้อมูลได้',
        'error',
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!staff?.user_sys_id) return;

    if (sectionCount > 0) {
      return;
    }

    try {
      const result = await deleteUserSys(staff.user_sys_id);

      if (result.success) {
        showNotification(
          'ลบบุคลากรสำเร็จ',
          '',
          'success',
        );
        onDelete?.(staff.user_sys_id);
        setConfirmDeleteOpened(false);
        close();
      } else {
        showNotification(
          'ลบบุคลากรไม่สำเร็จ',
          result.message || 'เกิดข้อผิดพลาดในการลบข้อมูล',
          'error',
        );
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
      showNotification(
        'ลบบุคลากรไม่สำเร็จ',
        'เกิดข้อผิดพลาดในการเชื่อมต่อ',
        'error',
      );
    }
  };

  return (
    <>
      <Modal
        id="edit-staff-modal"
        opened={opened}
        onClose={close}
        centered
        size="md"
        radius={16}
      >
        <h1 className="color-black font-bold text-2xl mb-4 text-center">จัดการบุคลากร</h1>
        <form onSubmit={form.onSubmit(handleSubmit)} className="gap-2 flex flex-col" id="edit-staff-form">
          <TextInput
            id="input-email"
            label="อีเมล"
            placeholder="กรอกอีเมล"
            {...form.getInputProps("email")}
            radius={8}
            required
          />
          <TextInput
            id="input-first-name"
            label="ชื่อ"
            placeholder="กรอกชื่อ"
            {...form.getInputProps("first_name")}
            radius={8}
            required
          />
          <TextInput
            id="input-last-name"
            label="นามสกุล"
            placeholder="กรอกนามสกุล"
            {...form.getInputProps("last_name")}
            radius={8}
            required
          />
          <div className="flex gap-2 justify-between mt-2">
            <TextInput
              id="input-phone"
              className="w-[50%]"
              label="เบอร์โทร"
              placeholder="กรอกเบอร์โทร"
              {...form.getInputProps("phone")}
              radius={8}
              pattern="[0-9]*"
            />
            <TextInput
              id="input-code"
              className="w-[50%]"
              label="รหัสบุคลากร"
              placeholder="กรอกรหัสบุคลากร"
              {...form.getInputProps("code")}
              radius={8}
              required
            />
          </div>
          <div className="flex gap-2 justify-between mt-3">
            <Select
              id="select-user-status"
              className="w-[40%]"
              label="สถานะผู้ใช้"
              placeholder="เลือกสถานะ"
              data={teacherStatusOptions}
              {...form.getInputProps("user_status")}
              radius={8}
              required
            />

            <Select
              id="select-learning-area"
              className="w-[60%]"
              label="กลุ่มการเรียนรู้"
              placeholder="เช่น คณิตศาสตร์"
              data={learningAreaOptions}
              {...form.getInputProps("learning_area_id")}
              radius={8}
              required
            />
          </div>

          <Group justify="flex-end" className="mt-8" id="delete-button">
            <Button
              id="delete-button"
              color="red"
              variant="outline"
              radius={8}
              onClick={handleDelete}
              type="button"
            >
              ลบ
            </Button>

            <Button type="submit" radius={8} id="save-button">
              บันทึก
            </Button>
          </Group>
        </form>
      </Modal>

      <ConfirmModalEx
        opened={confirmDeleteOpened}
        onClose={() => setConfirmDeleteOpened(false)}
        title="ยืนยันการลบบุคลากร"
        size="lg"
        description={
          <>
            <div className="text-center mb-4">
              คุณต้องการลบบุคลากร <strong>{staff?.first_name} {staff?.last_name}</strong> ใช่หรือไม่?
            </div>

            {sectionCount > 0 && (
              <div className="mt-4 text-left">
                <Text size="sm" fw={600} mb="xs" c="red">
                  พบว่าเป็นผู้สอนหลักในกลุ่มเรียน:
                </Text>
                <div className="max-h-48 overflow-y-auto rounded-lg p-2 px-4 bg-gray-50">
                  {relatedSections.slice(0, 5).map((section, index) => (
                    <div
                      key={`${section.section_id || "section"}-${index}`}
                      className="text-sm py-1"
                    >
                      • {section.name_th} - กลุ่มเรียน {section.section_name}
                    </div>
                  ))}
                  {relatedSections.length > 5 && (
                    <div className="text-xs text-gray-500 mt-1">
                      ... และอีก {relatedSections.length - 5} กลุ่มเรียน
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        }
        warningText={deleteWarning}
        handleConfirm={handleConfirmDelete}
        color="red"
        disableConfirm={sectionCount > 0}
      />
    </>
  );
}
