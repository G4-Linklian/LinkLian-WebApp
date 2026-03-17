// ─────────────────────────────────────────────
// hooks/useClassInfo.ts
// Hook สำหรับดึง class info (room, schedules, members, educators)
// ─────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { getClassInfo } from '@/utils/api/social-feed/class-info';
import { ClassInfoData } from '@/utils/interface/class.types';

interface UseClassInfoReturn {
  classInfo: ClassInfoData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useClassInfo = (sectionId: number | null): UseClassInfoReturn => {
  const [classInfo, setClassInfo] = useState<ClassInfoData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClassInfo = async () => {
    if (!sectionId) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await getClassInfo(sectionId);
      if (res.success) {
        setClassInfo(res.data);
      } else {
        setError('ไม่สามารถโหลดข้อมูลห้องเรียนได้');
      }
    } catch (err) {
      console.error('[useClassInfo] fetch error:', err);
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClassInfo();
  }, [sectionId]);

  return {
    classInfo,
    isLoading,
    error,
    refetch: fetchClassInfo,
  };
};