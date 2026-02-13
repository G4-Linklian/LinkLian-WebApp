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
import { IconMail, IconPhone, IconId, IconSchool, IconUser, IconUserPin } from '@tabler/icons-react';
import { UserSysFields } from "@/utils/interface/user.types";
import { useState } from 'react';
import { deleteSectionEducator } from '@/utils/api/section';
import { ConfirmModalEx } from '@/comps/public/ConfirmModal';
import { useNotification } from '@/comps/noti/notiComp';
import { TeacherPosition, TeacherPositionLabel } from '@/enums/teacher';

interface ViewInstructorDetailModalProps {
  opened: boolean;
  close: () => void;
  instructor: UserSysFields | null;
  sectionId?: number;
  onDelete?: (user_sys_id: number) => void;
}

export default function ViewInstructorDetailModal({
  opened,
  close,
  instructor,
  sectionId,
  onDelete
}: ViewInstructorDetailModalProps) {

  if (!instructor) return null;

  const { showNotification } = useNotification();
  const [confirmDeleteOpened, setConfirmDeleteOpened] = useState(false);

  const fullName = `${instructor.first_name} ${instructor.middle_name ? instructor.middle_name + ' ' : ''}${instructor.last_name}`;

  const getStatusColor = (status: any) => {
    switch (status) {
      case TeacherPosition.MAIN_TEACHER: return 'green';
      case TeacherPosition.SECOND_TEACHER: return 'blue';
      case TeacherPosition.TA: return 'cyan';
      default: return 'gray';
    }
  };

  const positionLabel = TeacherPositionLabel[instructor.position as TeacherPosition] || instructor.position || 'ไม่ระบุ';

  const statusMap: Record<string, { label: string; color: string }> = {
    'Active': { label: 'ใช้งาน', color: 'green' },
    'Inactive': { label: 'เลิกใช้งาน', color: 'gray' },
  };

  const statusInfo = statusMap[instructor.user_status || 'Active'] || { label: instructor.user_status || '-', color: 'gray' };

  const handleDelete = async () => {
    setConfirmDeleteOpened(true);
  };

  const handleConfirmDelete = async () => {
    if (!instructor?.user_sys_id || !sectionId) return;
    
    try {
      const result = await deleteSectionEducator({
        section_id: sectionId,
        user_sys_id: instructor.user_sys_id
      });
      
      if (result.success) {
        showNotification(
          'ลบผู้สอนออกจากกลุ่มเรียนสำเร็จ',
          '',
          'success',
        );
        onDelete?.(instructor.user_sys_id);
        setConfirmDeleteOpened(false);
        close();
      } else {
        showNotification(
          'ลบผู้สอนไม่สำเร็จ',
          result.message || 'เกิดข้อผิดพลาดในการลบข้อมูล',
          'error',
        );
      }
    } catch (error) {
      console.error('Error deleting educator:', error);
      showNotification(
        'ลบผู้สอนไม่สำเร็จ',
        'เกิดข้อผิดพลาดในการเชื่อมต่อ',
        'error',
      );
    }
  };

  return (
    <>
      <Modal
      opened={opened}
      onClose={close}
      centered
      size="md"
      radius={16}
      title={<Text fw={700} size="lg">ข้อมูลผู้สอน</Text>}
    >
      <div className="gap-3 flex flex-col">
        {/* Instructor Info Card */}
        <Paper withBorder p="md" radius="md" className="border-orange-200">
          <Group>
            <Avatar
              src={instructor.profile_pic}
              alt={fullName}
              radius="xl"
              size="xl"
              color="orange"
              className="border-4 border-white shadow-md"
            >
              {instructor.first_name?.[0]}
            </Avatar>
            <div style={{ flex: 1 }}>
              <Text size="lg" fw={700} className="text-gray-900">
                {fullName}
              </Text>
              <Group gap="xs" mt={4}>
                <Badge color="orange" variant="filled" size="sm">
                  {instructor.code}
                </Badge>
                <Badge color={getStatusColor(instructor.position)} variant="light" size="sm">
                  {positionLabel}
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
              label="ชื่อ"
              leftSection={<IconUser size={16} />}
              value={instructor.first_name || '-'}
              radius={8}
              readOnly
              variant="filled"
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="นามสกุล"
              value={instructor.last_name || '-'}
              radius={8}
              readOnly
              variant="filled"
            />
          </Grid.Col>

          {instructor.middle_name && (
            <Grid.Col span={12}>
              <TextInput
                label="ชื่อกลาง"
                value={instructor.middle_name || '-'}
                radius={8}
                readOnly
                variant="filled"
              />
            </Grid.Col>
          )}

          <Grid.Col span={12}>
            <TextInput
              label="อีเมล"
              leftSection={<IconMail size={16} />}
              value={instructor.email || '-'}
              radius={8}
              readOnly
              variant="filled"
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <TextInput
              label="เบอร์โทร"
              leftSection={<IconPhone size={16} />}
              value={instructor.phone || '-'}
              radius={8}
              readOnly
              variant="filled"
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <TextInput
              label="รหัสครู"
              leftSection={<IconId size={16} />}
              value={instructor.code || '-'}
              radius={8}
              readOnly
              variant="filled"
            />
          </Grid.Col>
        </Grid>

        <Divider label="ข้อมูลการสอน" labelPosition="center" />

        <Grid gutter="sm">
          <Grid.Col span={6}>
            <TextInput
              label="ตำแหน่งผู้สอน"
              leftSection={<IconUserPin size={16} />}
              value={positionLabel}
              radius={8}
              readOnly
              variant="filled"
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <TextInput
              label="กลุ่มสาระการเรียนรู้"
              leftSection={<IconSchool size={16} />}
              value={instructor.learning_area_name || '-'}
              radius={8}
              readOnly
              variant="filled"
            />
          </Grid.Col>
        </Grid>

        <Group justify="flex-end" className="mt-4">
          <Button
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
      title="ยืนยันการลบผู้สอน"
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
