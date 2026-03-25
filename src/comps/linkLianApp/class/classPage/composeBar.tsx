// ─────────────────────────────────────────────
// comps/linkLianApp/class/ComposerBar.tsx
// Composer bar สำหรับเลือกคลาสและเปิดสร้างโพสต์
// id convention: cb-{element}
// ─────────────────────────────────────────────

import React from 'react';
import { Button, Checkbox, Popover, ScrollArea, Text } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import { ClassFeedItem } from '@/utils/interface/class.types';

interface ComposerBarProps {
    classList: ClassFeedItem[];
    postTarget: number[];
    onTargetChange: (target: number[]) => void;
    onOpenCreate: () => void;
}

export default function ComposerBar({
    classList,
    postTarget,
    onTargetChange,
    onOpenCreate,
}: ComposerBarProps) {
    const allClassIds = classList.map((item) => item.section_id);
    const isAllSelected = classList.length > 0 && postTarget.length === classList.length;
    const [opened, setOpened] = React.useState(false);

    const summaryLabel = (() => {
        if (postTarget.length === 0) return 'เลือกห้องเรียน';
        if (isAllSelected) return 'เลือกทั้งหมด';
        if (postTarget.length === 1) {
            const current = classList.find((item) => item.section_id === postTarget[0]);
            return current ? `${current.subject_name_th} • ${current.display_class_name}` : 'เลือกห้องเรียน';
        }
        return `${postTarget.length} ห้องเรียน`;
    })();

    const postTargetLabel = (() => {
        if (postTarget.length === 0) return 'เลือกคลาสก่อนเริ่มสร้างโพสต์';
        if (isAllSelected) return 'พิมพ์เพื่อเริ่มสร้างโพสต์ในทุกห้องเรียน...';
        if (postTarget.length === 1) {
            const current = classList.find((item) => item.section_id === postTarget[0]);
            return current ? `พิมพ์เพื่อเริ่มสร้างโพสต์ใน ${current.subject_name_th}...` : 'พิมพ์เพื่อเริ่มสร้างโพสต์ในห้องเรียนนี้...';
        }
        return `พิมพ์เพื่อเริ่มสร้างโพสต์ใน ${postTarget.length} ห้องเรียน...`;
    })();

    return (
        <div id="cb-wrapper" className="mb-4">
            <div className="flex flex-col items-center gap-3 md:flex-row md:justify-center md:gap-4">
                <div className="w-full md:w-auto md:max-w-[420px] md:flex-none">
                    <Popover opened={opened} onChange={setOpened} position="bottom-start" width={320} shadow="md" radius="lg">
                        <Popover.Target>
                            <Button
                                id="cb-class-select-trigger"
                                variant="default"
                                color="gray"
                                radius="xl"
                                justify="space-between"
                                onClick={() => setOpened((value) => !value)}
                                className="w-full border-gray-200 bg-white text-left text-gray-700 md:inline-flex md:min-w-[180px] md:max-w-[420px]"
                                rightSection={<IconChevronDown size={16} stroke={1.8} />}
                            >
                                <span className="truncate">{summaryLabel}</span>
                            </Button>
                        </Popover.Target>

                        <Popover.Dropdown p="xs">
                            <div className="mb-2 flex items-center justify-between gap-2 px-1">
                                <Text size="xs" fw={600} c="dimmed">เลือกห้องเรียน</Text>
                                <button
                                    type="button"
                                    onClick={() => onTargetChange(isAllSelected ? [] : allClassIds)}
                                    className="text-xs font-semibold text-orange-600"
                                >
                                    {isAllSelected ? 'ล้างทั้งหมด' : 'เลือกทั้งหมด'}
                                </button>
                            </div>

                            <ScrollArea.Autosize mah={260} type="hover" offsetScrollbars>
                                <div className="space-y-2 p-1">
                                    {classList.map((item) => {
                                        const checked = postTarget.includes(item.section_id);

                                        return (
                                            <button
                                                key={item.section_id}
                                                type="button"
                                                onClick={() => {
                                                    onTargetChange(
                                                        checked
                                                            ? postTarget.filter((id) => id !== item.section_id)
                                                            : [...postTarget, item.section_id],
                                                    );
                                                }}
                                                className="flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-orange-50"
                                            >
                                                <Checkbox
                                                    checked={checked}
                                                    onChange={() => undefined}
                                                    color="orange"
                                                    mt={2}
                                                    tabIndex={-1}
                                                    className="pointer-events-none"
                                                />
                                                <div className="min-w-0">
                                                    <Text size="sm" fw={600} c="dark.7" truncate>
                                                        {item.subject_name_th}
                                                    </Text>
                                                    <Text size="xs" c="dimmed" truncate>
                                                        {item.display_class_name}
                                                    </Text>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </ScrollArea.Autosize>
                        </Popover.Dropdown>
                    </Popover>
                </div>

                <div className="flex w-full items-center gap-2 md:w-[50%] md:max-w-[640px] md:flex-none">
                    <Button
                        id="cb-post-input"
                        onClick={onOpenCreate}
                        disabled={postTarget.length === 0}
                        variant="light"
                        color="orange"
                        radius="xl"
                        justify="flex-start"
                        fullWidth
                    >
                        {postTargetLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}
