import React from 'react';
import { Box, ActionIcon, Text } from '@mantine/core';
import { useRouter } from 'next/router';
import { IconArrowLeft } from '@tabler/icons-react';

export default function QnaComp() {
    const router = useRouter();

    return (
        <Box className="h-[calc(100vh-64px)] w-full overflow-hidden bg-[#FAFAFA] text-black">
            {/* Sticky back button */}
            <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-gray-100 bg-[#FAFAFA] px-4 py-3">
                <ActionIcon
                    onClick={() => router.back()}
                    aria-label="ย้อนกลับ"
                    variant="light"
                    color="gray"
                    radius="xl"
                    size="lg"
                >
                    <IconArrowLeft size={20} stroke={2.2} />
                </ActionIcon>
                <Text fw={600} size="lg" c="dark.8">Q&amp;A Live</Text>
            </div>

            {/* Content placeholder */}
            <div className="flex h-full items-center justify-center">
                <Text c="gray.4" size="sm">Q&amp;A Page</Text>
            </div>
        </Box>
    );
}
