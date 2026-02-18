import { useState, useEffect } from "react";
import { Stepper, Button, Paper, Text, List, ThemeIcon, Container, Group, Alert, rem, ActionIcon, ScrollArea } from "@mantine/core";
import { Dropzone, MS_EXCEL_MIME_TYPE } from '@mantine/dropzone';
import { IconDownload, IconFileSpreadsheet, IconCircleCheck, IconAlertCircle, IconSend, IconUpload, IconX } from "@tabler/icons-react";
// import ExcelJS from "exceljs"; // ไม่ได้ใช้แล้วถ้าส่งไป API
// import { saveAs } from "file-saver"; // ไม่ได้ใช้แล้ว
import { decodeRegistrationToken } from '@/utils/authToken';
import { downloadTemplate } from "@/comps/public/downloadTemplate";
import { validateImportTeacherData, saveImportTeacherData } from "@/utils/api/import";
import TableStaffImport from "./TableStaffImport";
import { STAFF_IMPORT_COLUMNS, STAFF_TEMPLATE_FILENAME } from "@/config/csvHeader";

interface StaffRow {
    row: number;
    data: Record<string, any>;
    isValid: boolean;
    errors: string[];
    warnings: string[];
    isDuplicate: boolean;
}

interface Summary {
    total: number;
    validCount: number;
    errorCount: number;
    duplicateCount: number;
    warningCount: number;
    willSaveCount: number;
}

export default function AddStaffModalImport() {
    const [instId, setInstId] = useState<number | null>(null);
    const [instType, setInstType] = useState<string | null>(null);

    useEffect(() => {
        const token = decodeRegistrationToken();
        console.log("Decoded Token:", token);

        const instTd = token.institution.inst_id;
        const instType = token.institution.inst_type;
        if (token && instTd && instType) {
            setInstId(instTd);
            setInstType(instType);
        }
    }, []);

    const [activeStep, setActiveStep] = useState(0);
    const totalSteps = 4;
    // const [isUploading, setIsUploading] = useState(false); // ไม่ได้ใช้
    // const [uploadResult, setUploadResult] = useState<{ fileName: string; count: number } | null>(null); // ไม่ได้ใช้

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [validationData, setValidationData] = useState<any>(null); // State สำหรับเก็บข้อมูลจาก API
    const [isValidating, setIsValidating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [validationToken, setValidationToken] = useState<string | null>(null); // State สำหรับเก็บ token หลัง validate สำเร็จ

    // --- ลบ mockValidationData ออกแล้ว ---

    const nextStep = () => {
        if (activeStep < totalSteps - 1) {
            setActiveStep((prev) => prev + 1);
        }
    };

    const prevStep = () => {
        if (activeStep > 0) {
            setActiveStep((prev) => prev - 1);
        }
    };

    const handleValidate = async () => {
        if (!selectedFile || !instId || !instType) return;

        setIsValidating(true);
        setValidationData(null); // เคลียร์ค่าเก่าก่อน
        setValidationToken(null); // เคลียร์ token เก่าก่อน

        try {
            // เรียก API จริง
            const data = await validateImportTeacherData(
                selectedFile,
                instId!,
                instType!
            );
            console.log("Validation result from API:", data);

            // บันทึกผลลัพธ์จาก API ลง State
            setValidationData(data);
            setActiveStep(2);
            setValidationToken(data?.validationToken || null);

        } catch (error) {
            console.error("Validate failed:", error);
            // คุณอาจจะอยากเพิ่ม Notification แจ้งเตือน error ตรงนี้
        } finally {
            setIsValidating(false);
        }
    };

    const handleSave = async () => {
        if (!validationToken || !instId || !instType || !selectedFile) return;

        try {
            setIsSaving(true);

            const data = await saveImportTeacherData(
                validationToken,
                selectedFile,
                instId!,
                instType!);
            setActiveStep(3);

            console.log("Save result from API:", data);

        } catch (error) {
            console.error("Save failed:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Container size={1200} py="xl">
            <Stepper
                active={activeStep}
                onStepClick={(step) => {
                    if (step < activeStep) {
                        setActiveStep(step);
                    }
                }}
                size="sm"
                color="blue"
            >
                <Stepper.Step label="ดาวน์โหลดตัวอย่างไฟล์" />
                <Stepper.Step label="อัปโหลดไฟล์" />
                <Stepper.Step label="ผลการตรวจสอบ" />
                <Stepper.Step label="เพิ่มข้อมูลสำเร็จ" />
            </Stepper>

            <Paper withBorder p="xl" radius="md" mt="xl" >
                {activeStep === 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <Text size="xl" fw={700} mb={2}>ดาวน์โหลดตัวอย่างไฟล์และข้อแนะนำในการนำเข้าข้อมูล</Text>
                        <Text c="dimmed" size="sm" mb="xl">โปรดดาวน์โหลดไฟล์ด้านล่าง เพื่อนำข้อมูลที่ต้องการเข้าสู่ระบบอย่างถูกต้อง</Text>

                        <Paper withBorder p="lg" radius="md" bg="var(--mantine-color-gray-0)" mb="xl">
                            <Text fw={600} mb="xs">ข้อแนะนำในการนำเข้าข้อมูล</Text>
                            <List size="sm" spacing="xs" c="gray.7">
                                <List.Item>1. ไฟล์ที่นำเข้าต้องเป็นนามสกุล <b>.xlsx</b> หรือ <b>.xls</b></List.Item>
                                <List.Item>2. ใน 1 ไฟล์ สามารถมีได้ <b>1 ชีท</b> เท่านั้น</List.Item>
                                <List.Item>3. โปรดกรอกข้อมูลในคอลัมน์ให้ครบถ้วน ยกเว้นเบอร์โทรที่สามารถเว้นว่างได้</List.Item>
                                <List.Item>4. <b>กลุ่มการเรียนรู้ของบุคลากรต้องตรงกับข้อมูลที่มีในระบบ</b></List.Item>
                            </List>
                        </Paper>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
                            <Button
                                radius="md"
                                variant="default"
                                leftSection={<IconDownload size={18} />}
                                onClick={() => downloadTemplate(STAFF_IMPORT_COLUMNS, STAFF_TEMPLATE_FILENAME)}
                                w="fit-content"
                            >
                                ดาวน์โหลดตัวอย่างไฟล์
                            </Button>

                            <Button
                                radius="md"
                                onClick={nextStep}
                            >
                                {activeStep === totalSteps - 1 ? "ยืนยัน" : "ถัดไป"}
                            </Button>
                        </div>
                    </div>
                )}

                {activeStep === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        <div>
                            <Text size="xl" fw={700}>อัปโหลดไฟล์</Text>
                            <Text c="dimmed" size="sm">
                                เลือกไฟล์ Excel เพื่อตรวจสอบข้อมูลก่อนนำเข้า
                            </Text>
                        </div>

                        <Paper withBorder p="lg" radius="md" bg="var(--mantine-color-gray-1)">
                            <Dropzone
                                onDrop={(files) => {
                                    setSelectedFile(files[0]);
                                    setValidationData(null);
                                }}
                                multiple={false}
                                accept={MS_EXCEL_MIME_TYPE}
                                radius="md"
                                className="cursor-pointer"
                            >
                                <div className="flex flex-col items-center py-6">
                                    <IconFileSpreadsheet size={50} stroke={1} color="var(--mantine-color-gray-5)" />
                                    <Text size="sm" mt="sm">
                                        {selectedFile
                                            ? selectedFile.name
                                            : 'ลากไฟล์มาวาง หรือคลิกเพื่อเลือกไฟล์'}
                                    </Text>
                                </div>
                            </Dropzone>
                        </Paper>

                        <Group justify="flex-end">
                            <Button
                                radius="md"
                                variant="outline"
                                onClick={() => setActiveStep(0)}
                            >
                                ย้อนกลับ
                            </Button>
                            <Button
                                radius="md"
                                loading={isValidating}
                                onClick={handleValidate}
                                disabled={!selectedFile}
                            >
                                ตรวจสอบข้อมูล
                            </Button>
                        </Group>

                    </div>
                )}

                {activeStep === 2 && validationData && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        <div>
                            <Text size="xl" fw={700}>ตรวจสอบข้อมูลก่อนบันทึก</Text>
                            <Text c="dimmed" size="sm">
                                กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนยืนยัน
                            </Text>
                        </div>

                        {validationData?.data?.summary?.errorCount > 0 && (
                            <Alert variant="light" color="red" title="พบข้อผิดพลาด" icon={<IconAlertCircle />}>
                                พบข้อมูลที่ไม่ถูกต้องจำนวน {validationData.data.summary.errorCount} รายการ
                                กรุณาแก้ไขไฟล์แล้วอัปโหลดใหม่อีกครั้งในขั้นตอนที่ 2
                            </Alert>
                        )}

                        {validationData?.data?.summary?.duplicateCount > 0 &&
                            validationData?.data?.summary?.willSaveCount === 0 &&
                            validationData?.data?.summary?.errorCount === 0 && (
                                <Alert variant="light" color="yellow" title="ข้อมูลซ้ำทั้งหมด" icon={<IconAlertCircle />}>
                                    ข้อมูลทั้งหมดในไฟล์เป็นข้อมูลที่มีอยู่ในระบบแล้ว จะไม่มีการบันทึกข้อมูลใหม่
                                </Alert>
                            )}

                        <TableStaffImport
                            validatedData={validationData?.data?.validatedData || []}
                            summary={validationData?.data?.summary || {
                                total: 0,
                                validCount: 0,
                                errorCount: 0,
                                duplicateCount: 0,
                                warningCount: 0,
                                willSaveCount: 0
                            }}
                        />

                        {selectedFile && (
                            <Group justify="flex-end">
                                <Button
                                    radius="md"
                                    variant="outline"
                                    onClick={() => setActiveStep(1)}
                                >
                                    ย้อนกลับ (เพื่ออัปโหลดใหม่)
                                </Button>

                                <Button
                                    color="blue"
                                    loading={isSaving}
                                    radius="md"
                                    onClick={handleSave}
                                    disabled={
                                        (validationData?.data?.summary?.errorCount || 0) > 0 ||
                                        (validationData?.data?.summary?.willSaveCount || 0) === 0
                                    }
                                >
                                    ยืนยันการนำเข้าข้อมูล
                                </Button>
                            </Group>
                        )}
                    </div>
                )}

                {activeStep === 3 && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        padding: '40px 0',
                        textAlign: 'center'
                    }}>
                        <ThemeIcon
                            variant="light"
                            color="green"
                            size={100}
                            radius={100}
                            mb="xl"
                            style={{ border: '2px solid var(--mantine-color-green-1)' }}
                        >
                            <IconCircleCheck size={60} stroke={1.5} />
                        </ThemeIcon>

                        <Text size="24px" fw={700} c="dark.5" mb="xs">
                            เพิ่มข้อมูลสำเร็จ!
                        </Text>

                        <Text c="dimmed" size="sm" mb={40} style={{ maxWidth: 300 }}>
                            ระบบได้ทำการนำเข้าข้อมูลทั้งหมดเรียบร้อยแล้ว
                            คุณสามารถตรวจสอบรายชื่อได้ที่หน้าจัดการข้อมูล
                        </Text>
                    </div>
                )}

            </Paper>
        </Container>
    );
}