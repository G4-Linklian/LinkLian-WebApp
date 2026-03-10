import {
  Modal,
  Button,
  Group,
  TextInput,
  Avatar,
  Text,
  Paper,
  Grid,
  Badge,
  Divider
} from "@mantine/core";
import { IconMail, IconPhone, IconId, IconSchool, IconUser, IconBook } from '@tabler/icons-react';
import { UserSysFields } from "@/utils/interface/user.types";
import { useState } from 'react';
import { deleteSectionEnrollment } from '@/utils/api/section';
import { ConfirmModalEx } from '@/comps/public/ConfirmModal';
import { useNotification } from '@/comps/noti/notiComp';

interface ViewStudentDetailModalProps {
  opened: boolean;
  close: () => void;
  student: UserSysFields | null;
  sectionId?: number;
  onDelete?: (user_sys_id: number) => void;
}

export default function ViewStudentDetailModal({
  opened,
  close,
  student,
  sectionId,
  onDelete
}: ViewStudentDetailModalProps) {

  if (!student) return null;

  const { showNotification } = useNotification();
  const [confirmDeleteOpened, setConfirmDeleteOpened] = useState(false);

  const fullName = `${student.first_name} ${student.middle_name ? student.middle_name + ' ' : ''}${student.last_name}`;

  const statusMap: Record<string, { label: string; color: string }> = {
    'Active': { label: 'ใช้งาน', color: 'green' },
    'Inactive': { label: 'เลิกใช้งาน', color: 'gray' },
  };

  const statusInfo = statusMap[student.user_status || 'Active'] || { label: student.user_status || '-', color: 'gray' };

  const handleDelete = async () => {
    setConfirmDeleteOpened(true);
  };

  const handleConfirmDelete = async () => {
    if (!student?.user_sys_id || !sectionId) return;
    
    try {
      const result = await deleteSectionEnrollment({
        section_id: sectionId,
        user_sys_id: Number(student.user_sys_id)
      });
      
      if (result.success) {
        showNotification(
          'ลบนักเรียนออกจากกลุ่มเรียนสำเร็จ',
          '',
          'success',
        );
        onDelete?.(Number(student.user_sys_id));
        setConfirmDeleteOpened(false);
        close();
      } else {
        showNotification(
          'ลบนักเรียนไม่สำเร็จ',
          result.message || 'เกิดข้อผิดพลาดในการลบข้อมูล',
          'error',
        );
      }
    } catch (error) {
      console.error('Error deleting enrollment:', error);
      showNotification(
        'ลบนักเรียนไม่สำเร็จ',
        'เกิดข้อผิดพลาดในการเชื่อมต่อ',
        'error',
      );
    }
  };

  return (
    <>
      <Modal
      id="view-student-detail-modal"
      opened={opened}
      onClose={close}
      centered
      size="md"
      radius={16}
      title={<Text fw={700} size="lg">ข้อมูลนักเรียน</Text>}
    >
      <div className="gap-3 flex flex-col">
        {/* Student Info Card */}
        <Paper withBorder p="md" radius="md" className=" border-blue-200" id="student-info-card">
          <Group>
            <Avatar
              src={student.profile_pic}
              alt={fullName}
              radius="xl"
              size="xl"
              color="blue"
              className="border-4 border-white shadow-md"
            >
              {student.first_name?.[0]}
            </Avatar>
            <div style={{ flex: 1 }}>
              <Text size="lg" fw={700} className="text-gray-900" id="student-full-name">
                {fullName}
              </Text>
              <Group gap="xs" mt={4}>
                <Badge color="blue" variant="filled" size="sm" id="student-code-badge">
                  {student.code}
                </Badge>
                <Badge color={statusInfo.color} variant="light" size="sm">
                  {statusInfo.label}
                </Badge>
              </Group>
            </div>
          </Group>
        </Paper>

        <Divider label="ข้อมูลส่วนตัว" labelPosition="center" />

        <Grid gutter="sm">
          <Grid.Col span={6}>
            <TextInput
              id="student-first-name-input"
              label="ชื่อ"
              leftSection={<IconUser size={16} />}
              value={student.first_name || '-'}
              radius={8}
              readOnly
              variant="filled"
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              id="student-last-name-input"
              label="นามสกุล"
              value={student.last_name || '-'}
              radius={8}
              readOnly
              variant="filled"
            />
          </Grid.Col>

          {student.middle_name && (
            <Grid.Col span={12}>
              <TextInput
                id="student-middle-name-input"
                label="ชื่อกลาง"
                value={student.middle_name || '-'}
                radius={8}
                readOnly
                variant="filled"
              />
            </Grid.Col>
          )}

          <Grid.Col span={12}>
            <TextInput
              id="student-email-input"
              label="อีเมล"
              leftSection={<IconMail size={16} />}
              value={student.email || '-'}
              radius={8}
              readOnly
              variant="filled"
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <TextInput
              id="student-phone-input"
              label="เบอร์โทร"
              leftSection={<IconPhone size={16} />}
              value={student.phone || '-'}
              radius={8}
              readOnly
              variant="filled"
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <TextInput
              id="student-code-input"
              label="รหัสนักเรียน"
              leftSection={<IconId size={16} />}
              value={student.code || '-'}
              radius={8}
              readOnly
              variant="filled"
            />
          </Grid.Col>
        </Grid>

        <Divider label="ข้อมูลการศึกษา" labelPosition="center" />

        <Grid gutter="sm">
          <Grid.Col span={6}>
            <TextInput
              id="student-level-input"
              label="ระดับชั้น"
              leftSection={<IconSchool size={16} />}
              value={student.level_name || '-'}
              radius={8}
              readOnly
              variant="filled"
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <TextInput
              id="student-classroom-input"
              label="ห้องเรียน"
              leftSection={<IconBook size={16} />}
              value={student.program_name || '-'}
              radius={8}
              readOnly
              variant="filled"
            />
          </Grid.Col>
        </Grid>

        <Group justify="flex-end" className="mt-4">
          <Button
            id="delete-button"
            color="red"
            variant="outline"
            radius={8}
            onClick={handleDelete}
          >
            ลบ
          </Button>
        </Group>
      </div>
    </Modal>

    <ConfirmModalEx
      opened={confirmDeleteOpened}
      onClose={() => setConfirmDeleteOpened(false)}
      title="ยืนยันการลบนักเรียน"
      description={
        <div className="text-center">
          คุณต้องการลบ <strong>{fullName}</strong> ออกจากกลุ่มเรียนนี้ใช่หรือไม่?
        </div>
      }
      handleConfirm={handleConfirmDelete}
      color="red"
    />
    </>
  );
}
