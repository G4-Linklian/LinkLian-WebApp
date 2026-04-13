import { ActionIcon, Button, Group, Modal, Text, TextInput, Textarea } from "@mantine/core";
import { IconPhotoPlus, IconTrash } from "@tabler/icons-react";
import { ReportIssueModalProps } from "./types";

export default function ReportIssueModal({
  opened,
  onClose,
  reportTitle,
  onChangeTitle,
  reportDetail,
  onChangeDetail,
  reportFiles,
  onSelectFiles,
  onRemoveFile,
  onSubmit,
  isSubmitting,
}: ReportIssueModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="lg"
      radius={16}
    >
      <h1 className="text-black font-bold text-2xl mb-4 text-center">
        แจ้งปัญหา
      </h1>
      <div className="space-y-4">
        <TextInput
          label="หัวข้อ"
          placeholder="ระบุหัวข้อปัญหา"
          value={reportTitle}
          onChange={(event) => onChangeTitle(event.currentTarget.value)}
          radius={8}
          required
        />

        <Textarea
          label="รายละเอียด"
          placeholder="อธิบายปัญหาที่พบ"
          value={reportDetail}
          onChange={(event) => onChangeDetail(event.currentTarget.value)}
          minRows={4}
          radius={8}
          required
        />

        <div>
          <Text size="sm" fw={500} mb={8}>ไฟล์แนบ</Text>

          <input
            id="report-image-upload"
            type="file"
            multiple
            accept="image/*"
            onChange={onSelectFiles}
            className="hidden"
          />

          <label htmlFor="report-image-upload" className="block cursor-pointer">
            <div className="rounded-xl border-2 border-dashed border-orange-200 bg-orange-50/60 p-4 hover:bg-orange-50 transition-colors">
              <Group justify="space-between" align="center">
                <div>
                  <Text fw={600} size="sm" c="orange.8">อัปโหลดรูปภาพ</Text>
                  <Text size="xs" c="dimmed">รองรับ JPG, PNG, WEBP และไฟล์รูปภาพอื่นๆ</Text>
                </div>
                <Button
                  component="span"
                  variant="light"
                  color="orange"
                  radius={8}
                  leftSection={<IconPhotoPlus size={16} />}
                >
                  เลือกรูป
                </Button>
              </Group>
            </div>
          </label>

          {reportFiles.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
              {reportFiles.map((item) => (
                <div key={item.id} className="relative overflow-hidden rounded-lg border border-gray-200 bg-white">
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="h-28 w-full object-cover"
                  />
                  <div className="flex items-center justify-between bg-white/80 bottom-0 left-0 right-0 px-2 py-1">
                    <div className="px-2 py-1">
                      <Text size="xs" className="truncate">{item.file.name}</Text>
                    </div>
                    <ActionIcon
                      variant="filled"
                      color="red"
                      size="sm"
                      onClick={() => onRemoveFile(item.id)}
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose} disabled={isSubmitting} radius={8}>
            ยกเลิก
          </Button>
          <Button onClick={onSubmit} loading={isSubmitting} radius={8}>
            ส่งรายงาน
          </Button>
        </Group>
      </div>
    </Modal>
  );
}
