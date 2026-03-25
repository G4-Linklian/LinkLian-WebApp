// ─────────────────────────────────────────────
// comps/linkLianApp/class/FilterPost.tsx
// Pill dropdown กรอง post type
// id convention: fp-{element}
// ─────────────────────────────────────────────

import React from 'react';
import { Button, Menu } from '@mantine/core';
import { IconFilter } from '@tabler/icons-react';
import { PostType } from '@/utils/interface/class.types';
import { POST_TYPE_LABEL } from '@/utils/function/classHelper';
import { AppColors } from '@/constants/colors';

export type FilterPostOption = PostType | 'all';

interface FilterPostProps {
  value: FilterPostOption;
  onChange: (value: FilterPostOption) => void;
}

const OPTIONS: { value: FilterPostOption; label: string; color: string }[] = [
  { value: 'all',          label: 'ทั้งหมด',                      color: 'text-gray-700'  },
  { value: 'announcement', label: POST_TYPE_LABEL.announcement,   color: 'text-amber-700' },
  { value: 'assignment',   label: POST_TYPE_LABEL.assignment,     color: 'text-blue-700'  },
  { value: 'question',     label: POST_TYPE_LABEL.question,       color: 'text-green-700' },
];

export default function FilterPost({ value, onChange }: FilterPostProps) {
  const active = OPTIONS.find((o) => o.value === value) ?? OPTIONS[0];

  return (
    <Menu
      withinPortal
      shadow="md"
      radius="lg"
      width={180}
      position="bottom-end"
      offset={8}
      styles={{
        dropdown: {
          transformOrigin: 'top right',
        },
      }}
    >
      <Menu.Target>
        <Button
          id="fp-trigger"
          variant="subtle"
          radius="lg"
          leftSection={<IconFilter size={16} stroke={2.2} />}
          className="inline-flex shrink-0"
          styles={{
            root: {
              backgroundColor: AppColors.primaryPalette[200],
              color: AppColors.primaryPalette[800],
              border: `1px solid ${AppColors.primaryPalette[300]}`,
            },
            section: {
              color: AppColors.primaryPalette[700],
            },
            label: {
              fontSize: '0.875rem',
              fontWeight: 600,
            },
          }}
        >
          <span id="fp-label">{active.label}</span>
        </Button>
      </Menu.Target>
      <Menu.Dropdown
        id="fp-dropdown"
        className="overflow-hidden rounded-2xl"
        style={{
          borderColor: AppColors.primaryPalette[200],
          marginLeft: 'auto',
        }}
      >
        {OPTIONS.map((opt) => {
          const isSelected = opt.value === value;
          return (
            <Menu.Item
              key={opt.value}
              id={`fp-option-${opt.value}`}
              onClick={() => onChange(opt.value)}
              fw={isSelected ? 700 : 500}
              c={isSelected ? 'orange.8' : undefined}
              className="text-sm"
              styles={{
                item: {
                  borderRadius: 12,
                },
              }}
            >
              <span id={`fp-option-label-${opt.value}`}>{opt.label}</span>
            </Menu.Item>
          );
        })}
      </Menu.Dropdown>
    </Menu>
  );
}
