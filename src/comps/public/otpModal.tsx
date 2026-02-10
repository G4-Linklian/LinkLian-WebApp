import { Modal, Button, Text, Title, PinInput, Group, Stack } from '@mantine/core';
import { IconMailOpened } from '@tabler/icons-react';
import React from 'react';

export type OtpModalProps = {
    opened: boolean;
    onClose: () => void;
    handleConfirm: (otp: string) => void;
    email?: string;
    loading?: boolean;
};

export const OtpModalEx = ({
    opened,
    onClose,
    handleConfirm,
    email,
    loading = false,
}: OtpModalProps) => {
    const [otpValue, setOtpValue] = React.useState('');

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            centered
            radius="md"
            padding="xl"
            withCloseButton={false}
        >
            <Stack align="center" gap="md">
                <IconMailOpened size={60} color="#5F9FE3" stroke={1.5} />
                
                <Title order={2} ta="center" size="h3">
                    ยืนยันรหัส OTP
                </Title>

                <Text size="sm" ta="center" c="dimmed" px="md">
                    กรุณากรอกรหัส OTP 6 หลักที่ส่งไปยัง <br />
                    <Text span fw={700} c="dark">{email || 'อีเมลของคุณ'}</Text>
                </Text>

                <Group justify="center" my="lg">
                    <PinInput
                        length={6}      
                        size="xl"
                        type="number"   
                        placeholder=""
                        manageFocus      
                        autoFocus        
                        value={otpValue}
                        onChange={setOtpValue}
                    />
                </Group>

                <Group grow w="100%" mt="xl">
                    <Button 
                        variant="default" 
                        radius="md" 
                        onClick={onClose}
                        disabled={loading}
                    >
                        ยกเลิก
                    </Button>
                    <Button 
                        radius="md" 
                        color="blue" 
                        onClick={() => handleConfirm(otpValue)}
                        loading={loading}
                        disabled={otpValue.length < 6} 
                    >
                        ยืนยันรหัส
                    </Button>
                </Group>
                
                <Text size="xs" ta="center" c="dimmed" className="cursor-pointer hover:underline">
                    ไม่ได้รับรหัส? <Text span c="blue" fw={500}>ส่งรหัสใหม่</Text>
                </Text>
            </Stack>
        </Modal>
    );
};