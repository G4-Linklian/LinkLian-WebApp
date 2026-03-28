// ─────────────────────────────────────────────
// comps/linkLianApp/class/CommentPage.tsx
// Component หน้า comment — post + nested comment tree
// id convention: cmt-{element}
// ─────────────────────────────────────────────

import React, { useEffect, useRef, useState } from 'react';
import { ActionIcon, Alert, Badge, Button, Loader, Paper, ScrollArea, Text, Textarea, ThemeIcon } from '@mantine/core';
import { IconSend2 } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import CardPost from '../post/cardPost';
import { useComments } from '@/comps/linkLianApp/hook/social-feed/useComment';
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
              <Text id={`cmt-name-${cid}`} size="xs" fw={600} c="dark.7">
                {node.is_anonymous ? 'ไม่ระบุชื่อ' : node.display_name}
              </Text>
              <Text id={`cmt-time-${cid}`} size="xs" c="gray.5">
                {formatDateTime(node.created_at)}
              </Text>
            </div>
            <div className="flex items-end gap-2">
              <div id={`cmt-content-${cid}`} className="inline-block rounded-2xl rounded-tl-sm bg-gray-100 px-3 py-2 text-sm text-gray-800">
                {node.comment_text}
              </div>
              <Button
                id={`cmt-reply-btn-${cid}`}
                aria-label={`ตอบกลับ ${node.display_name}`}
                onClick={() => onReply(node)}
                variant="subtle"
                color="orange"
                size="compact-xs"
              >
                ตอบกลับ
              </Button>
            </div>
          </div>
        </div>
      </div>

      {hasReplies && (
        <div id={`cmt-children-${cid}`}>
          {node.children!.length > 2 && (
            <Button
              id={`cmt-collapse-btn-${cid}`}
              aria-expanded={!collapsed}
              onClick={() => setCollapsed((v) => !v)}
              variant="subtle"
              color="orange"
              size="compact-xs"
              className="mb-1.5 ml-11"
            >
              <svg className={`h-3.5 w-3.5 transition-transform ${collapsed ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
              {collapsed ? `ดูการตอบกลับ ${node.children!.length} รายการ` : 'ซ่อนการตอบกลับ'}
            </Button>
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
  onSubmit: (text: string) => Promise<boolean>;
  isSubmitting: boolean;
}) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { if (replyingTo) inputRef.current?.focus(); }, [replyingTo]);

  const handleSubmit = () => {
    if (!text.trim() || isSubmitting) return;
    onSubmit(text.trim());
    setText('');
  };

  return (
    <div id="cmt-input-container" className="shrink-0 border-t border-gray-100 bg-white px-4 pt-2 pb-4">
      {replyingTo && (
        <Paper id="cmt-replying-to-banner" className="mb-2 flex items-center justify-between" radius="lg" p="xs" bg="orange.0">
          <Text id="cmt-replying-to-label" size="xs" c="orange.8">
            ตอบกลับ <span className="font-semibold">{replyingTo.display_name ?? 'ไม่ระบุชื่อ'}</span>
          </Text>
          <ActionIcon id="cmt-cancel-reply-btn" aria-label="ยกเลิกการตอบกลับ" onClick={onCancelReply} variant="subtle" color="orange" radius="xl">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </ActionIcon>
        </Paper>
      )}
      <div id="cmt-input-row" className="flex items-end gap-2">
        <div className="flex-1">
          <Textarea
            id="cmt-input"
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
            placeholder={replyingTo ? `ตอบกลับ ${replyingTo.display_name ?? 'ไม่ระบุชื่อ'}...` : 'เขียนความคิดเห็น...'}
            autosize
            minRows={1}
            maxRows={4}
            radius="xl"
          />
        </div>
        <ActionIcon
          id="cmt-send-btn"
          aria-label="ส่งความคิดเห็น"
          onClick={handleSubmit}
          disabled={!text.trim() || isSubmitting}
          className="mb-1"
          color="orange"
          radius="xl"
          variant="filled"
        >
          {isSubmitting ? (
            <Loader id="cmt-send-spinner" size="sm" color="white" />
          ) : (
            <IconSend2 size={16} stroke={2} className="translate-x-0.5" />
          )}
        </ActionIcon>
      </div>
    </div>
  );
}

// ── CommentPage ───────────────────────────────
interface CommentPageProps {
  sectionId: number;
  postId: number;
  subjectName: string;
  className: string;
  showHeader?: boolean;
  post?: PostItem | null
}

const CommentPage = ({ sectionId, postId, subjectName, className, showHeader = true }: CommentPageProps) => {
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

  const handleScroll = (_position?: { x: number; y: number }) => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (scrollHeight - scrollTop - clientHeight < 200 && hasMore && !isLoadingMore) {
      loadComments();
    }
  };

  return (
    <div id="cmt-page" className="flex h-full min-h-0 w-full flex-col bg-white text-black">

      {/* Header */}
      {showHeader && (
        <div id="cmt-header" className="flex shrink-0 items-center justify-between gap-3 bg-white px-4 py-3 shadow-sm">
          <ActionIcon
            id="cmt-back-btn"
            aria-label="ย้อนกลับ"
            onClick={() => router.back()}
            variant="subtle"
            color="orange"
            radius="xl"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </ActionIcon>

          <div className="min-w-0 flex-1">
            <h1 id="cmt-header-title" className="truncate text-base font-semibold text-gray-900">
              {subjectName || 'ความคิดเห็น'}
            </h1>
            {className && (
              <p id="cmt-header-subtitle" className="truncate text-xs text-gray-400">{className}</p>
            )}
          </div>
        </div>
      )}

      {/* Scrollable */}
      <ScrollArea
        id="cmt-scroll-area"
        viewportRef={scrollRef}
        onScrollPositionChange={handleScroll}
        type="hover"
        scrollbars="y"
        className="min-h-0 flex-1 bg-white"
        classNames={{ viewport: 'bg-white px-4 py-4' }}
        styles={{
          scrollbar: {
            background: 'transparent',
            width: '10px',
            padding: '2px',
          },
          thumb: {
            backgroundColor: '#DB763F',
            borderRadius: '999px',
            border: '2px solid transparent',
            backgroundClip: 'padding-box',
          },
        }}
      >
        {postLoading && (
          <div id="cmt-post-loading" className="mb-4 flex justify-center py-8">
            <Loader color="orange" />
          </div>
        )}
        {postError && (
          <Alert id="cmt-post-error" mb="md" color="red" radius="xl" variant="light">{postError}</Alert>
        )}
        {!postLoading && post && (
          <div id="cmt-post-section">
            <CardPost post={post} minimal />
          </div>
        )}

        {!postLoading && post && (
          <div id="cmt-divider" className="mb-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <Text size="xs" c="gray.5">
              {total > 0 ? `${total} ความคิดเห็น` : 'ยังไม่มีความคิดเห็น'}
            </Text>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
        )}

        {commentLoading && (
          <div id="cmt-loading" className="flex flex-col items-center gap-3 py-8">
            <Loader color="orange" size="sm" />
            <Text size="xs" c="orange.5">กำลังโหลดความคิดเห็น...</Text>
          </div>
        )}
        {!commentLoading && commentError && (
          <Text id="cmt-error" py="md" ta="center" size="sm" c="red.5">{commentError}</Text>
        )}
        {!commentLoading && !commentError && comments.length === 0 && (
          <div id="cmt-empty" className="flex flex-col items-center gap-2 py-10">
            <ThemeIcon size={40} radius="xl" variant="light" color="gray">
              <svg className="h-5 w-5 text-gray-200" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </ThemeIcon>
            <Text id="cmt-empty-msg" size="sm" c="gray.5">เป็นคนแรกที่แสดงความคิดเห็น</Text>
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
                <Loader color="orange" size="xs" />
              </div>
            )}
            {hasMore && !isLoadingMore && (
              <Button id="cmt-load-more-btn" onClick={() => loadComments()} variant="subtle" color="orange" fullWidth>
                โหลดเพิ่มเติม
              </Button>
            )}
          </div>
        )}
      </ScrollArea>

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
