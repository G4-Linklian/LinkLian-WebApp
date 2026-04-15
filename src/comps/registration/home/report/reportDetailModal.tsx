import { Badge, Divider, Group, Modal, Paper, SimpleGrid, Text } from '@mantine/core';
import { formatDateTime } from '@/config/formatters';
import { getReporterRoleNameTH } from '@/enums/role';
import { parseReportFiles, ReportRow } from './types';

type ReportDetailModalProps = {
    opened: boolean;
    onClose: () => void;
    report: ReportRow | null;
};

export default function ReportDetailModal({ opened, onClose, report }: ReportDetailModalProps) {
    const selectedFiles = parseReportFiles(report?.report_file);
    const isImageFile = (type?: string) => {
        const normalizedType = (type || '').toLowerCase();
        return normalizedType.includes('jpg') || normalizedType.includes('jpeg') || normalizedType.includes('png') || normalizedType.includes('webp');
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            centered
            size="lg"
            radius={16}
            padding="lg"
        >
            <div className="space-y-4">
                <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border border-blue-100">
                    <Group justify="space-between" align="start">
                        <div>
                            <Text fw={800} size="xl" c="dark.9">รายละเอียดการแจ้งปัญหา</Text>
                            <Text size="sm" c="dimmed" mt={2}>ตรวจสอบข้อมูลและไฟล์แนบของรายการนี้</Text>
                        </div>
                        <Badge color={report?.mark_resolved ? 'green' : 'orange'} variant="light" size="lg" radius="sm">
                            {report?.mark_resolved ? 'แก้ไขแล้ว' : 'รอแก้ไข'}
                        </Badge>
                    </Group>
                </div>

                <Paper withBorder radius="md" p="md">
                    <Text fw={700} size="sm" c="gray.7" mb={4}>หัวข้อ</Text>
                    <Text size="sm" c="dark.8">{report?.title || '-'}</Text>
                    <Divider my="md" />
                    <Text fw={700} size="sm" c="gray.7" mb={4}>รายละเอียด</Text>
                    <Text size="sm" c="dark.8" style={{ whiteSpace: 'pre-wrap' }}>{report?.detail || '-'}</Text>
                </Paper>

                <Paper withBorder radius="md" p="md">
                    <Text fw={700} size="sm" c="gray.7" mb={8}>ข้อมูลผู้แจ้ง</Text>
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                        <div>
                            <Text size="xs" c="dimmed">ชื่อผู้แจ้ง</Text>
                            <Text size="sm" fw={500}>{`${report?.reporter_first_name || ''} ${report?.reporter_last_name || ''}`.trim() || '-'}</Text>
                        </div>
                        <div>
                            <Text size="xs" c="dimmed">อีเมล</Text>
                            <Text size="sm" fw={500}>{report?.reporter_email || '-'}</Text>
                        </div>
                        <div>
                            <Text size="xs" c="dimmed">บทบาทผู้แจ้ง</Text>
                            <Text size="sm" fw={500}>{getReporterRoleNameTH(report?.reporter_role_name)}</Text>
                        </div>
                        <div>
                            <Text size="xs" c="dimmed">วันที่แจ้ง</Text>
                            <Text size="sm" fw={500}>{formatDateTime(report?.report_date)}</Text>
                        </div>
                    </SimpleGrid>
                </Paper>

                <Paper withBorder radius="md" p="md">
                    <Text fw={700} size="sm" c="gray.7" mb={8}>ไฟล์แนบ</Text>
                    {selectedFiles.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center">
                            <Text size="sm" c="dimmed">ไม่มีไฟล์แนบ</Text>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                            {selectedFiles.map((file, index) => (
                                <a
                                    key={`${file.url}-${index}`}
                                    href={file.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block rounded-lg border border-gray-200 bg-white p-2 transition-all hover:shadow-sm"
                                >
                                    {isImageFile(file.type) ? (
                                        <img
                                            src={file.url}
                                            alt={file.original_name || `report-file-${index}`}
                                            className="h-28 w-full rounded-md object-cover"
                                        />
                                    ) : (
                                        <div className="h-28 w-full rounded-md bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                                            FILE
                                        </div>
                                    )}
                                    <Text size="xs" mt={6} className="truncate">{file.original_name || file.url}</Text>
                                </a>
                            ))}
                        </div>
                    )}
                </Paper>
            </div>
        </Modal>
    );
}
