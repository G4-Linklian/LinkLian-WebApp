// ─────────────────────────────────────────────
// utils/classHelpers.ts
// Helper functions สำหรับ class feature
// ─────────────────────────────────────────────

import { PostType } from '@/utils/interface/class.types';
import { AppColors } from '@/constants/colors';

// ==================== DAY OF WEEK ====================

const DAY_OF_WEEK_MAP: Record<number, string> = {
  0: 'อาทิตย์',
  1: 'จันทร์',
  2: 'อังคาร',
  3: 'พุธ',
  4: 'พฤหัสบดี',
  5: 'ศุกร์',
  6: 'เสาร์',
};

const DAY_OF_WEEK_SHORT_MAP: Record<number, string> = {
  0: 'อา.',
  1: 'จ.',
  2: 'อ.',
  3: 'พ.',
  4: 'พฤ.',
  5: 'ศ.',
  6: 'ส.',
};

export const dayOfWeekToText = (day: number, short = false): string => {
  if (short) return DAY_OF_WEEK_SHORT_MAP[day] ?? '-';
  return DAY_OF_WEEK_MAP[day] ?? '-';
};

// ==================== TIME ====================

/**
 * format time จาก "HH:MM:SS" → "HH:MM"
 */
export const formatTime = (time: string): string => {
  if (!time) return '';
  return time.slice(0, 5);
};

/**
 * format datetime จาก ISO string → "HH:MM • DD/MM/YYYY"
 */
export const formatDateTime = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${hours}:${minutes} • ${day}/${month}/${year}`;
  } catch {
    return '-';
  }
};

/**
 * format due date → "DD/MM/YY HH:MM น."
 */
export const formatDueDate = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = (date.getFullYear() % 100).toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes} น.`;
  } catch {
    return '-';
  }
};

// ==================== POST TYPE ====================

export const POST_TYPE_LABEL: Record<PostType, string> = {
  announcement: 'ประกาศ',
  assignment:   'การบ้าน',
  question:     'คำถาม',
};

/**
 * สีของ tag แต่ละประเภทโพสต์ — ใช้ AppColors เพื่อ consistency
 * คำถาม     → successPalette  (เขียว)
 * ประกาศ    → buttonPalette   (น้ำเงิน)
 * การบ้าน   → primaryPalette  (ส้ม)
 */
export const POST_TYPE_COLOR: Record<PostType, { bg: string; text: string }> = {
  question:     { bg: AppColors.successPalette[100], text: AppColors.successPalette[700] },
  announcement: { bg: AppColors.buttonPalette[100],  text: AppColors.buttonPalette[700]  },
  assignment:   { bg: AppColors.primaryPalette[100], text: AppColors.primaryPalette[700] },
};

// ==================== FILE TYPE ====================

export const isImageType = (fileType: string): boolean => {
  const t = fileType.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(t) || t.includes('image');
};

export const isPdfType = (fileType: string): boolean => {
  const t = fileType.toLowerCase();
  return t === 'pdf' || t.includes('pdf');
};

export const isLinkType = (fileType: string): boolean => {
  const t = fileType.toLowerCase();
  return t === 'link' || t.includes('link');
};

export const getFileIconName = (fileType: string): string => {
  const t = fileType.toLowerCase();
  if (t.includes('pdf')) return 'file-text';
  if (t.includes('image') || isImageType(t)) return 'image';
  if (t.includes('video')) return 'video';
  if (t.includes('word') || t.includes('doc')) return 'file-text';
  if (t.includes('excel') || t.includes('xls')) return 'table';
  if (t.includes('powerpoint') || t.includes('ppt')) return 'presentation';
  if (t.includes('link')) return 'link';
  return 'file';
};

// ==================== ROLE LABEL ====================

export const getRoleLabel = (roleName: string): string => {
  switch (roleName.toLowerCase()) {
    case 'teacher':    return 'ครู';
    case 'instructor': return 'อาจารย์';
    case 'high school student': return 'นักเรียน';
    case 'uni student': return 'นักศึกษา';
    default: return roleName;
  }
};

// ==================== NAME / INITIAL ====================

export const getInitial = (name?: string | null): string => {
  if (!name || name.trim() === '') return '?';
  return name.trim()[0].toUpperCase();
};