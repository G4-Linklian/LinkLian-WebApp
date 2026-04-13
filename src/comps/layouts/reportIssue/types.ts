export type SelectedReportFile = {
  id: string;
  file: File;
  previewUrl: string;
};

export type ReportFilePreview = {
  url: string;
  type: string;
  original_name: string;
};

export type UploadedFileResult = {
  originalName?: string;
  fileType?: string;
  fileName?: string;
  fileUrl?: string;
};

export type ShowNotificationFn = (
  title: string,
  message: string,
  response: "success" | "error"
) => void;

export type ReportIssueModalProps = {
  opened: boolean;
  onClose: () => void;
  reportTitle: string;
  onChangeTitle: (value: string) => void;
  reportDetail: string;
  onChangeDetail: (value: string) => void;
  reportFiles: SelectedReportFile[];
  onSelectFiles: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (fileId: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
};
