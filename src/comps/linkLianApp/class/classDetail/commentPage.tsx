// ─────────────────────────────────────────────
// comps/linkLianApp/class/CommentPage.tsx
// Component หน้า comment — post + nested comment tree
// id convention: cmt-{element}
// ─────────────────────────────────────────────

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import CardPost from '@/comps/linkLianApp/class/classDetail/cardPost';
import { useComments } from '@/hooks/social-feed/useComment';
import { getPostById } from '@/utils/api/social-feed/post';
import { CommentNode, PostItem } from '@/utils/interface/class.types';
import { formatDateTime, getInitial } from '@/utils/function/classHelper';

// ── CommentItem ───────────────────────────────
function CommentItem({
  node, depth = 0, onReply,
}: {
  node: CommentNode;
  depth?: number;
  onReply: (node: CommentNode) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const hasReplies = node.children && node.children.length > 0;
  const cid = node.comment_id;

  return (
    <div id={`cmt-node-${cid}`} className={depth > 0 ? 'ml-4 border-l-2 border-amber-100 pl-3' : ''}>
      <div id={`cmt-bubble-${cid}`} className="mb-2">
        <div className="flex items-start gap-2.5">
          <div id={`cmt-avatar-${cid}`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-700">
            {node.is_anonymous ? (
              <svg className="h-4 w-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
              </svg>
            ) : node.profile_pic ? (
              <img src={node.profile_pic} alt={node.display_name ?? ''} className="h-8 w-8 rounded-full object-cover" />
            ) : (
              getInitial(node.display_name ?? '')
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div id={`cmt-meta-${cid}`} className="mb-1 flex items-baseline gap-2">
              <span id={`cmt-name-${cid}`} className="text-xs font-semibold text-gray-800">
                {node.is_anonymous ? 'ไม่ระบุชื่อ' : node.display_name}
              </span>
              <span id={`cmt-time-${cid}`} className="text-xs text-gray-400">
                {formatDateTime(node.created_at)}
              </span>
            </div>
            <div className="flex items-end gap-2">
              <div id={`cmt-content-${cid}`} className="inline-block rounded-2xl rounded-tl-sm bg-gray-100 px-3 py-2 text-sm text-gray-800">
                {node.comment_text}
              </div>
              <button
                id={`cmt-reply-btn-${cid}`}
                aria-label={`ตอบกลับ ${node.display_name}`}
                onClick={() => onReply(node)}
                style={{ fontSize: '12px', lineHeight: 1 }}
                className="mb-1 shrink-0 font-semibold text-gray-400 hover:text-amber-500 transition-colors"
              >
                ตอบกลับ
              </button>
            </div>
          </div>
        </div>
      </div>

      {hasReplies && (
        <div id={`cmt-children-${cid}`}>
          {node.children!.length > 2 && (
            <button
              id={`cmt-collapse-btn-${cid}`}
              aria-expanded={!collapsed}
              onClick={() => setCollapsed((v) => !v)}
              className="mb-1.5 ml-11 flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700"
            >
              <svg className={`h-3.5 w-3.5 transition-transform ${collapsed ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
              {collapsed ? `ดูการตอบกลับ ${node.children!.length} รายการ` : 'ซ่อนการตอบกลับ'}
            </button>
          )}
          {!collapsed && node.children!.map((child) => (
            <CommentItem key={child.comment_id} node={child} depth={depth + 1} onReply={onReply} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── CommentInput ──────────────────────────────
function CommentInput({
  replyingTo, onCancelReply, onSubmit, isSubmitting,
}: {
  replyingTo: CommentNode | null;
  onCancelReply: () => void;
  onSubmit: (text: string, isAnonymous: boolean) => Promise<boolean>;
  isSubmitting: boolean;
}) {
  const [text, setText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { if (replyingTo) inputRef.current?.focus(); }, [replyingTo]);

  const handleSubmit = () => {
    if (!text.trim() || isSubmitting) return;
    onSubmit(text.trim(), isAnonymous);
    setText('');
  };

  return (
    <div id="cmt-input-container" className="shrink-0 border-t border-gray-100 bg-white px-4 pt-2 pb-4">
      {replyingTo && (
        <div id="cmt-replying-to-banner" className="mb-2 flex items-center justify-between rounded-lg bg-amber-50 px-3 py-1.5">
          <span id="cmt-replying-to-label" className="text-xs text-amber-700">
            ตอบกลับ <span className="font-semibold">{replyingTo.display_name ?? 'ไม่ระบุชื่อ'}</span>
          </span>
          <button id="cmt-cancel-reply-btn" aria-label="ยกเลิกการตอบกลับ" onClick={onCancelReply} className="text-amber-500 hover:text-amber-700">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      <div id="cmt-input-row" className="flex items-end gap-2">
        <button
          id="cmt-anon-toggle"
          aria-label={isAnonymous ? 'ปิดการระบุตัวตน' : 'เปิดการระบุตัวตน'}
          aria-pressed={isAnonymous}
          onClick={() => setIsAnonymous((v) => !v)}
          className={`mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${isAnonymous ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
          </svg>
        </button>
        <div className="flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 transition-all focus-within:border-amber-300 focus-within:bg-white">
          <textarea
            id="cmt-input"
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
            placeholder={replyingTo ? `ตอบกลับ ${replyingTo.display_name ?? 'ไม่ระบุชื่อ'}...` : 'เขียนความคิดเห็น...'}
            rows={1}
            className="w-full resize-none bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
            style={{ maxHeight: 80 }}
          />
        </div>
        <button
          id="cmt-send-btn"
          aria-label="ส่งความคิดเห็น"
          onClick={handleSubmit}
          disabled={!text.trim() || isSubmitting}
          className="mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white shadow hover:bg-amber-600 disabled:opacity-40"
        >
          {isSubmitting ? (
            <span id="cmt-send-spinner" className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <svg className="h-4 w-4 translate-x-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          )}
        </button>
      </div>
      {isAnonymous && (
        <p id="cmt-anon-note" className="mt-1.5 pl-10 text-xs text-amber-500">
          ความคิดเห็นนี้จะแสดงแบบไม่ระบุตัวตน
        </p>
      )}
    </div>
  );
}

// ── CommentPage ───────────────────────────────
interface CommentPageProps {
  sectionId: number;
  postId: number;
  subjectName: string;
  className: string;
  isPopup?: boolean;
  post?: PostItem | null
  onClose?: () => void;
}

const CommentPage = ({ sectionId, postId, subjectName, className, isPopup = false, onClose }: CommentPageProps) => {
  const router = useRouter();

  const [post, setPost] = useState<PostItem | null>(null);
  const [postLoading, setPostLoading] = useState(true);
  const [postError, setPostError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    comments, total, hasMore,
    isLoading: commentLoading, isLoadingMore, error: commentError,
    replyingTo, isSubmitting, setReplyingTo, submitComment, loadComments,
  } = useComments(postId);

  useEffect(() => {
    if (!postId || isNaN(postId)) return;
    setPostLoading(true);
    setPostError(null);
    getPostById(postId)
      .then((res) => {
        if (res.success && res.data) setPost(res.data);
        else setPostError('ไม่สามารถโหลดโพสต์ได้');
      })
      .catch(() => setPostError('เกิดข้อผิดพลาด'))
      .finally(() => setPostLoading(false));
  }, [postId]);

  useEffect(() => {
    if (!postId || Number.isNaN(postId)) return;
    loadComments({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (scrollHeight - scrollTop - clientHeight < 200 && hasMore && !isLoadingMore) {
      loadComments();
    }
  };

  return (
    <div id="cmt-page" className="flex h-full min-h-0 w-full flex-col bg-[#FAFAFA] text-black">

      {/* Header */}
      <div id="cmt-header" className="flex shrink-0 items-center justify-between gap-3 bg-white px-4 py-3 shadow-sm">

        {/* ปุ่มย้อนกลับ — เฉพาะ non-popup */}
        {!isPopup && (
          <button
            id="cmt-back-btn"
            aria-label="ย้อนกลับ"
            onClick={() => router.back()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-amber-800 hover:bg-amber-50"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Title */}
        <div className="min-w-0 flex-1">
          <h1 id="cmt-header-title" className="truncate text-base font-semibold text-gray-900">
            {subjectName || 'ความคิดเห็น'}
          </h1>
          {className && (
            <p id="cmt-header-subtitle" className="truncate text-xs text-gray-400">{className}</p>
          )}
        </div>

        {/* ปุ่มปิด — เฉพาะ popup มุมขวา สี danger */}
        {isPopup && (
          <button
            id="cmt-close-btn"
            aria-label="ปิดหน้าต่างความคิดเห็น"
            onClick={() => onClose?.()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-50"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Scrollable */}
      <div id="cmt-scroll-area" ref={scrollRef} onScroll={handleScroll} className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {postLoading && (
          <div id="cmt-post-loading" className="mb-4 flex justify-center py-8">
            <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-amber-200 border-t-amber-500" />
          </div>
        )}
        {postError && (
          <p id="cmt-post-error" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-500">{postError}</p>
        )}
        {!postLoading && post && (
          <div id="cmt-post-section">
            <CardPost post={post} minimal />
          </div>
        )}

        {!postLoading && post && (
          <div id="cmt-divider" className="mb-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">
              {total > 0 ? `${total} ความคิดเห็น` : 'ยังไม่มีความคิดเห็น'}
            </span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
        )}

        {commentLoading && (
          <div id="cmt-loading" className="flex flex-col items-center gap-3 py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-200 border-t-amber-500" />
            <p className="text-xs text-amber-400">กำลังโหลดความคิดเห็น...</p>
          </div>
        )}
        {!commentLoading && commentError && (
          <p id="cmt-error" className="py-4 text-center text-sm text-red-400">{commentError}</p>
        )}
        {!commentLoading && !commentError && comments.length === 0 && (
          <div id="cmt-empty" className="flex flex-col items-center gap-2 py-10">
            <svg className="h-10 w-10 text-gray-200" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p id="cmt-empty-msg" className="text-sm text-gray-400">เป็นคนแรกที่แสดงความคิดเห็น</p>
          </div>
        )}
        {!commentLoading && comments.length > 0 && (
          <div id="cmt-tree">
            {comments.map((node) => (
              <CommentItem
                key={node.comment_id}
                node={node}
                onReply={setReplyingTo}
              />
            ))}
            {isLoadingMore && (
              <div id="cmt-load-more-spinner" className="flex justify-center py-4">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-200 border-t-amber-500" />
              </div>
            )}
            {hasMore && !isLoadingMore && (
              <button id="cmt-load-more-btn" onClick={() => loadComments()}
                className="w-full py-2 text-center text-sm font-medium text-amber-600 hover:text-amber-700">
                โหลดเพิ่มเติม
              </button>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <CommentInput
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        onSubmit={submitComment}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default CommentPage;