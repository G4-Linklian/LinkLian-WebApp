import {
  Modal,
  Button,
  Group,
  TextInput,
  Checkbox,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { learningAreaFields } from '@/utils/interface/learningArea.types';
import { useEffect, useState } from 'react';
import { getUserSys } from '@/utils/api/userData';
import { getSubject } from '@/utils/api/subject';
import { deleteLearningArea } from '@/utils/api/learningArea';
import { ConfirmModalEx } from '@/comps/public/ConfirmModal';
import { useNotification } from '@/comps/noti/notiComp';
import { UserSysFields } from '@/utils/interface/user.types';
import { subjectFields } from '@/utils/interface/subject.types';

interface LearningAreaEditModalProps {
  learningArea: learningAreaFields | null;
  opened: boolean;
  close: () => void;
  onSubmit?: (values: learningAreaFields) => void;
  onDelete?: (learning_area_id: number) => void;
}

export default function LearningAreaEditModal({
  learningArea,
  opened,
  close,
  onSubmit,
  onDelete,
}: LearningAreaEditModalProps) {
  if (!learningArea) return null;

  const { showNotification } = useNotification();
  const [confirmDeleteOpened, setConfirmDeleteOpened] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState<string>("");
  const [userCount, setUserCount] = useState<number>(0);
  const [subjectCount, setSubjectCount] = useState<number>(0);
  const [relatedUsers, setRelatedUsers] = useState<UserSysFields[]>([]);
  const [relatedSubjects, setRelatedSubjects] = useState<subjectFields[]>([]);

  const form = useForm<learningAreaFields>({
    initialValues: {
      learning_area_id: undefined,
      inst_id: undefined,
      learning_area_name: "",
      remark: "",
      flag_valid: true,
    },
  });

  useEffect(() => {
    if (!learningArea) return;

    form.setValues({
      learning_area_id: learningArea.learning_area_id,
      inst_id: learningArea.inst_id,
      learning_area_name: learningArea.learning_area_name ?? "",
      remark: learningArea.remark ?? "",
      flag_valid: learningArea.flag_valid ?? true,
    });
  }, [learningArea]);

  const handleSubmit = (values: learningAreaFields) => {
    onSubmit?.(values);
    close();
  };

  const handleDelete = async () => {
    if (!learningArea?.learning_area_id) return;

    try {
      // เช็คว่ามีผู้ใช้ที่อยู่ในกลุ่มเรียนรู้นี้หรือไม่
      const userResult = await getUserSys({ learning_area_id: Number(learningArea.learning_area_id) });
      // เช็คว่ามีวิชาที่อยู่ในกลุ่มเรียนรู้นี้หรือไม่
      const subjectResult = await getSubject({ learning_area_id: Number(learningArea.learning_area_id) });

      const users = userResult.success && userResult.data ? userResult.data : [];
      const subjects = subjectResult.success && subjectResult.data ? subjectResult.data : [];

      const uCount = users.length;
      const sCount = subjects.length;
      const totalCount = uCount + sCount;

      setUserCount(uCount);
      setSubjectCount(sCount);
      setRelatedUsers(users);
      setRelatedSubjects(subjects);

      if (totalCount > 0) {
        const warnings = [];
        if (uCount > 0) warnings.push(`${uCount} รายชื่อผู้ใช้`);
        if (sCount > 0) warnings.push(`${sCount} รายวิชา`);
        setDeleteWarning(`กลุ่มการเรียนรู้นี้มี ${warnings.join(' และ ')} ที่เกี่ยวข้อง กรุณาลบข้อมูลที่เกี่ยวข้องก่อน`);
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
    if (!learningArea?.learning_area_id) return;

    try {
      const result = await deleteLearningArea(learningArea.learning_area_id);

      if (result.success) {
        showNotification(
          'ลบกลุ่มเรียนรู้สำเร็จ',
          '',
          'success',
        );
        onDelete?.(learningArea.learning_area_id);
        setConfirmDeleteOpened(false);
        close();
      } else {
        showNotification(
          'ลบกลุ่มเรียนรู้ไม่สำเร็จ',
          result.message || 'เกิดข้อผิดพลาดในการลบข้อมูล',
          'error',
        );
      }
    } catch (error) {
      console.error('Error deleting learning area:', error);
      showNotification(
        'ลบกลุ่มเรียนรู้ไม่สำเร็จ',
        'เกิดข้อผิดพลาดในการเชื่อมต่อ',
        'error',
      );
    }
  };

  return (
    <>
      <Modal
        id="edit-learning-area-modal"
        opened={opened}
        onClose={close}
        centered
        size="md"
        radius={16}
      >
        <h1 className="color-black font-bold text-2xl mb-4 text-center">จัดการกลุ่มการเรียนรู้</h1>
        <form
          id="learning-area-edit-form"
          onSubmit={form.onSubmit(handleSubmit)}
          className="gap-2 flex flex-col"
        >
          <TextInput
            id="edit-learning-area-name"
            label="ชื่อกลุ่มการเรียนรู้"
            placeholder="เช่น คณิตศาสตร์"
            {...form.getInputProps("learning_area_name")}
            required
            mb="sm"
            radius={8}
          />

          <TextInput
            id="edit-learning-area-remark"
            label="หมายเหตุ"
            placeholder="เช่น ชั้นเรียนสำหรับนักเรียน"
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

            <Button
              id="save-button"
              type="submit"
              radius={8}
            >
              บันทึก
            </Button>
          </Group>
        </form>
      </Modal>

      <ConfirmModalEx
        opened={confirmDeleteOpened}
        onClose={() => setConfirmDeleteOpened(false)}
        title="ยืนยันการลบกลุ่มการเรียนรู้"
        size="lg"
        description={
          <>
            <div className="text-center mb-4">
              คุณต้องการลบกลุ่มการเรียนรู้ <strong>{learningArea?.learning_area_name}</strong> ใช่หรือไม่?
            </div>

            {(userCount > 0 || subjectCount > 0) && (
              <div className="mt-4 text-left">
                <Text size="sm" fw={600} mb="xs" c="red">
                  พบข้อมูลที่เกี่ยวข้อง:
                </Text>
                <div className="max-h-48 overflow-y-auto rounded-lg p-2 px-4 bg-gray-50">
                  {userCount > 0 && (
                    <div className="mb-3">
                      <Text size="sm" fw={600} mb="xs" c="red">
                        ผู้ใช้ ({userCount} คน):
                      </Text>
                      {relatedUsers.slice(0, 5).map((user, index) => (
                        <div key={user.user_sys_id || index} className="text-sm py-1">
                          • {user.first_name} {user.last_name} ({user.email})
                        </div>
                      ))}
                      {relatedUsers.length > 5 && (
                        <div className="text-xs text-gray-500 mt-1">
                          ... และอีก {relatedUsers.length - 5} คน
                        </div>
                      )}
                    </div>
                  )}
                  {subjectCount > 0 && (
                    <div>
                      <Text size="sm" fw={600} mb="xs" c="red">
                        รายวิชา ({subjectCount} วิชา):
                      </Text>
                      {relatedSubjects.slice(0, 5).map((subject, index) => (
                        <div key={subject.subject_id || index} className="text-sm py-1">
                          • {subject.subject_code} - {subject.name_th}
                        </div>
                      ))}
                      {relatedSubjects.length > 5 && (
                        <div className="text-xs text-gray-500 mt-1">
                          ... และอีก {relatedSubjects.length - 5} วิชา
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
        disableConfirm={userCount > 0 || subjectCount > 0}
      />
    </>
  );
}
