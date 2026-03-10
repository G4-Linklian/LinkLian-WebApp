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

interface ViewStudentDetailModalProps {
  opened: boolean;
  close: () => void;
  student: UserSysFields | null;
}

export default function ViewStudentDetailModal({
  opened,
  close,
  student
}: ViewStudentDetailModalProps) {

  if (!student) return null;

  const fullName = `${student.first_name} ${student.middle_name ? student.middle_name + ' ' : ''}${student.last_name}`;

  const statusMap: Record<string, { label: string; color: string }> = {
    'Active': { label: 'ใช้งาน', color: 'green' },
    'Inactive': { label: 'เลิกใช้งาน', color: 'gray' },
  };

  const statusInfo = statusMap[student.user_status || 'Active'] || { label: student.user_status || '-', color: 'gray' };

  return (
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
        <Paper withBorder p="md" radius="md" className="border-blue-200">
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
                <Badge color="blue" variant="filled" size="sm" id="student-code">
                  {student.code}
                </Badge>
                <Badge color={statusInfo.color} variant="light" size="sm" id="student-info">
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
              id="student-first-name"
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
              label="นามสกุล"
              value={student.last_name || '-'}
              radius={8}
              readOnly
              variant="filled"
              id="student-last-name"
            />
          </Grid.Col>

          {student.middle_name && (
            <Grid.Col span={12}>
              <TextInput
                label="ชื่อกลาง"
                value={student.middle_name || '-'}
                radius={8}
                readOnly
                variant="filled"
                id="student-middle-name"
              />
            </Grid.Col>
          )}

          <Grid.Col span={12}>
            <TextInput
              id="student-email"
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
              id="student-phone"
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
              id="student-code"
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
              id="student-level"
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
              id="student-classroom"
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
          <Button onClick={close} radius={8} id="close-button">
            ปิด
          </Button>
        </Group>
      </div>
    </Modal>
  );
}
