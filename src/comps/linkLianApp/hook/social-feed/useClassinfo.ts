import { useState, useEffect } from "react";
import { getClassInfo } from "@/utils/api/social-feed/class-info";
import { ClassInfoData } from "@/utils/interface/class.types";

interface UseClassInfoReturn {
  classInfo: ClassInfoData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useClassInfo = (sectionId: number | null): UseClassInfoReturn => {
  const [classInfo, setClassInfo] = useState<ClassInfoData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!sectionId) {
      setClassInfo(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const classInfoData = await getClassInfo(sectionId);

      if (classInfoData.success) {
        setClassInfo(classInfoData.data);
      } else {
        setClassInfo(null);
        setError("ไม่สามารถโหลดข้อมูลห้องเรียนได้");
      }
    } catch (err) {
      console.error("Failed to fetch class info:", err);
      setClassInfo(null);
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [sectionId]);

  return {
    classInfo,
    isLoading,
    error,
    refetch: fetchData,
  };
};
