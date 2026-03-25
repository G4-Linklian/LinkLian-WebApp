import { getRegistrationToken, getTeacherToken } from "@/utils/authToken"

const trimSlash = (value: string): string => value.replace(/\/+$/, "");

// สร้าง URL สำหรับ download attachment ของ post
export const buildPostAttachmentDownloadUrl = (fileUrl: string, fileName: string): string => {
    const runtimeOrigin = typeof window !== "undefined" ? window.location.origin : "";
    const baseUrl = trimSlash(process.env.NEXT_PUBLIC_BASE_URL || runtimeOrigin);
    const basePath = trimSlash(process.env.NEXT_PUBLIC_BASE_PATH || "");
    if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_BASE_URL is not configured");
    }
    return `${baseUrl}${basePath}/social-feed/post/attachment/download?url=${encodeURIComponent(fileUrl)}&filename=${encodeURIComponent(fileName)}`;
};

const triggerBlobDownload = (blob: Blob, fileName: string): void => {
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = fileName;
    link.rel = "noopener noreferrer";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
};

// ดาวน์โหลด attachment ของ post
export const triggerPostAttachmentDownload = async (fileUrl: string, fileName: string): Promise<void> => {
    const endpoint = buildPostAttachmentDownloadUrl(fileUrl, fileName);
    const token = getRegistrationToken() || getTeacherToken();
    if (!token) {
        throw new Error("Missing token");
    }

    const res = await fetch(endpoint, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new Error(`Download failed: ${res.status}`);
    }

    const blob = await res.blob();
    triggerBlobDownload(blob, fileName);
};

// ดึง attachment ของ post เป็น Blob (สำหรับ preview)
export const fetchPostAttachmentBlob = async (fileUrl: string, fileName: string): Promise<Blob | null> => {
    const endpoint = buildPostAttachmentDownloadUrl(fileUrl, fileName);
    const token = getRegistrationToken() || getTeacherToken();
    if (!token) {
        return null;
    }

    try {
        const res = await fetch(endpoint, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            console.warn("[download] preview proxy failed", res.status, fileUrl);
            return null;
        }

        return res.blob();
    } catch (error) {
        console.warn("[download] preview request failed", error);
        return null;
    }
};
