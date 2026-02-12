import { resendTeacherOtp } from '@/utils/auth/teacherLogin';
import { Modal, Button, Text, Title, PinInput, Group, Stack, UnstyledButton } from '@mantine/core';
import { IconMessageDots, IconX } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';

export type OtpModalProps = {
    opened: boolean;
    onClose: () => void;
    handleConfirm: (otp: string) => void;
    expiresIn?: number;
    loading?: boolean;
    otpSessionId?: string;
};

export const OtpModalEx = ({
    opened,
    onClose,
    handleConfirm,
    expiresIn = 120,
    loading = false,
    otpSessionId: sessionId,
}: OtpModalProps) => {
    const [otpValue, setOtpValue] = React.useState('');
    const [timeLeft, setTimeLeft] = useState(expiresIn);
    const [resendLoading, setResendLoading] = useState(false);
    const [otpSessionId, setOtpSessionId] = useState<string>(sessionId || '');

    useEffect(() => {
        setOtpSessionId(sessionId || '');
    }, [sessionId]);

    useEffect(() => {
        if (!opened) {
            setTimeLeft(expiresIn);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onClose();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [opened, expiresIn, onClose]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const handleResendOtp = async () => {
        if (!otpSessionId) return;
        setResendLoading(true);
        try {
            const resendData = await resendTeacherOtp(otpSessionId);
            if (resendData.otp_session_id) {
                setOtpSessionId(resendData.otp_session_id);
            }
            setTimeLeft(expiresIn);
            setOtpValue('');
        } catch (error) {
            console.error("Error resending OTP:", error);
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            centered
            padding="16px"
            withCloseButton={true}
            styles={{
                content: {
                    backgroundColor: "#FFF2DD",
                    borderRadius: "16px"
                },
                header: {
                    backgroundColor: "#FFF2DD",
                    marginBottom: 0,
                    paddingBottom: 0,
                    minHeight: "40px"
                },
                close: {
                    backgroundColor: "transparent",
                    color: "#7A2310"
                }
            }}
                >
                <Stack align="center" gap="2xl" p="16px">
                    <IconMessageDots
                        size={60} color="#7A2310" stroke={2} style={{ marginBottom: "2px"}} />

                    <Title order={1} size="h2" ta="center" fw={700}>
                        ยืนยันรหัส
                    </Title>

                    <Text ta="center" size="sm" c="#7A2310">
                        หมดอายุใน{' '}
                        <Text span fw={700} c="#7A2310">
                            {formatTime(timeLeft)}
                        </Text>
                    </Text>

                    <PinInput
                        length={6}
                        size="xl"
                        radius="md"
                        type="number"
                        placeholder=""
                        manageFocus
                        autoFocus
                        value={otpValue}
                        onChange={setOtpValue}
                        my="sm"
                        w="100%"
                        styles={{
                            input: {
                                backgroundColor: 'white',
                                borderColor: '#FFB366',
                                flex: 1
                            }
                        }}
                    />

                    <Button
                        radius="md"
                        color="#7A2310"
                        onClick={() => handleConfirm(otpValue)}
                        loading={loading}
                        disabled={otpValue.length < 6}
                        w="100%"
                        mt="lg"
                        styles={{
                            root: {
                                backgroundColor: '#FFCF9A',
                                cursor: otpValue.length < 6 ? 'not-allowed' : 'pointer',
                                opacity: otpValue.length < 6 ? 0.5 : 1,
                            },
                            label: {
                                color: '#7A2310'
                            }
                        }}
                    >
                        ยืนยัน
                    </Button>

                    <UnstyledButton onClick={handleResendOtp} disabled={resendLoading}>
                        <Text size="sm" c="dimmed" fw={400} style={{ cursor: 'pointer' }}>
                            ส่งรหัสอีกครั้ง
                        </Text>
                    </UnstyledButton>
                </Stack>
        </Modal >
    );
};