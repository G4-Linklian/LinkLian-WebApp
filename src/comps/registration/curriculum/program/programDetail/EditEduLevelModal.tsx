import {
  Modal,
  Button,
  Group,
  TextInput,
  Checkbox,
  Select,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { eduLevelFields } from '@/utils/interface/eduLevel.types';
import { useEffect } from 'react';
import { ConfirmModalEx } from '@/comps/public/ConfirmModal';
import { deleteEduLevelNorm } from '@/utils/api/eduLevel';
import { useState } from 'react';

interface EduLevelEditModalProps {
  eduLevel: eduLevelFields | null;
  opened: boolean;
  close: () => void;
  onSubmit?: (values: eduLevelFields) => void;
  eduLevelData?: any;
  ProgramData?: any;
  onDelete?: (edu_lev_id: number) => void;
}

export default function EduLevelEditModal({
  eduLevel,
  opened,
  close,
  onSubmit,
  eduLevelData,
  ProgramData,
  onDelete,
}: EduLevelEditModalProps) {
  if (!eduLevel) return null;

  const [confirmDeleteOpened, setConfirmDeleteOpened] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState<string>("");

  const form = useForm<eduLevelFields>({
    initialValues: {
      edu_lev_id: undefined,
      program_id: undefined,
    },
  });

  useEffect(() => {
    if (eduLevel) {
      form.setValues({
        program_id: eduLevel.program_id,
        edu_lev_id: eduLevel.edu_lev_id,
      });
    }
  }, [eduLevel]);

  const handleSubmit = (values: eduLevelFields) => {
    onSubmit?.(values);
    close();
  };

  const handleDelete = async () => {
    if (!eduLevel) return;

    try {
      const result = await deleteEduLevelNorm({
        edu_lev_id: eduLevel.edu_lev_id,
        program_id: eduLevel.program_id,
      });

      if (result.success) {
        onDelete?.(Number(eduLevel.edu_lev_id));
        setConfirmDeleteOpened(false);
        close();
      } else {
        setDeleteWarning(result.message || 'เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    } catch (error) {
      console.error('Error deleting edu level:', error);
      setDeleteWarning('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  return (
    <>
      <Modal
        id="edit-edu-level-modal"
        opened={opened}
        onClose={close}
        centered
        size="md"
        radius={16}
      >
        <h1 className="color-black font-bold text-2xl mb-4 text-center">จัดการชั้นเรียน</h1>
        <form onSubmit={form.onSubmit(handleSubmit)} className="gap-2 flex flex-col">
          <Select
            label="ระดับการศึกษา"
            placeholder="เลือกระดับการศึกษา"
            data={eduLevelData}
            {...form.getInputProps("edu_lev_id")}
            required
            disabled
            radius={8}
          />

          <Select
            label="เลือกห้องเรียน"
            placeholder="เลือกห้องเรียน"
            data={
              ProgramData && Array.isArray(ProgramData)
                ? ProgramData.map((program: any) => ({
                    value: program.program_id?.toString() || '',
                    label: `${program.program_name || 'N/A'} - ${program.remark || ''}`,
                  }))
                : []
            }
            {...form.getInputProps("program_id")}
            required
            disabled
            radius={8}
          />

          <Group justify="flex-end" className="mt-4">
            <Button
              color="red"
              variant="outline"
              radius={8}
              onClick={() => setConfirmDeleteOpened(true)}
              type="button"
            >
              ลบ
            </Button>

            <Button type="submit" radius={8}>
              บันทึก
            </Button>
          </Group>
        </form>
      </Modal>

      <ConfirmModalEx
        opened={confirmDeleteOpened}
        onClose={() => setConfirmDeleteOpened(false)}
        title="ยืนยันการลบชั้นเรียน"
        size="lg"
        description={
          <div className="text-center mb-4">
            คุณต้องการลบชั้นเรียน <strong>{eduLevel?.edu_lev_id}</strong> ใช่หรือไม่?
          </div>
        }
        warningText={deleteWarning}
        handleConfirm={handleDelete}
        color="red"
      />
    </>
  );
}
