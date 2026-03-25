import React, { useEffect, useState } from 'react';
import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  FileButton,
  Group,
  Loader,
  Modal,
  NumberInput,
  Paper,
  ScrollArea,
  SegmentedControl,
  Stack,
  Switch,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useRouter } from 'next/router';
import { useNotification } from '@/comps/noti/notiComp';
import { useCreatePost } from '@/hooks/social-feed/useCreatepost';
import { uploadFileStorage } from '@/utils/api/fileStorage';
import { getPostById } from '@/utils/api/social-feed/post';
import { PostItem, PostType } from '@/utils/interface/class.types';
import { POST_TYPE_LABEL } from '@/utils/function/classHelper';
import { IconCalendarEvent, IconLink, IconPaperclip, IconPhoto, IconX } from '@tabler/icons-react';

const POST_TYPES: PostType[] = ['announcement', 'assignment'];
const MODAL_Z_INDEX = 11000;

const resolveUploadedFileType = (file: File, uploadedFileUrl?: string): string => {
  const mimeType = (file.type || '').toLowerCase();
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'jpeg';
  if (mimeType.includes('png')) return 'png';
  if (mimeType.includes('gif')) return 'gif';
  if (mimeType.includes('webp')) return 'webp';
  if (mimeType.includes('word')) return 'doc';
  if (mimeType.includes('excel') || mimeType.includes('sheet')) return 'xls';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'ppt';

  const source = `${file.name} ${uploadedFileUrl ?? ''}`.toLowerCase();
  if (source.includes('.pdf')) return 'pdf';
  if (source.includes('.jpeg') || source.includes('.jpg')) return 'jpeg';
  if (source.includes('.png')) return 'png';
  if (source.includes('.gif')) return 'gif';
  if (source.includes('.webp')) return 'webp';
  if (source.includes('.docx')) return 'docx';
  if (source.includes('.doc')) return 'doc';
  if (source.includes('.xlsx')) return 'xlsx';
  if (source.includes('.xls')) return 'xls';
  if (source.includes('.pptx')) return 'pptx';
  if (source.includes('.ppt')) return 'ppt';

  return mimeType || 'file';
};

function PostTypeSelector({ value, onChange }: { value: PostType; onChange: (value: PostType) => void }) {
  return (
    <SegmentedControl
      id="crp-type-selector"
      fullWidth
      radius="md"
      value={value}
      onChange={(nextValue) => onChange(nextValue as PostType)}
      data={POST_TYPES.map((type) => ({
        value: type,
        label: POST_TYPE_LABEL[type],
      }))}
    />
  );
}

export interface CreatePostModalProps {
  opened?: boolean;
  onClose?: () => void;
  sectionId: number;
  sectionIds?: number[];
  subjectName?: string;
  editPostId?: number;
  editPostContentId?: number;
  initialPostType?: PostType;
  allowAnonymous?: boolean;
  onSubmitted?: () => void;
}

const CreatePostModal = ({
  opened = true,
  onClose,
  sectionId,
  sectionIds,
  subjectName,
  editPostId,
  editPostContentId: _editPostContentId,
  initialPostType,
  allowAnonymous = true,
  onSubmitted,
}: CreatePostModalProps) => {
  const router = useRouter();
  const isEditing = !!editPostId;
  const { showNotification } = useNotification();

  const [editingPost, setEditingPost] = useState<PostItem | null>(null);
  const [loadingEditPost, setLoadingEditPost] = useState(false);
  const [editPostError, setEditPostError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [confirmCloseOpened, setConfirmCloseOpened] = useState(false);
  const [linkModalOpened, setLinkModalOpened] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [localBlobUrls, setLocalBlobUrls] = useState<string[]>([]);

  useEffect(() => {
    if (!isEditing || !editPostId || Number.isNaN(editPostId)) return;
    let isMounted = true;

    setLoadingEditPost(true);
    setEditPostError(null);

    getPostById(editPostId)
      .then((res) => {
        if (!isMounted) return;
        if (!res.success || !res.data) {
          setEditPostError('ไม่สามารถโหลดข้อมูลโพสต์สำหรับแก้ไขได้');
          return;
        }
        setEditingPost(res.data);
      })
      .catch(() => {
        if (isMounted) setEditPostError('ไม่สามารถโหลดข้อมูลโพสต์สำหรับแก้ไขได้');
      })
      .finally(() => {
        if (isMounted) setLoadingEditPost(false);
      });

    return () => {
      isMounted = false;
    };
  }, [editPostId, isEditing]);

  useEffect(() => {
    return () => {
      localBlobUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [localBlobUrls]);

  const {
    postType, setPostType,
    title, setTitle,
    content, setContent,
    dueDate, setDueDate,
    maxScore, setMaxScore,
    isGroup, setIsGroup,
    isAnonymous, setIsAnonymous,
    attachments, setAttachments, addAttachment, removeAttachment,
    isLoading, error, hasContent,
    submit, reset,
  } = useCreatePost({
    mode: isEditing ? 'edit' : 'create',
    sectionId,
    sectionIds,
    editingPost,
    initialPostType,
    allowAnonymous,
  });

  const dueDateValue = dueDate
    ? new Date(dueDate.getTime() - dueDate.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
    : null;
  const now = new Date();

  const closeForm = () => {
    if (onClose) {
      onClose();
      return;
    }
    router.back();
  };

  const handleCloseRequest = () => {
    if (hasContent) {
      setConfirmCloseOpened(true);
      return;
    }

    reset();
    closeForm();
  };

  const handleConfirmClose = () => {
    setConfirmCloseOpened(false);
    reset();
    closeForm();
  };

  const handleFilesSelected = (files: File[]) => {
    files.forEach(async (file) => {
      const localUrl = URL.createObjectURL(file);
      setLocalBlobUrls((prev) => [...prev, localUrl]);

      addAttachment({
        file_url: localUrl,
        file_type: file.type,
        original_name: file.name,
        local_file: file,
        preview_url: localUrl,
        is_uploading: true,
      });
      setUploadError(null);

      try {
        const uploadRes = await uploadFileStorage(file, 'social-feed', 'fileattachment');
        const uploadedFileUrl = uploadRes?.files?.[0]?.fileUrl;
        if (!uploadedFileUrl) throw new Error('Failed to upload file');

        setAttachments((prev) =>
          prev.map((attachment) =>
            attachment.preview_url === localUrl
              ? {
                  file_url: uploadedFileUrl,
                  file_type: resolveUploadedFileType(file, uploadedFileUrl),
                  original_name: file.name,
                  preview_url: localUrl,
                }
              : attachment,
          ),
        );
      } catch (uploadErr) {
        console.error('[CreatePostModal] upload attachment failed', uploadErr);
        setUploadError(`อัปโหลดไฟล์ "${file.name}" ไม่สำเร็จ`);
        setAttachments((prev) =>
          prev.map((attachment) =>
            attachment.preview_url === localUrl
              ? { ...attachment, is_uploading: false, upload_error: 'upload_failed' }
              : attachment,
          ),
        );
      }
    });
  };

  const handleAddLink = () => {
    if (!linkUrl.trim()) return;
    addAttachment({
      file_url: linkUrl.trim(),
      file_type: 'link',
      original_name: linkUrl.trim(),
    });
    setLinkUrl('');
    setLinkModalOpened(false);
  };

  const handleSubmit = async () => {
    if (postType === 'assignment') {
      if (!dueDate) {
        showNotification('ยังไม่ได้กำหนดส่งงาน', 'กรุณาเลือกวันและเวลา', 'error');
        return;
      }

      if (dueDate.getHours() === 0 && dueDate.getMinutes() === 0) {
        showNotification('กรุณาตั้งเวลา', 'โปรดเลือกเวลาให้กับวันส่งงานด้วย', 'error');
        return;
      }

      if (dueDate.getTime() < now.getTime()) {
        showNotification('เลือกวันย้อนหลังไม่ได้', 'กรุณาเลือกวันและเวลาที่มากกว่าปัจจุบัน', 'error');
        return;
      }
    }

    const result = await submit();

    if (result.success) {
      showNotification(
        isEditing ? 'บันทึกโพสต์สำเร็จ' : 'โพสต์สำเร็จแล้ว!',
        subjectName ? `โพสต์ใน ${subjectName} เรียบร้อยแล้ว` : '',
        'success',
      );

      onSubmitted?.();
      reset();
      closeForm();
      return;
    }

    showNotification('ดำเนินการไม่สำเร็จ', error ?? 'เกิดข้อผิดพลาด กรุณาลองใหม่', 'error');
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={handleCloseRequest}
        zIndex={MODAL_Z_INDEX}
        withCloseButton={false}
      centered
      padding={0}
      size="min(960px, calc(100vw - 2rem))"
      overlayProps={{ backgroundOpacity: 0.35, blur: 1 }}
      radius="md"
      classNames={{
        content: 'overflow-hidden bg-white',
        body: 'h-full p-0',
      }}
      >
        <Box id="crp-page" className="relative flex h-[calc(100vh-2rem)] max-h-[78vh] w-full flex-col bg-white text-black">
          <Group id="crp-header" justify="space-between" className="shrink-0 border-b border-gray-100 px-8 py-6" wrap="nowrap">
            <Box id="crp-type-section" className="max-w-[320px] flex-1">
              <PostTypeSelector value={postType} onChange={setPostType} />
            </Box>
            <ActionIcon
              id="crp-close-btn"
              aria-label="ปิด"
              onClick={handleCloseRequest}
              className="ml-3"
              color="red"
              variant="light"
              radius="md"
            >
              <IconX size={16} stroke={2} />
            </ActionIcon>
          </Group>

          {subjectName && (
            <Group id="crp-context-bar" gap={8} className="shrink-0 px-8 py-4 text-xs text-gray-500">
              <IconPaperclip size={14} className="text-amber-500" />
              <Text id="crp-context-label" size="xs" c="dimmed">
                {subjectName}
              </Text>
            </Group>
          )}

          {editPostError && (
            <Box className="mx-4 mt-2 shrink-0">
              <Alert id="crp-edit-error" color="red" radius="md" variant="light">{editPostError}</Alert>
            </Box>
          )}
          {uploadError && (
            <Box className="mx-4 mt-2 shrink-0">
              <Alert id="crp-upload-error" color="red" radius="md" variant="light">{uploadError}</Alert>
            </Box>
          )}

          <ScrollArea
            id="crp-form"
            type="hover"
            scrollbars="y"
            className="min-h-0 flex-1"
            classNames={{
              viewport: 'px-8 pb-20 pt-3',
              scrollbar: 'bg-transparent p-0.5',
              thumb: 'rounded-full border-2 border-transparent bg-[#DB763F] bg-clip-padding',
            }}
          >
            {isEditing && loadingEditPost && (
              <Paper id="crp-edit-loading" withBorder radius="md" p="md" className="mb-4 flex items-center gap-2">
                <Loader size="sm" color="gray" />
                <Text size="sm" c="dimmed">กำลังโหลดโพสต์เดิม...</Text>
              </Paper>
            )}

            {(postType === 'announcement' || postType === 'assignment') && (
              <Box id="crp-title-section" className="mb-3">
                <TextInput
                  id="crp-title-input"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="หัวข้อโพสต์"
                  radius="md"
                  size="lg"
                  classNames={{ input: 'text-2xl font-semibold' }}
                />
              </Box>
            )}

            <Box id="crp-content-section" className="mb-3">
              <Textarea
                id="crp-content-input"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder={
                  postType === 'question'
                    ? 'เขียนคำถามที่ต้องการถาม...'
                    : postType === 'assignment'
                      ? 'อธิบายรายละเอียดของงาน...'
                      : 'รายละเอียดของโพสต์...'
                }
                autosize
                minRows={6}
                radius="md"
              />
            </Box>

            {postType === 'assignment' && (
              <Paper
                id="crp-assignment-fields"
                className="mb-3 border border-orange-100 bg-orange-50"
                radius="md"
                p="md"
              >
                <Text id="crp-assignment-fields-label" mb="md" size="xs" fw={700} tt="uppercase" className="tracking-[0.08em] text-orange-700">
                  รายละเอียดงาน
                </Text>

                <Box id="crp-due-date-section" className="mb-3">
                  <DateTimePicker
                    id="crp-due-date-input"
                    label="วันส่งงาน"
                    value={dueDateValue}
                    onChange={(value) => setDueDate(value ? new Date(value) : null)}
                    valueFormat="DD/MM/YYYY HH:mm"
                    placeholder="เลือกวันและเวลา"
                    dropdownType="popover"
                    popoverProps={{ withinPortal: true, zIndex: MODAL_Z_INDEX + 20 }}
                    minDate={now}
                    clearable
                    leftSection={<IconCalendarEvent size={16} stroke={1.8} />}
                    radius="md"
                    classNames={{ label: 'mb-1 text-xs text-orange-800' }}
                  />
                </Box>

                <Box id="crp-score-section" className="mb-3">
                  <NumberInput
                    id="crp-score-input"
                    min={0}
                    step={0.5}
                    value={maxScore}
                    onChange={(value) => setMaxScore(typeof value === 'number' ? value : Number(value) || 0)}
                    label="คะแนนเต็ม"
                    placeholder="เช่น 100"
                    radius="md"
                    classNames={{ label: 'mb-1 text-xs text-orange-800' }}
                  />
                </Box>

                <Group id="crp-group-section" justify="space-between" wrap="nowrap">
                  <Text id="crp-group-label" size="xs" fw={500} className="text-orange-800">
                    งานกลุ่ม
                  </Text>
                  <Switch
                    id="crp-group-toggle"
                    checked={isGroup}
                    onChange={(event) => setIsGroup(event.currentTarget.checked)}
                    color="blue"
                  />
                </Group>
              </Paper>
            )}

            {allowAnonymous && (
              <Paper id="crp-anon-section" className="mb-3 flex items-center justify-between" radius="md" withBorder p="md">
                <Box>
                  <Text id="crp-anon-label" size="sm" fw={500} c="dark.6">ไม่ระบุตัวตน</Text>
                  <Text size="xs" c="dimmed">ชื่อของคุณจะไม่แสดงในโพสต์นี้</Text>
                </Box>
                <Switch
                  id="crp-anon-toggle"
                  checked={isAnonymous}
                  onChange={(event) => setIsAnonymous(event.currentTarget.checked)}
                  color="blue"
                />
              </Paper>
            )}

            {attachments.length > 0 && (
              <Box id="crp-attachments-section" className="mb-3">
                <Text mb={8} size="xs" fw={600} tt="uppercase" className="tracking-wide text-gray-400">
                  ไฟล์แนบ ({attachments.length})
                </Text>
                <Stack id="crp-attachments-list" gap={8}>
                  {attachments.map((attachment, index) => (
                    <Group
                      key={`${attachment.file_url}-${index}`}
                      id={`crp-attachment-item-${index}`}
                      className="flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
                      wrap="nowrap"
                    >
                      <Box className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-orange-100 text-orange-700">
                        <IconPaperclip size={16} stroke={1.8} />
                      </Box>
                      <Text id={`crp-attachment-name-${index}`} className="min-w-0 flex-1 truncate" size="xs" c="dark.6">
                        {attachment.original_name ?? attachment.preview_url ?? attachment.file_url}
                      </Text>
                      {attachment.is_uploading && (
                        <Badge variant="light" color="blue" radius="md">กำลังอัปโหลด...</Badge>
                      )}
                      {attachment.upload_error && (
                        <Badge color="red" variant="light" radius="md">อัปโหลดไม่สำเร็จ</Badge>
                      )}
                      <ActionIcon
                        id={`crp-attachment-remove-${index}`}
                        aria-label={`ลบไฟล์แนบ ${index + 1}`}
                        onClick={() => removeAttachment(index)}
                        variant="subtle"
                        color="red"
                        radius="md"
                        size="sm"
                      >
                        <IconX size={14} stroke={2.2} />
                      </ActionIcon>
                    </Group>
                  ))}
                </Stack>
              </Box>
            )}
          </ScrollArea>

          <Group id="crp-bottom-bar" justify="space-between" className="absolute inset-x-0 bottom-0 border-t border-gray-100 bg-white px-8 py-5" wrap="nowrap">
            <Group id="crp-attachment-bar" gap={4} className="rounded-md bg-orange-100 px-2 py-1">
              <FileButton
                onChange={(files) => handleFilesSelected(Array.isArray(files) ? files : files ? [files] : [])}
                multiple
                accept="image/*,application/pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
              >
                {(props) => (
                  <ActionIcon
                    {...props}
                    id="crp-add-image-btn"
                    aria-label="แนบรูปภาพ"
                    variant="subtle"
                    color="blue"
                    radius="md"
                  >
                    <IconPhoto size={16} stroke={1.8} />
                  </ActionIcon>
                )}
              </FileButton>
              <FileButton
                onChange={(files) => handleFilesSelected(Array.isArray(files) ? files : files ? [files] : [])}
                multiple
                accept="image/*,application/pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
              >
                {(props) => (
                  <ActionIcon
                    {...props}
                    id="crp-add-file-btn"
                    aria-label="แนบไฟล์"
                    variant="subtle"
                    color="blue"
                    radius="md"
                  >
                    <IconPaperclip size={16} stroke={1.8} />
                  </ActionIcon>
                )}
              </FileButton>
              <ActionIcon
                id="crp-add-link-btn"
                aria-label="แนบลิงก์"
                onClick={() => setLinkModalOpened(true)}
                variant="subtle"
                color="blue"
                radius="md"
              >
                <IconLink size={16} stroke={1.8} />
              </ActionIcon>
            </Group>

            <Button
              id="crp-submit-btn"
              aria-label={isEditing ? 'บันทึก' : 'โพสต์'}
              onClick={handleSubmit}
              disabled={isLoading || !hasContent || (isEditing && !editingPost) || attachments.some((attachment) => attachment.is_uploading)}
              radius="md"
              color="blue"
            >
              {isLoading ? (
                <Group gap={8} wrap="nowrap">
                  <Loader size="sm" color="white" />
                  {isEditing ? 'กำลังบันทึก...' : 'กำลังโพสต์...'}
                </Group>
              ) : (
                isEditing ? 'บันทึก' : 'โพสต์'
              )}
            </Button>
          </Group>
        </Box>
      </Modal>

      <Modal
        opened={confirmCloseOpened}
        onClose={() => setConfirmCloseOpened(false)}
        centered
        zIndex={MODAL_Z_INDEX + 10}
        radius="md"
        title="ยืนยันการปิด"
      >
        <Text size="sm" c="dimmed">
          ต้องการออกโดยไม่บันทึกหรือไม่?
        </Text>
        <Group mt="md" justify="flex-end" gap="sm">
          <Button variant="default" radius="md" onClick={() => setConfirmCloseOpened(false)}>
            ยกเลิก
          </Button>
          <Button color="red" radius="md" onClick={handleConfirmClose}>
            ออกโดยไม่บันทึก
          </Button>
        </Group>
      </Modal>

      <Modal
        opened={linkModalOpened}
        onClose={() => setLinkModalOpened(false)}
        centered
        zIndex={MODAL_Z_INDEX + 10}
        radius="md"
        title="แนบลิงก์"
      >
        <TextInput
          value={linkUrl}
          onChange={(event) => setLinkUrl(event.target.value)}
          placeholder="วาง URL ที่ต้องการแนบ"
          radius="md"
        />
        <Group mt="md" justify="flex-end" gap="sm">
          <Button variant="default" radius="md" onClick={() => setLinkModalOpened(false)}>
            ยกเลิก
          </Button>
          <Button radius="md" onClick={handleAddLink} disabled={!linkUrl.trim()}>
            เพิ่มลิงก์
          </Button>
        </Group>
      </Modal>
    </>
  );
};

export default CreatePostModal;
