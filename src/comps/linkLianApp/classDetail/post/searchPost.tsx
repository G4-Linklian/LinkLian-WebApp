// ─────────────────────────────────────────────
// comps/linkLianApp/class/SearchPost.tsx
// Search bar + result list สำหรับค้นหา post
// id convention: sp-{element}
// ─────────────────────────────────────────────

import React, { useRef, useEffect } from 'react';
import { ActionIcon, Avatar, Badge, Card, Loader, Paper, ScrollArea, Stack, Text, TextInput, ThemeIcon } from '@mantine/core';
import { useSearchPosts } from '@/comps/linkLianApp/hook/social-feed/useSearchpost';
import { PostItem } from '@/utils/interface/class.types';
import { POST_TYPE_LABEL, POST_TYPE_COLOR, formatDateTime } from '@/utils/function/classHelper';

interface SearchPostProps {
  sectionId?: number;
  subjectName?: string;
  onSelectPost?: (post: PostItem) => void;
  onClose?: () => void;
}

function SearchResultCard({
  post,
  onClick,
}: {
  post: PostItem;
  onClick: () => void;
}) {
  const typeColor = POST_TYPE_COLOR[post.post_type] ?? { bg: 'bg-gray-100', text: 'text-gray-700' };
  const typeLabel = POST_TYPE_LABEL[post.post_type] ?? post.post_type;

  return (
    <Card
      component="button"
      id={`sp-result-card-${post.post_id}`}
      onClick={onClick}
      radius="xl"
      withBorder
      padding="md"
      className="w-full text-left transition-all duration-150 hover:border-amber-200 hover:shadow-md active:scale-[0.99]"
    >
      <div className="flex items-start gap-3">
        <Avatar
          id={`sp-result-avatar-${post.post_id}`}
          color="orange"
          radius="xl"
          className="mt-0.5"
        >
          {post.user.display_name?.[0]?.toUpperCase() ?? '?'}
        </Avatar>

        <div className="min-w-0 flex-1">
          <div id={`sp-result-meta-${post.post_id}`} className="mb-1 flex items-center gap-2">
            <Badge
              id={`sp-result-type-tag-${post.post_id}`}
              variant="light"
              style={{ backgroundColor: typeColor.bg, color: typeColor.text }}
            >
              {typeLabel}
            </Badge>
            <Text
              id={`sp-result-author-${post.post_id}`}
              size="xs"
              c="dimmed"
              className="truncate"
            >
              {post.user.display_name}
            </Text>
          </div>

          {post.title && (
            <Text
              id={`sp-result-title-${post.post_id}`}
              size="sm"
              fw={600}
              c="dark.7"
              className="truncate"
            >
              {post.title}
            </Text>
          )}

          <Text
            id={`sp-result-content-${post.post_id}`}
            mt={4}
            size="xs"
            c="dimmed"
            className="line-clamp-2"
          >
            {post.content}
          </Text>

          <Text
            id={`sp-result-time-${post.post_id}`}
            mt={6}
            size="xs"
            c="gray.5"
          >
            {formatDateTime(post.created_at)}
          </Text>
        </div>
      </div>
    </Card>
  );
}

export default function SearchPost({
  sectionId,
  subjectName,
  onSelectPost,
  onClose,
}: SearchPostProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { results, isLoading, error, keyword, setKeyword, clear } = useSearchPosts(sectionId);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div id="sp-container" className="flex h-full flex-col bg-white">
      {/* Header */}
      <div id="sp-header" className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
        {onClose && (
          <ActionIcon
            id="sp-back-btn"
            aria-label="ย้อนกลับ"
            onClick={onClose}
            variant="subtle"
            color="orange"
            radius="xl"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </ActionIcon>
        )}
        <Text id="sp-title" size="md" fw={600} c="dark.8">ค้นหาโพสต์</Text>
      </div>

      <div id="sp-input-wrapper" className="px-4 py-3">
        <TextInput
          id="sp-input"
          ref={inputRef}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder={subjectName ? `ค้นหาใน ${subjectName}...` : 'ค้นหาโพสต์...'}
          aria-label="ค้นหาโพสต์"
          radius="xl"
          size="md"
          leftSection={
            <svg className="h-4 w-4 text-amber-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
          rightSection={
            keyword ? (
              <ActionIcon id="sp-clear-btn" aria-label="ล้างคำค้นหา" onClick={clear} variant="light" color="orange" radius="xl" size="sm">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </ActionIcon>
            ) : undefined
          }
        />
      </div>

      <ScrollArea
        id="sp-results-area"
        type="hover"
        scrollbars="y"
        className="min-h-0 flex-1"
        classNames={{ viewport: 'px-4 pb-4' }}
        styles={{
          scrollbar: { background: 'transparent', width: '16px', padding: '2px' },
          thumb: { backgroundColor: '#DB763F', borderRadius: '999px', border: '2px solid transparent', backgroundClip: 'padding-box' },
        }}
      >
        {isLoading && (
          <div id="sp-loading" className="flex flex-col items-center gap-3 py-16">
            <Loader color="orange" />
            <Text size="sm" c="orange.6">กำลังค้นหา...</Text>
          </div>
        )}

        {!isLoading && error && (
          <Text id="sp-error" py="xl" ta="center" size="sm" c="red.5">
            {error}
          </Text>
        )}

        {!isLoading && !error && !keyword && (
          <div id="sp-empty-hint" className="flex flex-col items-center gap-3 py-20">
            <ThemeIcon size={56} radius="xl" variant="light" color="orange">
              <svg className="h-7 w-7 text-amber-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </ThemeIcon>
            <Text size="sm" c="orange.5">พิมพ์คำค้นหาเพื่อเริ่มต้น</Text>
          </div>
        )}

        {!isLoading && !error && keyword && results.length === 0 && (
          <div id="sp-not-found" className="flex flex-col items-center gap-3 py-20">
            <ThemeIcon size={56} radius="xl" variant="light" color="gray">
              <svg className="h-7 w-7 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </ThemeIcon>
            <Text size="sm" c="gray.5">ไม่พบโพสต์ที่ตรงกัน</Text>
          </div>
        )}

        {!isLoading && results.length > 0 && (
          <Stack id="sp-results-list" gap="sm">
            <Text id="sp-results-count" size="xs" c="orange.7">
              พบ {results.length} รายการ
            </Text>
            {results.map((post) => (
              <SearchResultCard
                key={post.post_id}
                post={post}
                onClick={() => onSelectPost?.(post)}
              />
            ))}
          </Stack>
        )}
      </ScrollArea>
    </div>
  );
}
