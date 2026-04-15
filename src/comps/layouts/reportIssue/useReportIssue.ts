import { useEffect, useRef, useState } from "react";
import { uploadFileStorage } from "@/utils/api/fileStorage";
import { createAdminReport } from "@/utils/api/report";
import {
  ReportFilePreview,
  SelectedReportFile,
  ShowNotificationFn,
  UploadedFileResult,
} from "./types";

type UseReportIssueParams = {
  token: any;
  showNotification: ShowNotificationFn;
};

export const useReportIssue = ({ token, showNotification }: UseReportIssueParams) => {
  const [reportModalOpened, setReportModalOpened] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [reportDetail, setReportDetail] = useState("");
  const [reportFiles, setReportFiles] = useState<SelectedReportFile[]>([]);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const reportFilesRef = useRef<SelectedReportFile[]>([]);

  useEffect(() => {
    reportFilesRef.current = reportFiles;
  }, [reportFiles]);

  useEffect(() => {
    return () => {
      reportFilesRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  const resetReportForm = () => {
    reportFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setReportTitle("");
    setReportDetail("");
    setReportFiles([]);
  };

  const openReportModal = () => {
    setReportModalOpened(true);
  };

  const closeReportModal = () => {
    setReportModalOpened(false);
    resetReportForm();
  };

  const handleSelectReportFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (selectedFiles.length === 0) return;

    const imageFiles = selectedFiles.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length !== selectedFiles.length) {
      showNotification("รองรับเฉพาะรูปภาพ", "กรุณาเลือกไฟล์ประเภทภาพเท่านั้น", "error");
    }

    if (imageFiles.length === 0) {
      event.target.value = "";
      return;
    }

    const newFiles = imageFiles.map((file, index) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${index}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setReportFiles((prev) => [...prev, ...newFiles]);
    event.target.value = "";
  };

  const handleRemoveReportFile = (fileId: string) => {
    setReportFiles((prev) => {
      const target = prev.find((item) => item.id === fileId);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== fileId);
    });
  };

  const handleSubmitReport = async () => {
    if (!reportTitle.trim()) {
      showNotification("ข้อมูลไม่ครบ", "กรุณากรอกหัวข้อปัญหา", "error");
      return;
    }

    if (!reportDetail.trim()) {
      showNotification("ข้อมูลไม่ครบ", "กรุณากรอกรายละเอียดปัญหา", "error");
      return;
    }

    const instId = token?.institution?.inst_id;
    if (!instId) {
      showNotification("ไม่พบสถาบัน", "ไม่สามารถระบุ inst_id จาก token ได้", "error");
      return;
    }

    try {
      setIsSubmittingReport(true);

      const uploadedFiles = await Promise.all(
        reportFiles.map(async ({ file }) => {
          const uploadRes = await uploadFileStorage(file, "admin", "report");

          const uploadedResult: UploadedFileResult | undefined =
            uploadRes?.files?.[0] ||
            uploadRes?.data?.files?.[0] ||
            uploadRes?.result ||
            uploadRes?.data ||
            uploadRes;

          const uploadedFileUrl = uploadedResult?.fileUrl;

          if (!uploadedFileUrl) {
            throw new Error(`ไม่สามารถอัปโหลดไฟล์ ${file.name}`);
          }

          const extensionFromName = file.name.split(".").pop()?.toLowerCase() || "file";
          const extensionFromMime = file.type.split("/").pop()?.toLowerCase() || extensionFromName;

          return {
            url: uploadedFileUrl,
            type: uploadedResult?.fileType || (extensionFromName !== "file" ? extensionFromName : extensionFromMime),
            original_name: uploadedResult?.originalName || file.name,
          };
        })
      );

      const reportFilePayload: ReportFilePreview[] = uploadedFiles;

      const data = await createAdminReport({
        inst_id: instId,
        title: reportTitle.trim(),
        detail: reportDetail.trim(),
        flag_valid: true,
        mark_resolved: false,
        report_file: reportFilePayload.length > 0 ? { files: reportFilePayload } : undefined,
      });

      if (!data || data.success === false || data.error) {
        showNotification("ส่งรายงานไม่สำเร็จ", "เกิดข้อผิดพลาดในการส่งรายงาน", "error");
      } else {
        showNotification("ส่งรายงานสำเร็จ", "ระบบได้รับข้อมูลแจ้งปัญหาแล้ว", "success");
      }

      closeReportModal();
    } catch (error) {
      console.error("Failed to submit report", error);
      showNotification("ส่งรายงานไม่สำเร็จ", "กรุณาลองใหม่อีกครั้ง", "error");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return {
    reportModalOpened,
    reportTitle,
    reportDetail,
    reportFiles,
    isSubmittingReport,
    setReportTitle,
    setReportDetail,
    openReportModal,
    closeReportModal,
    handleSelectReportFiles,
    handleRemoveReportFile,
    handleSubmitReport,
  };
};
