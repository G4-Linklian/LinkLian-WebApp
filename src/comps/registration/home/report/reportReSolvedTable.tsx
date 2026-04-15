import { useEffect, useRef, useState } from 'react';
import {
	Badge,
	Center,
	Group,
	Loader,
	ScrollArea,
	Table,
	Text,
} from '@mantine/core';
import { IconEye } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { decodeRegistrationToken } from '@/utils/authToken';
import { formatDateTime } from '@/config/formatters';
import { getInstitutionReport } from '@/utils/api/report';
import { useNotification } from '@/comps/noti/notiComp';
import { getReporterRoleNameTH } from '@/enums/role';
import ReportDetailModal from './reportDetailModal';
import { ReportFilterParams, ReportRow } from './types';

const BATCH_SIZE = 20;

interface ReportResolvedTableProps {
	filterParams: ReportFilterParams;
	refreshTrigger?: number;
}

export default function ReportResolvedTable({ filterParams, refreshTrigger = 0 }: ReportResolvedTableProps) {
	const [reportData, setReportData] = useState<ReportRow[]>([]);
	const [instId, setInstId] = useState<number | null>(null);
	const [loading, setLoading] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [selectedReport, setSelectedReport] = useState<ReportRow | null>(null);
	const [openedDetail, { open: openDetail, close: closeDetail }] = useDisclosure(false);
	const viewportRef = useRef<HTMLDivElement>(null);
	const { showNotification } = useNotification();

	useEffect(() => {
		const token = decodeRegistrationToken();
		if (token?.institution?.inst_id) {
			setInstId(token.institution.inst_id);
		}
	}, []);

	const fetchData = async (offset: number) => {
		if (!instId) return;

		setLoading(true);
		try {
			const response = await getInstitutionReport({
				inst_id: instId,
				mark_resolved: true,
				offset,
				limit: BATCH_SIZE,
				...filterParams,
			});

			const rows: ReportRow[] = response?.data ?? [];

			if (offset === 0) {
				setReportData(rows);
			} else {
				setReportData((prev) => [...prev, ...rows]);
			}

			if (rows.length < BATCH_SIZE) {
				setHasMore(false);
			}
		} catch (error) {
			console.error('Fetch resolved reports failed:', error);
			showNotification('โหลดข้อมูลไม่สำเร็จ', 'ไม่สามารถดึงรายการแจ้งปัญหาได้', 'error');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!instId) return;
		setHasMore(true);
		fetchData(0);
	}, [instId, filterParams, refreshTrigger]);

	const onScroll = () => {
		if (!viewportRef.current) return;

		const { scrollHeight, scrollTop, clientHeight } = viewportRef.current;
		if (scrollHeight - scrollTop <= clientHeight + 50 && !loading && hasMore) {
			fetchData(reportData.length);
		}
	};

	const rows = reportData.map((item) => (
		<Table.Tr key={item.inst_report_id} className="text-xs">
			<Table.Td ta="center">{item.title || '-'}</Table.Td>
			{/* <Table.Td ta="center">{item.detail || '-'}</Table.Td> */}
            <Table.Td ta="center">{item.reporter_first_name} {item.reporter_last_name || '-'}</Table.Td>
			<Table.Td ta="center">{getReporterRoleNameTH(item.reporter_role_name)}</Table.Td>
			<Table.Td ta="center">{formatDateTime(item.report_date)}</Table.Td>
			<Table.Td ta="center">
				<Badge color="green" variant="light">แก้ไขแล้ว</Badge>
			</Table.Td>
			<Table.Td ta="center">
				<Group justify="center" gap="xs">
					<IconEye
						size={18}
						stroke={2}
						color="gray"
						style={{ cursor: 'pointer' }}
						onClick={() => {
							setSelectedReport(item);
							openDetail();
						}}
					/>
				</Group>
			</Table.Td>
		</Table.Tr>
	));

	return (
		<div>
			<ScrollArea
				h={430}
				onScrollPositionChange={onScroll}
				viewportRef={viewportRef}
				type="always"
				bd="1px solid gray.3"
				style={{ borderRadius: 8 }}
			>
				<Table stickyHeader horizontalSpacing="md" verticalSpacing="md" layout="fixed">
					<Table.Thead style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.08)' }}>
						<Table.Tr>
							<Table.Th w={50} ta="center">หัวข้อ</Table.Th>
                            <Table.Th w={30} ta="center">ชื่อผู้แจ้ง</Table.Th>
							{/* <Table.Th w={70} ta="center">รายละเอียด</Table.Th> */}
							<Table.Th w={30} ta="center">บทบาทผู้แจ้ง</Table.Th>
							<Table.Th w={35} ta="center">วันที่แจ้ง</Table.Th>
							<Table.Th w={25} ta="center">สถานะ</Table.Th>
							<Table.Th w={30} ta="center">จัดการ</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{rows.length > 0 ? (
							rows
						) : (
							<Table.Tr>
								<Table.Td colSpan={6}>
									<Center py="md">
										<Text c="dimmed" size="sm">ยังไม่มีรายการแจ้งปัญหาที่แก้ไขแล้ว</Text>
									</Center>
								</Table.Td>
							</Table.Tr>
						)}
					</Table.Tbody>
				</Table>

				{loading && (
					<Center p="md">
						<Loader size="sm" />
					</Center>
				)}
			</ScrollArea>

			<ReportDetailModal
				opened={openedDetail}
				onClose={closeDetail}
				report={selectedReport}
			/>
		</div>
	);
}
