// src/config/formatters.ts

export type Formatter<T> = (value: T | undefined | null) => string;

export type DateInput = Date | string | null | undefined;

export const formatDate = (value: DateInput): string => {
  if (!value) return "-";

  const date =
    value instanceof Date ? value : new Date(value);

  if (isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (value: DateInput): string => {
  if (!value) return "-";

  const date =
    value instanceof Date ? value : new Date(value);

  if (isNaN(date.getTime())) return "-";

  return date.toLocaleString("th-TH");
};

export const formatText: Formatter<string> = (value) => {
  return value ?? "-";
};

export const formatDateOnly = (date?: Date) => {
  return date ? date.toISOString().split("T")[0] : undefined;
};

export const normalizeDate = (value?: Date | string) => {
  if (!value) return undefined;

  if (typeof value === "string") {
    return value; // already YYYY-MM-DD
  }

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const dayOfWeekFormatter: Formatter<number> = (value) => {
  const days: { [key: number]: string } = {
    0: "-",
    1: "วันจันทร์",
    2: "วันอังคาร",
    3: "วันพุธ",
    4: "วันพฤหัสบดี",
    5: "วันศุกร์",
    6: "วันเสาร์",
    7: "วันอาทิตย์",
  };

  if (value && days[value]) {
    return days[value];
  }
  return "-";
};

export const timeFormatter: Formatter<string> = (value) => {
  if (!value) return "-";

  // Assuming value is in "HH:mm:ss" format
  const [hour, minute, second] = value.split(":");
  return `${hour}:${minute}`;
};


export const normalizeTime = (time?: string | Date) => {
  if (!time) return undefined;

  // กรณีเป็น Date
  if (time instanceof Date) {
    const hh = time.getHours().toString().padStart(2, '0');
    const mm = time.getMinutes().toString().padStart(2, '0');
    const ss = time.getSeconds().toString().padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }

  // กรณีเป็น string
  if (/^\d{2}:\d{2}$/.test(time)) {
    return `${time}:00`;
  }

  if (/^\d{2}:\d{2}:\d{2}$/.test(time)) {
    return time;
  }

  return undefined;
};

