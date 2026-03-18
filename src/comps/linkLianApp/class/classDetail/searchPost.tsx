// ─────────────────────────────────────────────
// comps/linkLianApp/class/SearchPost.tsx
// Search bar + result list สำหรับค้นหา post
// id convention: sp-{element}
// ─────────────────────────────────────────────

import React, { useRef, useEffect } from 'react';
import { useSearchPosts } from '@/hooks/social-feed/useSearchpost';
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
    <button
      id={`sp-result-card-${post.post_id}`}
      onClick={onClick}
      className="w-full rounded-xl border border-gray-100 bg-white p-3.5 text-left shadow-sm transition-all duration-150 hover:border-amber-200 hover:shadow-md active:scale-[0.99]"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          id={`sp-result-avatar-${post.post_id}`}
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-700"
        >
          {post.user.display_name?.[0]?.toUpperCase() ?? '?'}
        </div>

        <div className="min-w-0 flex-1">
          {/* Type tag + name */}
          <div id={`sp-result-meta-${post.post_id}`} className="mb-1 flex items-center gap-2">
            <span
              id={`sp-result-type-tag-${post.post_id}`}
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${typeColor.bg} ${typeColor.text}`}
            >
              {typeLabel}
            </span>
            <span
              id={`sp-result-author-${post.post_id}`}
              className="truncate text-xs text-gray-500"
            >
              {post.user.display_name}
            </span>
          </div>

          {/* Title */}
          {post.title && (
            <p
              id={`sp-result-title-${post.post_id}`}
              className="truncate text-sm font-semibold text-gray-800"
            >
              {post.title}
            </p>
          )}

          {/* Content preview */}
          <p
            id={`sp-result-content-${post.post_id}`}
            className="mt-0.5 line-clamp-2 text-xs text-gray-500"
          >
            {post.content}
          </p>

          {/* Time */}
          <p
            id={`sp-result-time-${post.post_id}`}
            className="mt-1.5 text-xs text-gray-400"
          >
            {formatDateTime(post.created_at)}
          </p>
        </div>
      </div>
    </button>
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
          <button
            id="sp-back-btn"
            aria-label="ย้อนกลับ"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-amber-800 transition-colors hover:bg-amber-50"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <h2 id="sp-title" className="text-base font-semibold text-gray-800">
          ค้นหาโพสต์
        </h2>
      </div>

      {/* Search input */}
      <div id="sp-input-wrapper" className="px-4 py-3">
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-2 transition-all focus-within:border-amber-400 focus-within:bg-white focus-within:shadow-md focus-within:shadow-amber-100/60">
          <svg className="h-4 w-4 shrink-0 text-amber-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="sp-input"
            ref={inputRef}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={subjectName ? `ค้นหาใน ${subjectName}...` : 'ค้นหาโพสต์...'}
            aria-label="ค้นหาโพสต์"
            className="min-w-0 flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-amber-400/80"
          />
          {keyword && (
            <button
              id="sp-clear-btn"
              aria-label="ล้างคำค้นหา"
              onClick={clear}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-200 text-amber-700 transition-colors hover:bg-amber-300"
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Results area */}
      <div id="sp-results-area" className="flex-1 overflow-y-auto px-4 pb-4">

        {/* Loading */}
        {isLoading && (
          <div id="sp-loading" className="flex flex-col items-center gap-3 py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-amber-200 border-t-amber-500" />
            <p className="text-sm text-amber-400">กำลังค้นหา...</p>
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <p id="sp-error" className="py-8 text-center text-sm text-red-400">
            {error}
          </p>
        )}

        {/* Empty hint */}
        {!isLoading && !error && !keyword && (
          <div id="sp-empty-hint" className="flex flex-col items-center gap-3 py-20">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
              <svg className="h-7 w-7 text-amber-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-sm text-amber-400">พิมพ์คำค้นหาเพื่อเริ่มต้น</p>
          </div>
        )}

        {/* Not found */}
        {!isLoading && !error && keyword && results.length === 0 && (
          <div id="sp-not-found" className="flex flex-col items-center gap-3 py-20">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <svg className="h-7 w-7 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-400">ไม่พบโพสต์ที่ตรงกัน</p>
          </div>
        )}

        {/* Results list */}
        {!isLoading && results.length > 0 && (
          <div id="sp-results-list" className="flex flex-col gap-2.5">
            <p id="sp-results-count" className="text-xs text-amber-600/80">
              พบ {results.length} รายการ
            </p>
            {results.map((post) => (
              <SearchResultCard
                key={post.post_id}
                post={post}
                onClick={() => onSelectPost?.(post)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}