// ─────────────────────────────────────────────
// comps/linkLianApp/class/FilterSemester.tsx
// Dropdown เลือก semester
// id convention: fs-{element}
// ─────────────────────────────────────────────

import React from 'react';
import { Badge, Button, Loader, Menu } from '@mantine/core';
import { SemesterOption } from '@/utils/interface/class.types';

interface FilterSemesterProps {
    semesters: SemesterOption[];
    activeSemesterId: number | null;
    onChange: (semesterId: number) => void;
    isLoading?: boolean;
}

export default function FilterSemester({
    semesters,
    activeSemesterId,
    onChange,
    isLoading = false,
}: FilterSemesterProps) {
    const active = semesters.find((s) => s.semester_id === activeSemesterId);

    return (
        <Menu withinPortal position="bottom-end" shadow="md" radius="lg" width={220}>
            <Menu.Target>
                <Button
                    id="fs-trigger"
                    disabled={isLoading}
                    variant="light"
                    color="orange"
                    radius="lg"
                    leftSection={isLoading ? <Loader id="fs-spinner" size={14} color="orange" /> : undefined}
                >
                    <span id="fs-label">
                        {activeSemesterId && active ? `ภาคเรียน ${active.semester}` : 'เลือกภาคเรียน'}
                    </span>
                </Button>
            </Menu.Target>

            <Menu.Dropdown id="fs-dropdown">
                {semesters.map((s) => {
                    const isActive = s.semester_id === activeSemesterId;
                    return (
                        <Menu.Item
                            key={s.semester_id}
                            id={`fs-option-${s.semester_id}`}
                            onClick={() => onChange(s.semester_id)}
                            rightSection={
                                s.status === 'open' ? (
                                    <Badge id={`fs-option-open-badge-${s.semester_id}`} color="green" variant="light" radius="lg">
                                        เปิด
                                    </Badge>
                                ) : undefined
                            }
                            fw={isActive ? 700 : 500}
                            c={isActive ? 'orange.8' : 'dark.6'}
                        >
                            <span id={`fs-option-label-${s.semester_id}`}>ภาคเรียน {s.semester}</span>
                        </Menu.Item>
                    );
                })}
            </Menu.Dropdown>
        </Menu>
    );
}
