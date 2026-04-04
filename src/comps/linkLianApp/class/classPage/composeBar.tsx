// ─────────────────────────────────────────────
// comps/linkLianApp/class/ComposerBar.tsx
// Composer bar สำหรับเปิดสร้างโพสต์
// id convention: cb-{element}
// ─────────────────────────────────────────────

import React from 'react';
import { Button } from '@mantine/core';
import { ClassFeedItem } from '@/utils/interface/class.types';

interface ComposerBarProps {
    classList: ClassFeedItem[];
    onOpenCreate: () => void;
}

export default function ComposerBar({ classList, onOpenCreate }: ComposerBarProps) {
    return (
        <Button
            id="cb-post-input"
            onClick={onOpenCreate}
            disabled={classList.length === 0}
            variant="light"
            color="orange"
            radius="xl"
            justify="flex-start"
            fullWidth
        >
            {classList.length === 0 ? 'ไม่มีห้องเรียน' : 'พิมพ์เพื่อเริ่มสร้างโพสต์...'}
        </Button>
    );
}
