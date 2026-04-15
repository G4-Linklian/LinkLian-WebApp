import React from 'react';
import { Button, Group, Tabs, TextInput } from '@mantine/core';
import ReportTable from './reportTable';
import ReportResolvedTable from './reportReSolvedTable';
import ReportFilterModal from './reportFilterModal';
import { IconAlertCircle, IconCircleCheck, IconFilter, IconSearch } from '@tabler/icons-react';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import { ReportFilterParams } from './types';

const ReportComp = () => {
	const [activeTab, setActiveTab] = React.useState<string | null>('pending');
	const [searchTerm, setSearchTerm] = React.useState('');
	const [debouncedSearchTerm] = useDebouncedValue(searchTerm, 400);
	const [filterParams, setFilterParams] = React.useState<ReportFilterParams>({});
    const [resolvedRefreshTick, setResolvedRefreshTick] = React.useState(0);
	const [openedFilter, { open: openFilter, close: closeFilter }] = useDisclosure(false);

	React.useEffect(() => {
		setFilterParams((prev) => ({
			...prev,
			keyword: debouncedSearchTerm || undefined,
		}));
	}, [debouncedSearchTerm]);

    return (
        <div className="report-section mt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">การแจ้งเตือน</h3>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <Tabs value={activeTab} onChange={setActiveTab} variant="pills" radius="lg" color="blue">
                    <div className="flex items-center justify-between gap-2">
                        <Tabs.List className="p-0 rounded-lg">
                            <Tabs.Tab
                                value="pending"
                                leftSection={<IconAlertCircle />}
                                className="hover:bg-white transition-colors"
                            >
                                ยังไม่แก้ไข
                            </Tabs.Tab>
                            <Tabs.Tab
                                value="resolved"
                                color="teal"
                                leftSection={<IconCircleCheck />}
                                className="hover:bg-white transition-colors"
                            >
                                แก้ไขแล้ว
                            </Tabs.Tab>
                        </Tabs.List>

                        <Group gap="xs">
                            <TextInput
                                placeholder="ค้นหาหัวข้อ/รายละเอียด"
                                size="xs"
                                radius="md"
                                leftSection={<IconSearch size={14} />}
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.currentTarget.value)}
                            />
                            {/* <Button
                                variant="default"
                                size="xs"
                                radius="md"
                                leftSection={<IconFilter size={14} />}
                                onClick={openFilter}
                            >
                                ตัวกรอง
                            </Button> */}
                        </Group>
                    </div>

                    <Tabs.Panel value="pending" pt="sm">
                        <ReportTable
							filterParams={filterParams}
							onResolved={() => setResolvedRefreshTick((prev) => prev + 1)}
						/>
                    </Tabs.Panel>

                    <Tabs.Panel value="resolved" pt="sm">
                        <ReportResolvedTable
							filterParams={filterParams}
							refreshTrigger={resolvedRefreshTick}
						/>
                    </Tabs.Panel>
                </Tabs>

                <ReportFilterModal
                    opened={openedFilter}
                    close={closeFilter}
                    initialValues={filterParams}
                    onSubmit={(values) => setFilterParams(values)}
                    onClear={() => {
                        setFilterParams({ keyword: debouncedSearchTerm || undefined });
                    }}
                />
            </div>
        </div>
    );
};

export default ReportComp;
