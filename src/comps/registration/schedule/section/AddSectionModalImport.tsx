import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import { Stepper, Button, Paper, Text, List, ThemeIcon, Container, Group, Alert } from "@mantine/core";
import { Dropzone, MS_EXCEL_MIME_TYPE } from '@mantine/dropzone';
import { IconDownload, IconFileSpreadsheet, IconCircleCheck, IconAlertCircle } from "@tabler/icons-react";
import { decodeRegistrationToken } from '@/utils/authToken';
import { downloadTemplate } from "@/comps/public/downloadTemplate";
import { validateISectionData, saveImportSectionData } from "@/utils/api/import";
import TableSectionImport from "./TableSectionImport";
import { SECTION_IMPORT_COLUMNS, SECTION_TEMPLATE_FILENAME } from "@/config/csvHeader";

interface SectionRow {
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

export default function AddSectionModalImport() {
    const [instId, setInstId] = useState<number | null>(null);
    const router = useRouter();
    const { semester_id } = router.query;

    useEffect(() => {
        const token = decodeRegistrationToken();
        console.log("Decoded Token:", token);

        const instTd = token.institution.inst_id;
        if (token && instTd) {
            setInstId(instTd);
        }
    }, []);

    const [activeStep, setActiveStep] = useState(0);
    const totalSteps = 4;

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [validationData, setValidationData] = useState<any>(null);
    const [isValidating, setIsValidating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [validationToken, setValidationToken] = useState<string | null>(null);

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
        if (!selectedFile || !instId) return;

        setIsValidating(true);
        setValidationData(null);
        setValidationToken(null);

        try {
            const data = await validateISectionData(
                selectedFile,
                instId!,
                semester_id ? parseInt(semester_id as string) : 0
            );
            console.log("Validation result from API:", data);

            setValidationData(data);
            setActiveStep(2);
            setValidationToken(data?.validationToken || null);

        } catch (error) {
            console.error("Validate failed:", error);
        } finally {
            setIsValidating(false);
        }
    };

    const handleSave = async () => {
        if (!validationToken || !instId || !selectedFile) return;

        try {
            setIsSaving(true);

            const data = await saveImportSectionData(
                validationToken,
                selectedFile,
                instId!,
                semester_id ? parseInt(semester_id as string) : 0);
            setActiveStep(3);

            console.log("Save result from API:", data);

        } catch (error) {
            console.error("Save failed:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Container size={1200} py="xl" id="add-section-import-container">
            <Stepper
                id="add-section-stepper"
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

            <Paper withBorder p="xl" radius="md" mt="xl" id="add-section-import-paper">
                {activeStep === 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <Text size="xl" fw={700} mb={2}>ดาวน์โหลดตัวอย่างไฟล์และข้อแนะนำในการนำเข้าข้อมูล</Text>
                        <Text c="dimmed" size="sm" mb="xl">โปรดดาวน์โหลดไฟล์ด้านล่าง เพื่อนำข้อมูลที่ต้องการเข้าสู่ระบบอย่างถูกต้อง</Text>

                        <Paper withBorder p="lg" radius="md" bg="var(--mantine-color-gray-0)" mb="xl">
                            <Text fw={600} mb="xs">ข้อแนะนำในการนำเข้าข้อมูล</Text>
                            <List size="sm" spacing="xs" c="gray.7">
                                <List.Item>1. ไฟล์ที่นำเข้าต้องเป็นนามสกุล <b>.xlsx</b> หรือ <b>.xls</b></List.Item>
                                <List.Item>2. ใน 1 ไฟล์ สามารถมีได้ <b>1 ชีท</b> เท่านั้น</List.Item>
                                <List.Item>3. โปรดกรอกข้อมูลในคอลัมน์ให้ครบถ้วน</List.Item>
                                <List.Item>4. <b>กลุ่มเรียนที่ถูกเพิ่มจะอยู่ในภาคเรียนที่เลือกไว้ในตอนนี้เท่านั้น</b></List.Item>
                                <List.Item>5. <b>รหัสวิชาและรหัสผู้สอนต้องตรงกับข้อมูลที่มีในระบบ</b></List.Item>
                                <List.Item>6. <b>หากตึกและห้องเรียนที่ระบุไม่มีในระบบ ระบบจะทำการเพิ่มตึกและห้องเรียนใหม่อัตโนมัติ</b></List.Item>
                            </List>
                        </Paper>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
                            <Button
                                id="download-template-button"
                                radius="md"
                                variant="default"
                                leftSection={<IconDownload size={18} />}
                                onClick={() => downloadTemplate(SECTION_IMPORT_COLUMNS, SECTION_TEMPLATE_FILENAME)}
                                w="fit-content"
                            >
                                ดาวน์โหลดตัวอย่างไฟล์
                            </Button>

                            <Button
                                id="next-step-button"
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
                                id="section-dropzone"
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
                                id="back-step-button"
                                radius="md"
                                variant="outline"
                                onClick={() => setActiveStep(0)}
                            >
                                ย้อนกลับ
                            </Button>
                            <Button
                                id="validate-file-button"   
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

                        <TableSectionImport
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
                                    id="back-to-upload-button"
                                    radius="md"
                                    variant="outline"
                                    onClick={() => setActiveStep(1)}
                                >
                                    ย้อนกลับ (เพื่ออัปโหลดใหม่)
                                </Button>

                                <Button
                                    id="confirm-button"
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
                            ระบบได้ทำการนำเข้าข้อมูลกลุ่มเรียนทั้งหมดเรียบร้อยแล้ว
                            สามารถตรวจสอบรายการได้ที่หน้าจัดการข้อมูล
                        </Text>
                    </div>
                )}

            </Paper>
        </Container>
    );
}
