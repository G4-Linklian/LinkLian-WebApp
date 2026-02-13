// ConfirmModal.tsx

import { Modal, Button, Text, Title } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

import {
    IconMapUp,
} from "@tabler/icons-react"

export type ConfirmModalProps = {
    opened: boolean;
    onClose: () => void;
    title: string;
    description?: string | React.ReactNode;
    warningText?: string;
    handleConfirm: () => void;
    color: string;
    form?: any;
    disableConfirm?: boolean;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
};

export const ConfirmModalEx = ({
    opened,
    onClose,
    title,
    description,
    warningText,
    handleConfirm,
    color,
    form,
    disableConfirm = false,
    size = 'xs',
}: ConfirmModalProps) => {
    return (
        <Modal
            opened={opened}
            onClose={onClose}
            centered
            // title={
            //     <div className="text-center">
            //         <Title order={2}>{title}</Title>
            //     </div>
            // }
            radius="lg"
            padding="lg"
            size={size}
            className='text-center flex flex-col justify-center items-center'
        >
            <Title order={2} className="text-center text-lg font-semibold"
            style={{
                marginBottom: "40px"
            }}
            >
                {title}
            </Title>
            {description && <Text mb="sm">{description}</Text>}

            {warningText && (
                <Text c="red" mb="md" fw={600} className="flex items-center justify-center gap-1">
                    <IconAlertTriangle size={18} /> {warningText}
                </Text>
            )}

            {form === 'map' && (
                <>
                    <IconMapUp size={50} color="green" className='mx-auto mb-10 mt-10'/>
                </>
            )}

            <div className={`
                flex justify-end gap-3
                ${form === 'map' ? "mt-5" : "mt-18"}
                `}>
                <Button radius={'md'} variant="default" onClick={onClose}>
                    ยกเลิก
                </Button>
                <Button 
                    radius={'md'} 
                    color={`${color}`} 
                    onClick={handleConfirm}
                    disabled={disableConfirm}
                >
                    ยืนยัน
                </Button>
            </div>
        </Modal>
    );
};
