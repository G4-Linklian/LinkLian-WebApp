// ─────────────────────────────────────────────
// comps/linkLianApp/class/ClassDetail.tsx
// Component หน้า class detail — header, side panels, post list
// id convention: cd-{element}
// ─────────────────────────────────────────────

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ActionIcon, Alert, Avatar, Badge, Button, Loader, Modal, Paper, ScrollArea, Text, TextInput } from '@mantine/core'
import { useRouter } from 'next/router'
import CardPost from '../post/cardPost'
import FilterPost from '../post/filterPost'
import CreatePostModal from '@/comps/linkLianApp/shared/createPostModal'
import CommentPage from '../comment/commentPage'
import SearchPost from '../post/searchPost'
import ClassInfoPopup from './classInfoPopup'
import { usePosts } from '@/hooks/social-feed/usePost'
import { useClassInfo } from '@/hooks/social-feed/useClassinfo'
import { useSearchPosts } from '@/hooks/social-feed/useSearchpost'
import { ClassSchedule, PostItem } from '@/utils/interface/class.types'
import { dayOfWeekToText, formatDateTime, formatTime } from '@/utils/function/classHelper'
import { decodeRegistrationToken, decodeTeacherToken, decodeToken } from '@/utils/authToken'
import { getSection } from '@/utils/api/section'

const HEADER_FULL = 210
const HEADER_MIN = 0
const CLASS_DETAIL_MODAL_Z_INDEX = 11000

const getSocialFeedRoleName = (): string => {
  try {
    const tokens = [
      decodeTeacherToken(),
      decodeRegistrationToken(),
      decodeToken(),
    ].filter(Boolean)

    const roleName = tokens
      .map((token) => String((token as any)?.role_name ?? '').toLowerCase())
      .find((name) => name.length > 0)

    return roleName ?? ''
  } catch {
    return ''
  }
}

interface ClassHeaderProps {
  subjectName: string
  className: string
  mainTitle: string
  subTitle: string
  schedules: ClassSchedule[]
  scrollRatio: number
  onBack: () => void
  onSearch: () => void
  onShowClassInfo: () => void
  onCreatePost: () => void
}

interface CommentModalProps {
  opened: boolean
  onClose: () => void
  sectionId: number
  postId: number
  subjectName: string
  className: string
}

function CommentModal({
  opened,
  onClose,
  sectionId,
  postId,
  subjectName,
  className,
}: CommentModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      zIndex={CLASS_DETAIL_MODAL_Z_INDEX}
      scrollAreaComponent={ScrollArea.Autosize}
      title={(
        <div className="min-w-0">
          <Text size="base" fw={600} c="dark.9" truncate>
            {subjectName || 'ความคิดเห็น'}
          </Text>
          {className && (
            <Text size="xs" c="gray.5" truncate>
              {className}
            </Text>
          )}
        </div>
      )}
      centered
      size="min(980px, calc(100vw - 3rem))"
      padding={0}
      radius="lg"
      overlayProps={{ backgroundOpacity: 0.35, blur: 1 }}
      styles={{
        header: { padding: '16px 20px', alignItems: 'flex-start', backgroundColor: '#fff' },
        title: { flex: 1, minWidth: 0 },
        body: { padding: 0, backgroundColor: '#fff' },
        content: { overflow: 'hidden', backgroundColor: '#fff' },
      }}
    >
      <div id="cd-comment-modal" className="mx-auto flex h-[min(78vh,780px)] w-full max-w-4xl overflow-hidden bg-white">
        <CommentPage
          sectionId={sectionId}
          postId={postId}
          subjectName={subjectName}
          className={className}
          showHeader={false}
        />
      </div>
    </Modal>
  )
}

function ClassHeader({
  subjectName,
  className,
  mainTitle,
  subTitle,
  schedules,
  scrollRatio,
  onBack,
  onSearch,
  onShowClassInfo,
  onCreatePost,
}: ClassHeaderProps) {
  const headerH = HEADER_FULL - (HEADER_FULL - HEADER_MIN) * scrollRatio
  const titleOpacity = 1 - scrollRatio * 1.8
  const collapsedOpacity = Math.max(0, scrollRatio * 2 - 1)

  return (
    <div id="cd-header" className="relative shrink-0 overflow-hidden rounded-2xl" style={{ height: headerH }}>
      <div
        id="cd-header-bg"
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('${process.env.NEXT_PUBLIC_CLASS_DETAIL_BG_IMAGE || "https://uat-core.linklian.org/v1/assets/active/url"}')`,
          transform: `scale(${1 + scrollRatio * 0.05})`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />

      <div id="cd-header-top-row" className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between gap-3 px-4 pt-3" style={{ opacity: Math.max(0, titleOpacity) }}>
        <div id="cd-header-nav-breadcrumb-row" className="flex min-w-0 items-center gap-2 text-xs text-white/90">
          <ActionIcon
            id="cd-back-btn"
            aria-label="ย้อนกลับ"
            onClick={onBack}
            variant="filled"
            radius="xl"
            style={{ backgroundColor: 'rgba(0,0,0,0.3)', color: '#fff', backdropFilter: 'blur(4px)' }}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </ActionIcon>
          <span id="cd-header-breadcrumb-home">ห้องเรียน</span>
          <span>/</span>
          <span id="cd-header-breadcrumb-subject" className="truncate">{subjectName}</span>
          <span id="cd-header-breadcrumb-class" className="truncate">{className}</span>
        </div>

        <div id="cd-header-actions" className="flex shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 xl:hidden">
            <ActionIcon
              id="cd-class-info-btn"
              aria-label="ข้อมูลห้องเรียน"
              onClick={onShowClassInfo}
              variant="filled"
              radius="xl"
              style={{ backgroundColor: 'rgba(0,0,0,0.3)', color: '#fff', backdropFilter: 'blur(4px)' }}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </ActionIcon>
            <ActionIcon
              id="cd-search-btn"
              aria-label="ค้นหาโพสต์"
              onClick={onSearch}
              variant="filled"
              radius="xl"
              style={{ backgroundColor: 'rgba(0,0,0,0.3)', color: '#fff', backdropFilter: 'blur(4px)' }}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </ActionIcon>
          </div>
          <ActionIcon
            id="cd-create-post-btn"
            aria-label="สร้างโพสต์"
            onClick={onCreatePost}
            variant="filled"
            color="orange"
            radius="xl"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </ActionIcon>
        </div>
      </div>

      <div id="cd-header-collapsed-title" className="absolute bottom-3 left-0 right-0 px-4" style={{ opacity: collapsedOpacity }}>
        <Text className="truncate text-center drop-shadow" size="sm" fw={600} c="white">{mainTitle}</Text>
      </div>

      <div id="cd-header-expanded-info" className="absolute bottom-0 left-0 right-0 px-4 pb-4" style={{ opacity: Math.max(0, titleOpacity) }}>
        <Text id="cd-header-main-title" className="drop-shadow-md" size="2rem" fw={700} lh={1.2} c="white">{mainTitle}</Text>
        <Text id="cd-header-sub-title" mt={2} size="sm" c="rgba(255,255,255,0.8)">{subTitle}</Text>
        {schedules.length > 0 && (
          <div id="cd-header-schedules" className="mt-2 flex flex-wrap gap-1.5">
            {schedules.map((s, i) => (
              <Badge
                key={i}
                id={`cd-header-schedule-chip-${i}`}
                variant="filled"
                radius="xl"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff', backdropFilter: 'blur(4px)' }}
              >
                {dayOfWeekToText(s.day_of_week, true)} {formatTime(s.start_time)}–{formatTime(s.end_time)}
                {s.room?.room_number ? ` • ${s.room.room_number}` : ''}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface ClassDetailProps {
  sectionId: number
  subjectName: string
  className: string
}

const ClassDetail = ({ sectionId, subjectName, className }: ClassDetailProps) => {
  const router = useRouter()
  const classInfoRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const feedScrollRef = useRef<HTMLDivElement>(null)
  const hasMoreRef = useRef(false)
  const isLoadingMoreRef = useRef(false)

  const [scrollRatio, setScrollRatio] = useState(0)
  const [showSearch, setShowSearch] = useState(false)
  const [showClassInfo, setShowClassInfo] = useState(false)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [showCommentPostId, setShowCommentPostId] = useState<number | null>(null)
  const [editingPost, setEditingPost] = useState<PostItem | null>(null)
  const [resolvedSubjectName, setResolvedSubjectName] = useState(subjectName)
  const [highlightedPostId, setHighlightedPostId] = useState<number | null>(null)

  const navigateBack = () => {
    router.push('/classes')
  }
  const [pendingFocusPostId, setPendingFocusPostId] = useState<number | null>(null)
  const [focusSignal, setFocusSignal] = useState(0)

  const { classInfo, isLoading: isClassInfoLoading, error: classInfoError } = useClassInfo(sectionId)
  const roleName = getSocialFeedRoleName()
  const isTeacherRole = roleName === 'teacher' || roleName === 'instructor'

  const safeSubjectName = (resolvedSubjectName || subjectName || '').trim()
  const safeClassName = (className || '').trim()
  const mainTitle = isTeacherRole ? safeClassName || safeSubjectName || 'ห้องเรียน' : safeSubjectName || safeClassName || 'ห้องเรียน'
  const subTitle = isTeacherRole ? safeSubjectName || safeClassName || 'ไม่ระบุวิชา' : safeClassName || safeSubjectName || 'ไม่ระบุห้อง'

  const { posts, isLoading, isLoadingMore, error, hasMore, filterType, setFilterType, loadMore, refresh, removePostOptimistic, ensurePostInFeed } = usePosts(sectionId)
  const { results: searchResults, keyword, setKeyword, isLoading: isSearchLoading, error: searchError } = useSearchPosts(sectionId)

  // เมื่อมี keyword → แสดง search results แทน feed
  const isSearchMode = keyword.trim().length > 0

  useEffect(() => {
    hasMoreRef.current = hasMore
    isLoadingMoreRef.current = isLoadingMore
  }, [hasMore, isLoadingMore])

  useEffect(() => {
    setResolvedSubjectName(subjectName)
  }, [subjectName])

  useEffect(() => {
    if (safeSubjectName) return
    if (!sectionId) return

    let mounted = true
      ; (async () => {
        try {
          const res: any = await getSection({
            section_id: sectionId,
            flag_valid: true,
            limit: 1,
            offset: 0,
          })
          const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res?.result?.data) ? res.result.data : []
          const first = rows[0]
          const nextSubjectName = String(
            first?.subject_name_th ?? first?.name_th ?? first?.subject?.subject_name_th ?? first?.subject?.subject_name ?? '',
          ).trim()

          if (mounted && nextSubjectName) {
            setResolvedSubjectName(nextSubjectName)
          }
        } catch {
          // Keep fallback title when section endpoint is unavailable.
        }
      })()

    return () => {
      mounted = false
    }
  }, [sectionId, safeSubjectName])

  const schedulesByDay = useMemo(() => {
    const map = new Map<string, string[]>()

      ; (classInfo?.schedules ?? []).forEach((schedule) => {
        const dayLabel = dayOfWeekToText(schedule.day_of_week)
        const roomLabel = schedule.room?.room_number ? `ห้อง ${schedule.room.room_number}` : 'ไม่ระบุห้อง'
        const buildingLabel = schedule.building?.building_name ? ` (${schedule.building.building_name})` : ''
        const timeLabel = `${formatTime(schedule.start_time)}-${formatTime(schedule.end_time)}`
        const value = `${timeLabel} • ${roomLabel}${buildingLabel}`

        const list = map.get(dayLabel) ?? []
        list.push(value)
        map.set(dayLabel, list)
      })

    return Array.from(map.entries())
  }, [classInfo?.schedules])

  const openPost = (post: PostItem) => {
    const postId = Number(post.post_id)
    if (!Number.isFinite(postId) || postId <= 0) return
    setShowCommentPostId(postId)
  }

  const openEdit = (post: PostItem) => {
    setEditingPost(post)
    setShowCreatePost(true)
  }

  const openCreatePost = () => {
    setEditingPost(null)
    setShowCreatePost(true)
  }

  const clearSearch = () => {
    setKeyword('')
    searchInputRef.current?.focus()
  }

  const wait = (ms: number) => new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })

  const scrollToPostCard = (postId: number): boolean => {
    const target = document.getElementById(`cp-card-${postId}`)
    if (!feedScrollRef.current || !target) return false

    const container = feedScrollRef.current
    const containerRect = container.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()
    const nextTop = container.scrollTop + (targetRect.top - containerRect.top) - 20
    container.scrollTo({ top: Math.max(0, nextTop), behavior: 'smooth' })
    return true
  }

  useEffect(() => {
    if (!pendingFocusPostId) return

    const tryScroll = () => {
      if (!scrollToPostCard(pendingFocusPostId)) return false
      setHighlightedPostId(null)
      requestAnimationFrame(() => { setHighlightedPostId(pendingFocusPostId) })
      setPendingFocusPostId(null)
      return true
    }

    if (tryScroll()) return
    const rafId = window.requestAnimationFrame(() => { tryScroll() })
    return () => { window.cancelAnimationFrame(rafId) }
  }, [pendingFocusPostId, posts, focusSignal])

  const focusPostInFeed = async (postId: number) => {
    setFocusSignal((prev) => prev + 1)
    setPendingFocusPostId(postId)

    // ล้าง search ก่อน แล้วรอ feed render
    setKeyword('')

    if (filterType !== 'all') {
      setFilterType('all')
    }

    // รอ feed mount หลัง keyword ถูก clear
    await wait(150)

    if (scrollToPostCard(postId)) return

    const ensuredFirst = await ensurePostInFeed(postId)
    if (ensuredFirst) {
      await wait(120)
      if (scrollToPostCard(postId)) return
    }

    for (let attempt = 0; attempt < 20; attempt += 1) {
      if (scrollToPostCard(postId)) return
      if (!hasMoreRef.current) break
      if (!isLoadingMoreRef.current) loadMore()
      await wait(300)
    }

    const ensuredAfterPaging = await ensurePostInFeed(postId)
    if (ensuredAfterPaging) {
      await wait(180)
      scrollToPostCard(postId)
    }
  }

  const handleFeedScroll = () => {
    if (!feedScrollRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = feedScrollRef.current
    const ratio = Math.min(1, scrollTop / 180)
    setScrollRatio(ratio)

    if (scrollHeight - scrollTop - clientHeight < 200 && hasMore && !isLoadingMore) {
      loadMore()
    }
  }

  return (
    <div id="cd-page" className="h-full w-full bg-[#FAFAFA] px-4 text-black md:px-6">
      <div id="cd-layout" className="mx-auto grid h-full w-full max-w-[1500px] grid-cols-1 gap-6 py-4 xl:grid-cols-[280px_minmax(0,1fr)]">

        {/* ── Left aside: Class Info ── */}
        <aside id="cd-class-info-column" className="hidden min-h-0 xl:block">
          <Paper
            id="cd-class-info-panel"
            ref={classInfoRef}
            className="h-full"
            radius="lg"
            withBorder
            p="md"
            shadow="sm"
          >
            <Text id="cd-class-info-title" mb="lg" size="lg" fw={900} c="dark.8">ข้อมูลห้องเรียน</Text>
            {isClassInfoLoading && <Text id="cd-class-info-loading" size="xs" c="dimmed">กำลังโหลดข้อมูล...</Text>}
            {!isClassInfoLoading && classInfoError && <Text id="cd-class-info-error" size="xs" c="red.6">{classInfoError}</Text>}
            {!isClassInfoLoading && !classInfoError && (
              <ScrollArea id="cd-class-info-content" h="calc(100% - 28px)" offsetScrollbars>
                <div className="space-y-8 py-1">

                <section id="cd-class-info-subject-section">
                  <Text size="xl" fw={700} c="dark.6">{safeSubjectName || 'ไม่ระบุ'}</Text>
                </section>

                <section id="cd-class-info-schedules-section">
                  <p className="mb-2 text-xs font-semibold text-gray-500">ห้องเรียนตามวัน</p>
                  <div className="space-y-2">
                    {schedulesByDay.map(([day, rows]) => (
                      <Paper key={day} radius="lg" bg="gray.0" p="sm">
                        <Text size="xs" fw={600} c="dark.6">{day}</Text>
                        <div className="mt-1 space-y-1">
                          {rows.map((row) => (
                            <Text key={`${day}-${row}`} size="11px" c="dimmed">{row}</Text>
                          ))}
                        </div>
                      </Paper>
                    ))}
                    {schedulesByDay.length === 0 && (
                      <Text size="xs" c="gray.5">ไม่มีข้อมูลตารางเรียน</Text>
                    )}
                  </div>
                </section>

                <section id="cd-class-info-educators-section">
                  <p className="mb-2 text-xs font-semibold text-gray-500">
                    ผู้สอน ({classInfo?.educators?.length ?? 0})
                  </p>
                  <div className="space-y-2">
                    {(classInfo?.educators ?? []).map((educator) => (
                      <Paper
                        key={educator.user_sys_id}
                        radius="lg"
                        bg="gray.0"
                        p="sm"
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '36px minmax(0, 1fr)',
                          columnGap: '12px',
                          alignItems: 'start',
                        }}
                      >
                        {educator.profile_pic ? (
                          <Avatar src={educator.profile_pic} alt={educator.display_name} radius="xl" size={36} />
                        ) : (
                          <Avatar color="blue" radius="xl" size={36}>{(educator.display_name || '?').charAt(0)}</Avatar>
                        )}
                        <div className="min-w-0">
                          <Text truncate size="xs" fw={600} c="dark.7">
                            {educator.display_name || 'ไม่ระบุชื่อ'}
                            {educator.is_main_teacher ? ' (ผู้สอนหลัก)' : ''}
                          </Text>
                          <Text truncate size="11px" c="dimmed">รหัส: {educator.user_sys_id}</Text>
                        </div>
                      </Paper>
                    ))}
                    {(classInfo?.educators?.length ?? 0) === 0 && (
                      <Text size="xs" c="gray.5">ไม่มีข้อมูลผู้สอน</Text>
                    )}
                  </div>
                </section>

                <section id="cd-class-info-members-section">
                  <p className="mb-2 text-xs font-semibold text-gray-500">
                    สมาชิก ({classInfo?.members?.length ?? 0})
                  </p>
                  <ScrollArea.Autosize
                    mah={256}
                    type="hover"
                    scrollbars="y"
                    offsetScrollbars={false}
                    classNames={{ viewport: 'pr-2' }}
                    styles={{
                      scrollbar: { background: 'transparent', width: '8px' },
                      thumb: { backgroundColor: '#DB763F', borderRadius: '999px' },
                    }}
                  >
                    <div className="space-y-3 py-1">
                      {(classInfo?.members ?? []).map((member) => (
                        <Paper
                          key={member.user_sys_id}
                          radius="lg"
                          bg="gray.0"
                          p="sm"
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '36px minmax(0, 1fr)',
                            columnGap: '12px',
                            alignItems: 'start',
                          }}
                        >
                          {member.profile_pic ? (
                            <Avatar src={member.profile_pic} alt={member.display_name} radius="xl" size={36} />
                          ) : (
                            <Avatar color="orange" radius="xl" size={36}>{(member.display_name || '?').charAt(0)}</Avatar>
                          )}
                          <div className="min-w-0">
                            <Text truncate size="xs" fw={600} c="dark.7">{member.display_name || 'ไม่ระบุชื่อ'}</Text>
                            <Text truncate size="11px" c="dimmed">รหัส: {member.student_code || member.user_sys_id}</Text>
                          </div>
                        </Paper>
                      ))}
                      {(classInfo?.members?.length ?? 0) === 0 && (
                        <Text size="xs" c="gray.5">ไม่มีสมาชิก</Text>
                      )}
                    </div>
                  </ScrollArea.Autosize>
                </section>

                </div>
              </ScrollArea>
            )}
          </Paper>
        </aside>

        {/* ── Main shell ── */}
        <div id="cd-shell" className="relative flex h-full min-h-0 w-full flex-col overflow-hidden">
          <ClassHeader
            subjectName={safeSubjectName}
            className={className}
            mainTitle={mainTitle}
            subTitle={subTitle}
            schedules={classInfo?.schedules ?? []}
            scrollRatio={scrollRatio}
            onBack={navigateBack}
            onSearch={() => setShowSearch(true)}
            onShowClassInfo={() => setShowClassInfo(true)}
            onCreatePost={openCreatePost}
          />

          {/* Search bar — desktop only */}
          <Paper
            id="cd-search-bar"
            className="mt-3 hidden shrink-0 xl:flex"
            radius="lg"
            withBorder
            p="sm"
          >
            <TextInput
              id="cd-search-input"
              ref={searchInputRef}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="ค้นหาโพสต์ในห้องเรียนนี้..."
              className="w-full"
              variant="unstyled"
              leftSection={
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
              rightSection={
                keyword ? (
                  <ActionIcon onClick={clearSearch} variant="light" color="gray" radius="xl" size="sm">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </ActionIcon>
                ) : undefined
              }
            />
          </Paper>

          {/* Filter bar — ซ่อนตอน search mode */}
          {!isSearchMode && (
            <div id="cd-filter-bar" className="mt-3 flex shrink-0 justify-end">
              <FilterPost value={filterType} onChange={setFilterType} />
            </div>
          )}

          {/* ── Search mode: แสดง results แทน feed ── */}
          {isSearchMode ? (
            <ScrollArea
              id="cd-search-results-area"
              type="hover"
              scrollbars="y"
              className="min-h-0 flex-1"
              classNames={{ viewport: 'pt-3 pb-24' }}
              styles={{
                scrollbar: { background: 'transparent', width: '16px', padding: '2px' },
                thumb: { backgroundColor: '#DB763F', borderRadius: '999px', border: '2px solid transparent', backgroundClip: 'padding-box' },
              }}
            >
              {/* header แถบ results */}
              <div className="mb-3 flex items-center justify-between px-1">
                <Text size="sm" fw={500} c="dimmed">
                  {isSearchLoading
                    ? 'กำลังค้นหา...'
                    : `พบ ${searchResults.length} ผลลัพธ์สำหรับ "${keyword}"`}
                </Text>
                <Button
                  onClick={clearSearch}
                  variant="light"
                  color="gray"
                  radius="xl"
                  size="xs"
                  leftSection={
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  }
                >
                  ล้างการค้นหา
                </Button>
              </div>

              {isSearchLoading && (
                <div className="flex flex-col items-center gap-3 py-16">
                  <Loader color="orange" />
                  <Text size="sm" c="orange.5">กำลังค้นหา...</Text>
                </div>
              )}

              {!isSearchLoading && searchError && (
                <Alert color="red" variant="light">{searchError}</Alert>
              )}

              {!isSearchLoading && !searchError && searchResults.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-20">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-50">
                    <svg className="h-7 w-7 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <Text size="sm" c="gray.5">ไม่พบโพสต์สำหรับ "{keyword}"</Text>
                </div>
              )}

              {!isSearchLoading && searchResults.length > 0 && (
                <div id="cd-search-result-list" className="space-y-2">
                  {searchResults.map((post, index) => (
                    <Paper
                      component="button"
                      id={`cd-search-item-${index}`}
                      key={post.post_id}
                      onClick={() => { void focusPostInFeed(post.post_id) }}
                      className="flex w-full items-start gap-3 text-left transition-colors hover:border-amber-200 hover:bg-amber-50"
                      radius="xl"
                      withBorder
                      p="md"
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                        <svg className="h-4 w-4 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <Text className="truncate" size="sm" fw={600} c="dark.7">{post.title || 'ไม่มีหัวข้อ'}</Text>
                        <Text mt={4} className="line-clamp-2" size="xs" c="dimmed">{post.content}</Text>
                        <Text mt={6} size="11px" c="gray.5">{formatDateTime(post.created_at)}</Text>
                      </div>
                      <svg className="mt-1 h-4 w-4 shrink-0 text-gray-300" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Paper>
                  ))}
                </div>
              )}
            </ScrollArea>
          ) : (
            /* ── Normal feed ── */
            <ScrollArea
              id="cd-scroll-area"
              viewportRef={feedScrollRef}
              onScrollPositionChange={handleFeedScroll}
              type="hover"
              scrollbars="y"
              className="min-h-0 flex-1"
              classNames={{ viewport: 'pt-3 pb-24' }}
              styles={{
                scrollbar: { background: 'transparent', width: '16px', padding: '2px' },
                thumb: { backgroundColor: '#DB763F', borderRadius: '999px', border: '2px solid transparent', backgroundClip: 'padding-box' },
              }}
            >
              {isLoading && (
                <div id="cd-loading" className="flex flex-col items-center gap-3 py-16">
                  <Loader color="orange" />
                  <Text size="sm" c="orange.5">กำลังโหลดโพสต์...</Text>
                </div>
              )}

              {!isLoading && error && (
                <div id="cd-error" className="flex flex-col items-center gap-4 py-16">
                  <Alert id="cd-error-msg" color="red" variant="light" className="max-w-md">{error}</Alert>
                  <Button id="cd-retry-btn" onClick={refresh} variant="light" color="orange" radius="xl">
                    ลองใหม่
                  </Button>
                </div>
              )}

              {!isLoading && !error && posts.length === 0 && (
                <div id="cd-empty" className="flex flex-col items-center gap-3 py-20">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
                    <svg className="h-7 w-7 text-amber-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <Text id="cd-empty-msg" size="sm" c="gray.5">ยังไม่มีโพสต์ในห้องเรียนนี้</Text>
                  <Button id="cd-empty-create-btn" onClick={openCreatePost} color="orange" radius="xl">
                    สร้างโพสต์แรก
                  </Button>
                </div>
              )}

              {!isLoading && posts.length > 0 && (
                <div id="cd-post-list">
                  {posts.map((post) => (
                    <CardPost
                      key={post.post_id}
                      post={post}
                      highlighted={highlightedPostId === post.post_id}
                      onTap={() => openPost(post)}
                      onEdit={openEdit}
                      onDeleted={removePostOptimistic}
                    />
                  ))}
                  {isLoadingMore && (
                    <div id="cd-load-more-spinner" className="flex justify-center py-4">
                      <Loader color="orange" size="sm" />
                    </div>
                  )}
                  {!hasMore && posts.length > 0 && (
                    <Text id="cd-end-msg" py="md" ta="center" size="xs" c="gray.4">แสดงทั้งหมด {posts.length} โพสต์</Text>
                  )}
                </div>
              )}
            </ScrollArea>
          )}

          {/* Search overlay — mobile */}
          {showSearch && (
            <div id="cd-search-overlay-mobile" className="absolute inset-0 z-50 bg-white xl:hidden">
              <SearchPost
                sectionId={sectionId}
                subjectName={safeSubjectName}
                onClose={() => setShowSearch(false)}
                onSelectPost={(post) => {
                  setShowSearch(false)
                  void focusPostInFeed(post.post_id)
                }}
              />
            </div>
          )}
        </div>

        {/* Mobile: class info popup */}
        {showClassInfo && (
          <div id="cd-class-info-overlay-mobile" className="xl:hidden">
            <ClassInfoPopup
              classInfo={classInfo}
              isLoading={isClassInfoLoading}
              error={classInfoError}
              onClose={() => setShowClassInfo(false)}
            />
          </div>
        )}
      </div>

      {/* ─── CreatePostModal ─── */}
      {showCreatePost && (
        <CreatePostModal
          opened={showCreatePost}
          onClose={() => {
            setShowCreatePost(false)
            setEditingPost(null)
          }}
          sectionId={sectionId}
          subjectName={safeSubjectName}
          editPostId={editingPost?.post_id}
          editPostContentId={editingPost?.post_content_id}
          allowAnonymous={false}
          onSubmitted={() => {
            refresh()
          }}
        />
      )}

      {/* ─── Comment modal ─── */}
      {showCommentPostId && (
        <CommentModal
          opened={!!showCommentPostId}
          onClose={() => setShowCommentPostId(null)}
          sectionId={sectionId}
          postId={showCommentPostId}
          subjectName={safeSubjectName}
          className={className}
        />
      )}
    </div>
  )
}

export default ClassDetail
