import {
  Modal,
  Button,
  Group,
  TextInput,
  Select,
  Loader,
  Divider,
  Avatar,
  Text,
  Paper,
  Grid,
  Badge
} from "@mantine/core";
import { IconSelector, IconUser, IconMail, IconPhone, IconId, IconLibrary } from '@tabler/icons-react';
import { useForm } from "@mantine/form";
import { UserSysFields, UserSysFieldsForm } from "@/utils/interface/user.types";
import { useEffect, useState } from "react";
import { useDebouncedValue } from '@mantine/hooks';
import { getUserSys } from "@/utils/api/userData";

interface AddTeacherSectionModalProps {
  opened: boolean;
  close: () => void;
  onSubmit?: (values: UserSysFieldsForm) => void;
  learningAreaOptions?: { value: string; label: string }[];
  token?: any;
  roleID?: number;
}

type UserOption = {
  value: string;
  label: string;
  originalData?: any;
};

export default function AddTeacherSectionModal({
  opened,
  close,
  onSubmit,
  learningAreaOptions = [],
  token,
  roleID
}: AddTeacherSectionModalProps) {

  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchValue, 300);
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [loadingUser, setLoadingUser] = useState(false);

  const [selectedUserObj, setSelectedUserObj] = useState<any | null>(null);

  const form = useForm<UserSysFieldsForm>({
    initialValues: {
      email: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      phone: "",
      code: "",
      user_status: "",
      learning_area_name: "",
      user_sys_id: "",
      position: ""
    },
  });

  const fetchProgram = async (keyword: string) => {
    if (!token) return;

    try {
      setLoadingUser(true);

      const userData = await getUserSys({
        inst_id: token.institution.inst_id,
        keyword,
        role_id: roleID,
        sort_order: "desc",
      });

      const options: UserOption[] = userData.data.map((users: any) => ({
        value: users.user_sys_id,
        label: `${users.code} - ${users.first_name} ${users.last_name}`,
        originalData: users,
      }));

      setUserOptions(prev => {
        const map = new Map<string, UserOption>();
        [...prev, ...options].forEach(item => {
          map.set(item.value, item);
        });
        return Array.from(map.values());
      });
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    if (debouncedSearch.length >= 2) {
      fetchProgram(debouncedSearch);
    } else if (debouncedSearch.length === 0) {
      setUserOptions([]);
    }
  }, [debouncedSearch]);

  // ฟังก์ชันจัดการเมื่อเลือก User
  const handleUserSelect = (value: string | null) => {
    form.setFieldValue('user_sys_id', value || "");

    if (!value) {
      setSelectedUserObj(null);
      form.reset();
      return;
    }

    const selectedOption = userOptions.find(opt => opt.value === value);
    if (selectedOption && selectedOption.originalData) {
      const u = selectedOption.originalData;

      setSelectedUserObj(u);

      form.setValues({
        user_sys_id: u.user_sys_id || "",
        email: u.email || "",
        first_name: u.first_name || "",
        middle_name: u.middle_name || "",
        last_name: u.last_name || "",
        phone: u.phone || "",
        code: u.code || "",
        user_status: u.user_status || "",
        learning_area_name: u.learning_area_name || undefined,
        position: u.position || ""

      });
    }
  };

  const handleSubmit = (values: UserSysFieldsForm) => {
    onSubmit?.(values);
    close();
  };

  const renderUserInfoCard = () => {
    if (!selectedUserObj) return null;
    return (
      <Paper withBorder p="md" radius="md" className="bg-gray-50 mb-1 border-blue-100">
        <Group>
          <Avatar
            src={selectedUserObj.profile_pic}
            alt={selectedUserObj.first_name}
            radius="xl"
            size="lg"
            color="blue"
          >
            {selectedUserObj.first_name?.[0]}
          </Avatar>
          <div style={{ flex: 1 }}>
            <Text size="sm" fw={700} className="text-gray-900">
              {selectedUserObj.first_name} {selectedUserObj.last_name}
            </Text>
            <Text c="dimmed" size="xs">
              {selectedUserObj.email}
            </Text>
          </div>
          <Badge color="blue" variant="light">
            {selectedUserObj.code}
          </Badge>
        </Group>
      </Paper>
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={close}
      centered
      size="md"
      radius={16}
      title={<Text fw={700} size="lg">เพิ่มผู้สอน</Text>}
    >
      <form onSubmit={form.onSubmit(handleSubmit)} className="gap-2 flex flex-col">

        <Select
          label="เลือกผู้สอน"
          placeholder="ค้นหาชื่อ หรือ รหัสผู้สอน"
          data={userOptions}
          searchable
          nothingFoundMessage={loadingUser ? "กำลังค้นหา..." : "ไม่พบรายชื่อ"}
          onSearchChange={setSearchValue}
          searchValue={searchValue}
          clearable
          value={form.values.user_sys_id}
          onChange={handleUserSelect}
          error={form.errors.user_sys_id}
          filter={({ options }) => options}
          radius={8}
          rightSection={loadingUser ? <Loader size={16} /> : <IconSelector size={16} />}
          required
          mb={selectedUserObj ? "xs" : "md"}
        />

        {renderUserInfoCard()}

        <TextInput
          label="ตำแหน่งใน Section"
          placeholder="เช่น หัวหน้าผู้สอน, ผู้ช่วยสอน"
          {...form.getInputProps("position")}
          radius={8}
          required
        />

        <Divider label="ตรวจสอบข้อมูล (Auto-filled)" labelPosition="center" mb="sm" />

        <Grid gutter="sm">
          <Grid.Col span={12}>
            <TextInput
              label="อีเมล"
              leftSection={<IconMail size={16} />}
              {...form.getInputProps("email")}
              radius={8}
              readOnly={!!selectedUserObj}
              variant={selectedUserObj ? "filled" : "default"}
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <TextInput
              label="ชื่อ"
              {...form.getInputProps("first_name")}
              radius={8}
              readOnly={!!selectedUserObj}
              variant={selectedUserObj ? "filled" : "default"}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="นามสกุล"
              {...form.getInputProps("last_name")}
              radius={8}
              readOnly={!!selectedUserObj}
              variant={selectedUserObj ? "filled" : "default"}
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <TextInput
              label="ชื่อกลาง"
              {...form.getInputProps("middle_name")}
              radius={8}
              readOnly={!!selectedUserObj}
              variant={selectedUserObj ? "filled" : "default"}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="เบอร์โทร"
              leftSection={<IconPhone size={16} />}
              {...form.getInputProps("phone")}
              radius={8}
              readOnly={!!selectedUserObj}
              variant={selectedUserObj ? "filled" : "default"}
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <TextInput
              label="รหัสบุคลากร"
              leftSection={<IconId size={16} />}
              {...form.getInputProps("code")}
              radius={8}
              readOnly={!!selectedUserObj}
              variant={selectedUserObj ? "filled" : "default"}
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <TextInput
              label="กลุ่มสาระการเรียนรู้"
              leftSection={<IconLibrary size={16} />}
              {...form.getInputProps("learning_area_name")}
              radius={8}
              readOnly={!!selectedUserObj}
              variant={selectedUserObj ? "filled" : "default"}
            />
          </Grid.Col>
        </Grid>

        <Group justify="flex-end" className="mt-6">
          <Button color="gray" variant="outline" onClick={close} radius={8}>
            ยกเลิก
          </Button>

          <Button type="submit" radius={8}>
            เพิ่มผู้สอน
          </Button>
        </Group>
      </form>
    </Modal>
  );
}