
import { useState } from "react";
import { Stepper, Button, Paper, Text, List, ThemeIcon, Container, Group, rem, ActionIcon, ScrollArea } from "@mantine/core";
import { Dropzone, MS_EXCEL_MIME_TYPE } from '@mantine/dropzone';
import { IconDownload, IconFileSpreadsheet, IconCircleCheck, IconSend, IconUpload, IconX } from "@tabler/icons-react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { downloadTemplate } from "@/comps/public/downloadTemplate";
import { validateImportData, saveImportData } from "@/utils/api/import";
import TableStaffImport from "./TableStaffImport";

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
    const [activeStep, setActiveStep] = useState(0);
    const totalSteps = 4;
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<{ fileName: string; count: number } | null>(null);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [validationData, setValidationData] = useState<any>(null);
    const [isValidating, setIsValidating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const columns = [
        { header: "ชื่อ", key: "name", width: 20 },
        { header: "อายุ", key: "age", width: 10 },
        {
            header: "สถานะ",
            key: "status",
            width: 20,
            dropdown: ["Active", "Inactive", "Pending"]
        }
    ];
    const fileName = "academic_staff.xlsx";

    const mockValidationData: {
        success: boolean;
        data: {
            validatedData: StaffRow[];
            summary: Summary;
        };
    } = {
        success: true,
        data: {
            validatedData: [
                {
                    row: 2,
                    data: {
                        "รหัสบุคลากร": "60134",
                        "ชื่อจริง": "ทดสอบชื่อครู14",
                        "นามสกุล": "ลลาเวียงค์",
                        "อีเมล": "test14@example.com",
                        "กลุ่มการเรียนรู้": "สังคม",
                        "สถานะผู้ใช้": "ใช้งาน",
                    },
                    isValid: true,
                    errors: [],
                    warnings: [],
                    isDuplicate: false,
                },
            ],
            summary: {
                total: 1,
                validCount: 1,
                errorCount: 0,
                duplicateCount: 0,
                warningCount: 0,
                willSaveCount: 1,
            },
        },
    };


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
        if (!selectedFile) return;

        setIsValidating(true);

        try {
            const data = await validateImportData(
                selectedFile,
                1,
                "school"
            );

            setValidationData(data);
            setActiveStep(2);

        } catch (error) {
            console.error("Validate failed:", error);
        } finally {
            setIsValidating(false);
        }
    };


    const handleSave = async () => {
        if (!selectedFile) return;

        try {
            setIsSaving(true);

            await saveImportData(selectedFile, 1, "school");

            setActiveStep(3);

        } catch (error) {
            console.error("Save failed:", error);
        } finally {
            setIsSaving(false);
        }
    };



    return (
        <Container size="md" py="xl">
            <Stepper
                active={activeStep}
                onStepClick={setActiveStep}
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
                                <List.Item>ไฟล์ที่นำเข้าต้องเป็นนามสกุล <b>.xlsx</b> หรือ <b>.xls</b></List.Item>
                                <List.Item>โปรดกรอกข้อมูลในคอลัมน์ : รหัสนักเรียน, ชื่อจริง, นามสกุล, อีเมล, เบอร์โทร, ระดับชั้น, ลำดับของห้องเรียน, สถานะผู้ใช้</List.Item>
                                <List.Item>อีเมลต้องอยู่ในรูปแบบที่ถูกต้อง</List.Item>
                                <List.Item>สถานะของนักเรียนต้องเป็น <Text span c="blue" fw={600}>Active</Text> หรือ <Text span c="gray.6" fw={600}>Inactive</Text> เท่านั้น</List.Item>
                            </List>
                        </Paper>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
                            <Button
                                radius="md"
                                variant="default"
                                leftSection={<IconDownload size={18} />}
                                onClick={() => downloadTemplate(columns, fileName)}
                                w="fit-content"
                            >
                                ดาวน์โหลด Template
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

                        {selectedFile && (
                            <Group justify="flex-end">
                                <Button
                                    radius="md"
                                    variant="outline"
                                    onClick={() => setActiveStep(1)}
                                >
                                    ย้อนกลับ
                                </Button>
                                <Button
                                    radius="md"
                                    loading={isValidating}
                                    onClick={handleValidate}
                                >
                                    ตรวจสอบข้อมูล
                                </Button>
                            </Group>
                        )}

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

                        <ScrollArea h={250} offsetScrollbars>
                            <TableStaffImport
                                validatedData={mockValidationData.data.validatedData}
                                summary={mockValidationData.data.summary}
                            // validatedData={validationData.validatedData}
                            // summary={validationData.summary}
                            />
                        </ScrollArea>

                        {selectedFile && (
                            <Group justify="flex-end">
                                <Button
                                    radius="md"
                                    variant="outline"
                                    onClick={() => setActiveStep(1)}
                                >
                                    ย้อนกลับ
                                </Button>
                                <Button
                                    color="blue"
                                    loading={isSaving}
                                    radius="md"
                                    onClick={handleSave}
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

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <Button
                                color="blue"
                                px={40}
                                onClick={() => {
                                    console.log('Finished');
                                }}
                            >
                                ปิด
                            </Button>
                        </div>
                    </div>
                )}

            </Paper>
        </Container>
    );
}