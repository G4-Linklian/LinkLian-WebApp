import { Button, Group, Modal, Select } from '@mantine/core';
import { useEffect } from 'react';
import { useForm } from '@mantine/form';
import { IconFilter } from '@tabler/icons-react';
import { reporterRoleOptions } from '@/enums/role';
import { ReportFilterParams } from './types';

type ReportFilterModalProps = {
    opened: boolean;
    close: () => void;
    initialValues: ReportFilterParams;
    onSubmit: (values: ReportFilterParams) => void;
    onClear: () => void;
};

export default function ReportFilterModal({
    opened,
    close,
    initialValues,
    onSubmit,
    onClear,
}: ReportFilterModalProps) {
    const form = useForm<ReportFilterParams>({
        initialValues: {
            reporter_role_name: undefined,
            keyword: undefined,
        },
    });

    useEffect(() => {
        if (opened) {
            form.setValues(initialValues);
        }
    }, [opened, initialValues]);

    const handleSubmit = (values: ReportFilterParams) => {
        const payload: ReportFilterParams = {};
        if (values.reporter_role_name) payload.reporter_role_name = values.reporter_role_name;
        if (values.keyword) payload.keyword = values.keyword;
        onSubmit(payload);
        close();
    };

    const handleClear = () => {
        form.reset();
        onClear();
        close();
    };

    return (
        <Modal
            opened={opened}
            onClose={close}
            centered
            size="sm"
            radius={16}
        >
            <h1 className="text-black font-bold text-2xl mb-4 text-center">ตัวกรองรายงาน</h1>

            <form onSubmit={form.onSubmit(handleSubmit)} className="flex flex-col gap-3">
                <Select
                    label="บทบาทผู้แจ้ง"
                    placeholder="เลือกบทบาท"
                    data={reporterRoleOptions}
                    clearable
                    radius={8}
                    {...form.getInputProps('reporter_role_name')}
                />

                <Group justify="right" mt="md">
                    <Button variant="default" onClick={handleClear} radius={8}>
                        ล้างค่า
                    </Button>
                    <Button type="submit" radius={8} leftSection={<IconFilter size={16} />}>
                        ใช้งานตัวกรอง
                    </Button>
                </Group>
            </form>
        </Modal>
    );
}
