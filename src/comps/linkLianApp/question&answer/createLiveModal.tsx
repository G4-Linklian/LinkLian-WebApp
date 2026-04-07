import React from 'react'
import { Alert, Button, Modal, Select, Text, TextInput } from '@mantine/core'

interface CreateLiveModalProps {
  opened: boolean
  onClose: () => void
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  liveName: string
  selectedPostId: string | null
  selectedAttachmentId: string | null
  postOptions: { value: string; label: string }[]
  attachmentOptions: { value: string; label: string }[]
  onLiveNameChange: (value: string) => void
  onPostChange: (value: string | null) => void
  onAttachmentChange: (value: string | null) => void
  onStartLive: () => void
  zIndex?: number
}

export default function CreateLiveModal({
  opened,
  onClose,
  isLoading,
  isSubmitting,
  error,
  liveName,
  selectedPostId,
  selectedAttachmentId,
  postOptions,
  attachmentOptions,
  onLiveNameChange,
  onPostChange,
  onAttachmentChange,
  onStartLive,
  zIndex,
}: CreateLiveModalProps) {
  const dropdownZIndex = (zIndex ?? 11000) + 10

  const canStart =
    !isLoading &&
    !isSubmitting &&
    liveName.trim().length > 0 &&
    !!selectedPostId &&
    !!selectedAttachmentId

  return (
    <Modal
      id="cd-create-live-modal"
      opened={opened}
      onClose={onClose}
      centered
      size="sm"
      radius={16}
      padding="lg"
      zIndex={zIndex}
      styles={{
        content: { overflow: 'visible' },
        body: { overflow: 'visible' },
      }}
    >
      <h1 className="color-black mb-1 text-center text-2xl font-bold">สร้างไลฟ์</h1>
      <Text c="dimmed" size="sm" ta="center" mb="md">
        ตั้งชื่อไลฟ์และเลือกโพสต์พร้อมไฟล์ก่อนเริ่ม
      </Text>

      <div className="space-y-4">
        <TextInput
          id="cd-live-name-input"
          label="ชื่อไลฟ์"
          placeholder="เช่น Q&A บทที่ 2"
          value={liveName}
          onChange={(e) => onLiveNameChange(e.currentTarget.value)}
          required
        />

        <Select
          id="cd-live-post-select"
          label="เลือกโพสต์"
          placeholder={isLoading ? 'กำลังโหลดโพสต์...' : 'เลือกโพสต์ที่จะใช้ไลฟ์'}
          data={postOptions}
          value={selectedPostId}
          onChange={onPostChange}
          disabled={isLoading || postOptions.length === 0}
          searchable
          nothingFoundMessage="ไม่พบโพสต์"
          comboboxProps={{ withinPortal: false, zIndex: dropdownZIndex }}
          required
        />

        <Select
          id="cd-live-file-select"
          label="เลือกไฟล์"
          placeholder={isLoading ? 'กำลังโหลดไฟล์...' : 'เลือกไฟล์ที่จะนำเสนอ'}
          data={attachmentOptions}
          value={selectedAttachmentId}
          onChange={onAttachmentChange}
          disabled={isLoading || !selectedPostId || attachmentOptions.length === 0}
          searchable
          nothingFoundMessage="ไม่พบไฟล์"
          comboboxProps={{ withinPortal: false, zIndex: dropdownZIndex }}
          required
        />

        {!isLoading && postOptions.length === 0 && (
          <Alert color="yellow" variant="light">
            ยังไม่มีโพสต์หรือไฟล์สำหรับเริ่มไลฟ์ในห้องเรียนนี้
          </Alert>
        )}

        {error && (
          <Alert color="red" variant="light">
            {error}
          </Alert>
        )}

        <div className="mt-2 flex items-center justify-end gap-2">
          <Button variant="default" radius="xl" onClick={onClose} disabled={isSubmitting}>
            ยกเลิก
          </Button>
          <Button
            id="cd-start-live-btn"
            color="red"
            radius="xl"
            onClick={onStartLive}
            loading={isSubmitting}
            disabled={!canStart}
          >
            เริ่มไลฟ์
          </Button>
        </div>
      </div>
    </Modal>
  )
}
