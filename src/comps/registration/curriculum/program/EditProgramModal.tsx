import {
  Modal,
  Button,
  Group,
  TextInput,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { programFields } from '@/utils/interface/program.types';
import { useEffect, useState } from 'react';
import { decodeRegistrationToken } from "@/utils/authToken";
import { useRouter } from "next/router";
import { getProgram, deleteProgram } from '@/utils/api/program';
import { getUserSys } from '@/utils/api/userData';
import { ConfirmModalEx } from '@/comps/public/ConfirmModal';
import { useNotification } from '@/comps/noti/notiComp';

interface ProgramEditModalProps {
  program: programFields | null;
  opened: boolean;
  close: () => void;
  onSubmit?: (values: programFields) => void;
  onDelete?: (program_id: number) => void;
}

export default function EditProgramModal({
  program,
  opened,
  close,
  onSubmit,
  onDelete,
}: ProgramEditModalProps) {
  const token = decodeRegistrationToken();
  const router = useRouter();

  if (!program) return null;
  const [unitText, setUnitText] = useState("");
  const instType = token?.institution?.inst_type;
  const { root_id, twig_id } = router.query;
  
  const { showNotification } = useNotification();
  const [confirmDeleteOpened, setConfirmDeleteOpened] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState<string>("");
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [userCount, setUserCount] = useState<number>(0);
  const [relatedPrograms, setRelatedPrograms] = useState<programFields[]>([]);
  const [relatedUsers, setRelatedUsers] = useState<any[]>([]);
  const [roleId, setRoleId] = useState<number | null>(null);

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
      setRoleId(2);
    } else if (!root_id && instType === "uni") {
      setUnitText("คณะ");
      setRoleId(3);
    } else if (root_id && instType === "school") {
      setUnitText("ห้องเรียน");
      setRoleId(2);
    } else if (root_id && instType === "uni") {
      setUnitText("ภาควิชา");
      setRoleId(3);
    } else if (twig_id && instType === "uni") {
      setUnitText("สาขา");
      setRoleId(3);
    }
  }, [instType, root_id, twig_id]);

  const handleSubmit = (values: programFields) => {
    const payload = { ...values };
    if (payload.parent_id !== undefined && payload.parent_id !== null) {
      payload.parent_id = Number(payload.parent_id);
    }
    onSubmit?.(payload);
    close();
  };

  const handleDelete = async () => {
    if (!program?.program_id) return;

    try {
      // เช็คว่ามี program ย่อย (children) อยู่ข้างใต้หรือไม่
      const childrenResult = await getProgram({ parent_id: program.program_id });
      // เช็คว่ามี user ที่ใช้ program นี้อยู่หรือไม่
      const userResult = await getUserSys({ program_id: program.program_id, role_id: Number(roleId) });
      
      const children = childrenResult.success && childrenResult.data ? childrenResult.data : [];
      const users = userResult.success && userResult.data ? userResult.data : [];
      
      const cCount = children.length;
      const uCount = users.length;
      const totalCount = cCount + uCount;
      
      setChildrenCount(cCount);
      setUserCount(uCount);
      setRelatedPrograms(children);
      setRelatedUsers(users);
      
      if (totalCount > 0) {
        const warnings = [];
        if (cCount > 0) {
          const childUnit = getChildUnitText();
          warnings.push(`${cCount} ${childUnit}`);
        }
        if (uCount > 0) warnings.push(`${uCount} ผู้ใช้งาน`);
        setDeleteWarning(`${unitText}นี้มี ${warnings.join(' และ ')} กรุณาลบข้อมูลที่เกี่ยวข้องก่อน`);
      } else {
        setDeleteWarning("");
      }
      
      setConfirmDeleteOpened(true);
    } catch (error) {
      console.error("Error checking dependencies:", error);
      showNotification(
        'เกิดข้อผิดพลาด',
        'ไม่สามารถตรวจสอบข้อมูลได้',
        'error',
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!program?.program_id) return;
    
    try {
      const result = await deleteProgram(program.program_id);
      
      if (result.success) {
        showNotification(
          `ลบ${unitText}สำเร็จ`,
          '',
          'success',
        );
        onDelete?.(program.program_id);
        setConfirmDeleteOpened(false);
        close();
      } else {
        showNotification(
          `ลบ${unitText}ไม่สำเร็จ`,
          result.message || 'เกิดข้อผิดพลาดในการลบข้อมูล',
          'error',
        );
      }
    } catch (error) {
      console.error('Error deleting program:', error);
      showNotification(
        `ลบ${unitText}ไม่สำเร็จ`,
        'เกิดข้อผิดพลาดในการเชื่อมต่อ',
        'error',
      );
    }
  };

  const getChildUnitText = () => {
    if (!root_id && instType === "school") return "ห้องเรียน";
    if (!root_id && instType === "uni") return "ภาควิชา";
    if (root_id && instType === "uni" && !twig_id) return "สาขา";
    return "รายการย่อย";
  };

  return (
    <>
    <Modal
      id="edit-program-modal"
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
          id="input-program-name"
          label={`ชื่อ${unitText}`}
          //placeholder={`เช่น คณิตศาสตร์`}
          {...form.getInputProps("program_name")}
          required
          mb="sm"
          radius={8}
        />

        <TextInput
          id="input-program-remark"
          label={`หมายเหตุ${unitText}`}
          //placeholder={`เช่น ${unitText === "ห้องเรียน" ? "ห้องเรียนสำหรับนักเรียน" : "สาขาวิทยาการคอมพิวเตอร์"}`}
          {...form.getInputProps("remark")}
          mb="sm"
          radius={8}
        />


        <Group justify="flex-end" className="mt-4">
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

          <Button id="save-button" type="submit" radius={8}>
            บันทึก
          </Button>
        </Group>
      </form>
    </Modal>

    <ConfirmModalEx
      opened={confirmDeleteOpened}
      onClose={() => setConfirmDeleteOpened(false)}
      title={`ยืนยันการลบ${unitText}`}
      size="lg"
      description={
        <>
          <div className="text-center mb-4">
            คุณต้องการลบ{unitText} <strong>{program?.program_name}</strong> ใช่หรือไม่?
          </div>
          
          {(childrenCount > 0 || userCount > 0) && (
            <div className="mt-4 text-left">
              <Text size="sm" fw={600} mb="xs" c="red">
                พบข้อมูลที่เกี่ยวข้อง:
              </Text>
              <div className="max-h-48 overflow-y-auto rounded-lg p-2 px-4 bg-gray-50">
                {childrenCount > 0 && (
                  <div className="mb-3">
                    <Text size="sm" fw={600} mb="xs" c="red">
                      {getChildUnitText()} ({childrenCount} รายการ):
                    </Text>
                    {relatedPrograms.slice(0, 5).map((child, index) => (
                      <div key={child.program_id || index} className="text-sm py-1">
                        • {child.program_name} {child.remark ? `(${child.remark})` : ''}
                      </div>
                    ))}
                    {relatedPrograms.length > 5 && (
                      <div className="text-xs text-gray-500 mt-1">
                        ... และอีก {relatedPrograms.length - 5} รายการ
                      </div>
                    )}
                  </div>
                )}
                {userCount > 0 && (
                  <div>
                    <Text size="sm" fw={600} mb="xs" c="red">
                      ผู้ใช้งาน ({userCount} คน):
                    </Text>
                    {relatedUsers.slice(0, 5).map((user, index) => (
                      <div key={user.user_sys_id || index} className="text-sm py-1 ml-4">
                        <div>
                          <strong>{user.first_name} {user.last_name}</strong>
                        </div>
                        {user.code} - {user.level_name}
                      </div>
                    ))}
                    {relatedUsers.length > 5 && (
                      <div className="text-xs text-gray-500 mt-1">
                        ... และอีก {relatedUsers.length - 5} คน
                      </div>
                    )}
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
      disableConfirm={childrenCount > 0 || userCount > 0}
    />
    </>
  );
}
