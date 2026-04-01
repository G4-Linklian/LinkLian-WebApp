import { useState, useEffect, useCallback } from "react";
import { getTeacherClassFeed } from "@/utils/api/social-feed/feed";
import { fetchDataApi } from "@/utils/callAPI";
import { ClassFeedItem, SemesterOption } from "@/utils/interface/class.types";
import { decodeRegistrationToken, decodeTeacherToken, decodeToken } from "@/utils/authToken";

interface UseClassFeedReturn {
  classList: ClassFeedItem[];
  semesters: SemesterOption[];
  activeSemesterId: number | null;
  setActiveSemesterId: (id: number) => void;
  isLoading: boolean;
  isLoadingMore: boolean;
  isSemesterLoading: boolean;
  error: string | null;
  semesterError: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => Promise<void>;
}

const LIMIT = 10;

const parseTokenNumber = (value: unknown): number | null => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const getTokenCandidates = () => [
  decodeTeacherToken(),
  decodeRegistrationToken(),
  decodeToken(),
].filter(Boolean);

const getSocialFeedUserId = (): number | null => {
  try {
    const tokens = getTokenCandidates();

    for (const token of tokens) {
      const userId = parseTokenNumber((token as any)?.user_sys_id);
      if (userId) return userId;

      const fallbackId = parseTokenNumber((token as any)?.user_id);
      if (fallbackId) return fallbackId;
    }

    return null;
  } catch {
    return null;
  }
};

const getInstitutionId = (): number | null => {
  try {
    const tokens = getTokenCandidates();

    for (const token of tokens) {
      const instId = parseTokenNumber((token as any)?.inst_id);
      if (instId) return instId;

      const nestedInstId = parseTokenNumber((token as any)?.institution?.inst_id);
      if (nestedInstId) return nestedInstId;
    }

    return null;
  } catch {
    return null;
  }
};

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toArray = <T>(value: unknown): T[] => {
  return Array.isArray(value) ? (value as T[]) : [];
};

const toTimeString = (value: unknown): string => {
  if (typeof value !== "string") return "";
  return value;
};

const normalizeSchedule = (raw: any) => {
  const day = toNumber(raw?.day_of_week ?? raw?.dayOfWeek ?? raw?.day ?? raw?.weekday, -1);
  const start = toTimeString(raw?.start_time ?? raw?.startTime ?? raw?.time_start);
  const end = toTimeString(raw?.end_time ?? raw?.endTime ?? raw?.time_end);

  if (day < 0 || day > 6 || !start || !end) return null;

  return {
    day_of_week: day,
    start_time: start,
    end_time: end,
    room: raw?.room ?? {
      room_location_id: toNumber(raw?.room_location_id, 0),
      room_number: raw?.room_number ?? raw?.roomNo ?? "",
      floor: toNumber(raw?.floor, 0),
      room_remark: raw?.room_remark ?? "",
    },
    building: raw?.building ?? {
      building_id: toNumber(raw?.building_id, 0),
      building_name: raw?.building_name ?? "",
      building_no: raw?.building_no ?? "",
    },
  };
};

const collectScheduleCandidates = (item: any): any[] => {
  const direct = [
    ...toArray<any>(item?.schedules),
    ...toArray<any>(item?.schedule),
    ...toArray<any>(item?.schedule_list),
    ...toArray<any>(item?.section_schedule),
    ...toArray<any>(item?.section_schedules),
  ]

  const nestedArrays = Object.values(item ?? {})
    .filter((value) => Array.isArray(value))
    .flatMap((value) => value as any[])
    .filter(
      (entry) =>
        entry &&
        typeof entry === "object" &&
        (entry.day_of_week !== undefined || entry.dayOfWeek !== undefined) &&
        (entry.start_time !== undefined || entry.startTime !== undefined || entry.time_start !== undefined),
    );

  return [...direct, ...nestedArrays, item];
};

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const normalizeClassItem = (item: any): ClassFeedItem | null => {
  const sectionId = toNumber(
    item?.section_id ?? item?.sectionId ?? item?.id ?? item?.class_id ?? item?.classId ?? item?.section?.section_id,
    0,
  );

  if (!sectionId) return null;

  const scheduleCandidates = collectScheduleCandidates(item);
  const normalizedSchedules = scheduleCandidates
    .map(normalizeSchedule)
    .filter((s): s is NonNullable<ReturnType<typeof normalizeSchedule>> => s !== null);

  return {
    section_id: sectionId,
    section_name: item?.section_name ?? item?.sectionName ?? item?.class_name ?? item?.className ?? item?.section?.section_name ?? "",
    subject_code: item?.subject_code ?? item?.subjectCode ?? item?.subject?.subject_code_en ?? item?.subject?.subject_code ?? "",
    subject_name_th: item?.subject_name_th ?? item?.subjectNameTh ?? item?.subject_name ?? item?.subjectName ?? item?.subject?.subject_name_th ?? "",
    subject_name_en: item?.subject_name_en ?? item?.subjectNameEn ?? item?.subject?.subject_name ?? item?.subject?.subject_name_en ?? "",
    learning_area_name: item?.learning_area_name ?? item?.learningAreaName ?? item?.learning_area?.learning_area_name ?? item?.learning_area?.name ?? null,
    semester: item?.semester ?? item?.semester_name ?? item?.semesterName ?? item?.semester?.semester ?? "",
    student_count: toNumber(item?.student_count ?? item?.studentCount ?? item?.students_count ?? item?.count_student, 0),
    display_class_name: item?.display_class_name ?? item?.displayClassName ?? item?.section_name ?? item?.class_name ?? item?.subject_name_th ?? "",
    schedules: normalizedSchedules,
    position: item?.position,
  };
};

const hasClassLikeShape = (items: unknown[]): boolean => {
  return items.some((item) => {
    if (!isObject(item)) return false;

    const maybeItem = item as Record<string, unknown>;
    const hasSection =
      maybeItem.section_id !== undefined ||
      maybeItem.sectionId !== undefined ||
      maybeItem.class_id !== undefined ||
      maybeItem.classId !== undefined;
    const hasSubject =
      maybeItem.subject_name_th !== undefined ||
      maybeItem.subjectNameTh !== undefined ||
      maybeItem.subject_name !== undefined ||
      isObject(maybeItem.subject);

    return hasSection || hasSubject;
  });
};

const collectObjectArrays = (source: unknown, depth = 0, visited: Set<unknown> = new Set()): unknown[][] => {
  if (depth > 5 || source == null || visited.has(source)) return [];
  visited.add(source);

  if (Array.isArray(source)) {
    const nested = source.flatMap((item) => collectObjectArrays(item, depth + 1, visited));
    return [source, ...nested];
  }

  if (!isObject(source)) return [];

  return Object.values(source).flatMap((value) => collectObjectArrays(value, depth + 1, visited));
};

const extractFeedItems = (res: any): ClassFeedItem[] => {
  const candidates = [
    res?.data,
    res?.data?.data,
    res?.data?.items,
    res?.data?.rows,
    res?.data?.classes,
    res?.data?.sections,
    res?.items,
    res?.rows,
    res?.classes,
    res?.sections,
    res?.result?.data,
    res?.result?.items,
    res?.result?.rows,
    res?.result?.classes,
    res?.result?.sections,
  ];

  const directList = candidates.find((value) => Array.isArray(value));
  if (directList) {
    return toArray<any>(directList)
      .map(normalizeClassItem)
      .filter((item): item is ClassFeedItem => item !== null);
  }

  const recursiveLists = collectObjectArrays(res).filter((list) => list.length > 0 && hasClassLikeShape(list));
  const rawList = recursiveLists[0] ?? [];

  return toArray<any>(rawList)
    .map(normalizeClassItem)
    .filter((item): item is ClassFeedItem => item !== null);
};

const dedupeBySectionId = (items: ClassFeedItem[]): ClassFeedItem[] => {
  const map = new Map<number, ClassFeedItem>();

  items.forEach((item) => {
    const existing = map.get(item.section_id);
    if (!existing) {
      map.set(item.section_id, item);
      return;
    }

    const mergedSchedule = [...existing.schedules, ...item.schedules];
    const uniqueSchedule = mergedSchedule.filter((s, idx, arr) => {
      return (
        arr.findIndex(
          (x) =>
            x.day_of_week === s.day_of_week &&
            x.start_time === s.start_time &&
            x.end_time === s.end_time &&
            (x.room?.room_number ?? "") === (s.room?.room_number ?? ""),
        ) === idx
      );
    });

    map.set(item.section_id, {
      ...existing,
      schedules: uniqueSchedule,
      section_name: existing.section_name || item.section_name,
      subject_code: existing.subject_code || item.subject_code,
      subject_name_th: existing.subject_name_th || item.subject_name_th,
      subject_name_en: existing.subject_name_en || item.subject_name_en,
      display_class_name: existing.display_class_name || item.display_class_name,
    });
  });

  return Array.from(map.values());
};

const extractTotal = (res: any): number | null => {
  const candidates = [res?.total, res?.data?.total, res?.data?.pagination?.total, res?.pagination?.total, res?.meta?.total];

  for (const candidate of candidates) {
    const parsed = Number(candidate);
    if (Number.isFinite(parsed) && parsed >= 0) return parsed;
  }

  return null;
};

const toSemesterList = (input: unknown): SemesterOption[] => {
  if (!Array.isArray(input)) return [];

  return input
    .map((item: any) => ({
      semester_id: Number(item?.semester_id),
      semester: String(item?.semester ?? ""),
      status: (item?.status === "open" ? "open" : "close") as "open" | "close",
    }))
    .filter((item) => Number.isFinite(item.semester_id) && item.semester_id > 0 && item.semester);
};

export const useClassFeed = (): UseClassFeedReturn => {
  const [classList, setClassList] = useState<ClassFeedItem[]>([]);
  const [semesters, setSemesters] = useState<SemesterOption[]>([]);
  const [activeSemesterId, setActiveSemesterId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [isSemesterLoading, setIsSemesterLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [semesterError, setSemesterError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [offset, setOffset] = useState<number>(0);

  const fetchSemesters = useCallback(async () => {
    setIsSemesterLoading(true);
    setSemesterError(null);

    try {
      const instId = getInstitutionId();
      if (!instId) {
        setSemesterError("ไม่พบข้อมูลสถานศึกษา กรุณาเข้าสู่ระบบใหม่");
        setSemesters([]);
        setActiveSemesterId(null);
        return;
      }

      const res = await fetchDataApi("GET", "semester", {
        flag_valid: true,
        inst_id: instId,
      });

      const list = toSemesterList(res?.data);
      setSemesters(list);

      const openSem = list.find((semester) => semester.status === "open");
      const defaultSem = openSem ?? list[0];
      setActiveSemesterId(defaultSem?.semester_id ?? null);
    } catch (err) {
      console.error("Failed to fetch semesters:", err);
      setSemesterError("ไม่สามารถโหลดภาคเรียนได้");
      setSemesters([]);
      setActiveSemesterId(null);
    } finally {
      setIsSemesterLoading(false);
    }
  }, []);

  const fetchFeed = useCallback(
    async (opts: { reset?: boolean; semId?: number } = {}) => {
      const userId = getSocialFeedUserId();
      const targetSemId = opts.semId ?? activeSemesterId;

      if (!targetSemId) {
        setClassList([]);
        setHasMore(false);
        setIsLoading(false);
        setIsLoadingMore(false);
        return;
      }

      if (!userId) {
        setError("ไม่พบข้อมูลผู้สอน กรุณาเข้าสู่ระบบใหม่");
        setIsLoading(false);
        setIsLoadingMore(false);
        return;
      }

      const currentOffset = opts.reset ? 0 : offset;
      const isFirstLoad = opts.reset || currentOffset === 0;

      if (isFirstLoad) setIsLoading(true);
      else setIsLoadingMore(true);

      setError(null);

      try {
        const res = await getTeacherClassFeed({
          user_id: userId,
          semester_id: targetSemId,
          limit: LIMIT,
          offset: currentOffset,
        });

        if ((res as any)?.success === false) {
          setError((res as any)?.message ?? "ไม่สามารถโหลดข้อมูลห้องเรียนได้");
          setClassList([]);
          setHasMore(false);
          return;
        }

        const newItems = extractFeedItems(res);
        const total = extractTotal(res);

        setClassList((prev) =>
          isFirstLoad ? dedupeBySectionId(newItems) : dedupeBySectionId([...prev, ...newItems]),
        );
        setOffset(currentOffset + newItems.length);

        if (total !== null) {
          setHasMore(currentOffset + newItems.length < total);
        } else {
          setHasMore(newItems.length === LIMIT);
        }
      } catch (err) {
        console.error("Failed to fetch class feed:", err);
        setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
        setClassList([]);
        setHasMore(false);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [activeSemesterId, offset],
  );

  useEffect(() => {
    fetchSemesters();
  }, [fetchSemesters]);

  useEffect(() => {
    if (!activeSemesterId) {
      setClassList([]);
      setOffset(0);
      setHasMore(false);
      return;
    }

    setOffset(0);
    setClassList([]);
    fetchFeed({ reset: true, semId: activeSemesterId });
  }, [activeSemesterId]);

  const loadMore = () => {
    if (!isLoadingMore && hasMore) fetchFeed();
  };

  const refresh = async () => {
    if (semesters.length === 0) {
      await fetchSemesters();
    }

    setOffset(0);
    await fetchFeed({ reset: true });
  };

  return {
    classList,
    semesters,
    activeSemesterId,
    setActiveSemesterId,
    isLoading,
    isLoadingMore,
    isSemesterLoading,
    error,
    semesterError,
    hasMore,
    loadMore,
    refresh,
  };
};
