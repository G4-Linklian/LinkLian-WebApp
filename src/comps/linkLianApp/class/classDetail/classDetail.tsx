// ─────────────────────────────────────────────
// comps/linkLianApp/class/ClassDetail.tsx
// Component หน้า class detail — header, side panels, post list
// id convention: cd-{element}
// ─────────────────────────────────────────────

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import CardPost from '@/comps/linkLianApp/class/classDetail/cardPost'
import FilterPost from '@/comps/linkLianApp/class/classDetail/filterPost'
import CreatePost from '@/comps/linkLianApp/class/shared/createPost'
import CreatePostModal from '@/comps/linkLianApp/class/shared/createPostModal'
import CommentPage from '@/comps/linkLianApp/class/classDetail/commentPage'
import SearchPost from '@/comps/linkLianApp/class/classDetail/searchPost'
import ClassInfoPopup from '@/comps/linkLianApp/class/classDetail/classInfoPopup'
import { usePosts } from '@/hooks/social-feed/usePost'
import { useClassInfo } from '@/hooks/social-feed/useClassinfo'
import { useSearchPosts } from '@/hooks/social-feed/useSearchpost'
import { ClassSchedule, PostItem } from '@/utils/interface/class.types'
import { dayOfWeekToText, formatDateTime, formatTime } from '@/utils/function/classHelper'
import { useAuthIdentity } from '@/hooks/useAuthIdentity'
import { getSection } from '@/utils/api/section'

const HEADER_FULL = 210
const HEADER_MIN = 0

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
          backgroundImage: `url('${process.env.NEXT_PUBLIC_CLASS_DETAIL_BG_IMAGE}')`,
          transform: `scale(${1 + scrollRatio * 0.05})`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />

      <div id="cd-header-top-row" className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between gap-3 px-4 pt-3" style={{ opacity: Math.max(0, titleOpacity) }}>
        <div id="cd-header-nav-breadcrumb-row" className="flex min-w-0 items-center gap-2 text-xs text-white/90">
          <button
            id="cd-back-btn"
            aria-label="ย้อนกลับ"
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span id="cd-header-breadcrumb-home">ห้องเรียน</span>
          <span>/</span>
          <span id="cd-header-breadcrumb-subject" className="truncate">{subjectName}</span>
          <span id="cd-header-breadcrumb-class" className="truncate">{className}</span>
        </div>

        <div id="cd-header-actions" className="flex shrink-0 items-center gap-2">
          <button
            id="cd-class-info-btn"
            aria-label="ข้อมูลห้องเรียน"
            onClick={onShowClassInfo}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 xl:hidden"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            id="cd-search-btn"
            aria-label="ค้นหาโพสต์"
            onClick={onSearch}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 xl:hidden"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button
            id="cd-create-post-btn"
            aria-label="สร้างโพสต์"
            onClick={onCreatePost}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg hover:bg-amber-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      <div id="cd-header-collapsed-title" className="absolute bottom-3 left-0 right-0 px-4" style={{ opacity: collapsedOpacity }}>
        <p className="truncate text-center text-sm font-semibold text-white drop-shadow">{mainTitle}</p>
      </div>

      <div id="cd-header-expanded-info" className="absolute bottom-0 left-0 right-0 px-4 pb-4" style={{ opacity: Math.max(0, titleOpacity) }}>
        <p id="cd-header-main-title" className="text-3xl font-bold leading-tight text-white drop-shadow-md">{mainTitle}</p>
        <p id="cd-header-sub-title" className="mt-0.5 text-sm text-white/80">{subTitle}</p>
        {schedules.length > 0 && (
          <div id="cd-header-schedules" className="mt-2 flex flex-wrap gap-1.5">
            {schedules.map((s, i) => (
              <span
                key={i}
                id={`cd-header-schedule-chip-${i}`}
                className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm"
              >
                {dayOfWeekToText(s.day_of_week, true)} {formatTime(s.start_time)}–{formatTime(s.end_time)}
                {s.room?.room_number ? ` • ${s.room.room_number}` : ''}
              </span>
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
  const [pendingFocusPostId, setPendingFocusPostId] = useState<number | null>(null)
  const [focusSignal, setFocusSignal] = useState(0)

  const { classInfo, isLoading: isClassInfoLoading, error: classInfoError } = useClassInfo(sectionId)
  const { roleName } = useAuthIdentity()
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
          <div
            id="cd-class-info-panel"
            ref={classInfoRef}
            className="h-full overflow-y-auto rounded-2xl border border-gray-100 bg-white p-4 shadow-sm [scrollbar-width:thin] [scrollbar-color:#DB763F_#F8E7DA] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#F8E7DA] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#DB763F] [&::-webkit-scrollbar-thumb]:shadow-[0_0_0_2px_#fff]"
          >
            <h3 id="cd-class-info-title" className="mb-2 text-sm font-semibold text-gray-900">ข้อมูลห้องเรียน</h3>
            {isClassInfoLoading && <p id="cd-class-info-loading" className="text-xs text-gray-500">กำลังโหลดข้อมูล...</p>}
            {!isClassInfoLoading && classInfoError && <p id="cd-class-info-error" className="text-xs text-red-500">{classInfoError}</p>}
            {!isClassInfoLoading && !classInfoError && (
              <div id="cd-class-info-content" className="space-y-5">

                <section id="cd-class-info-subject-section">
                  <p className="mb-1 text-xs font-semibold text-gray-500">วิชา</p>
                  <p className="text-sm text-gray-700">{safeSubjectName || 'ไม่ระบุ'}</p>
                </section>

                <section id="cd-class-info-schedules-section">
                  <p className="mb-2 text-xs font-semibold text-gray-500">ห้องเรียนตามวัน</p>
                  <div className="space-y-2">
                    {schedulesByDay.map(([day, rows]) => (
                      <div key={day} className="rounded-xl bg-gray-50 p-2">
                        <p className="text-xs font-semibold text-gray-700">{day}</p>
                        <div className="mt-1 space-y-1">
                          {rows.map((row) => (
                            <p key={`${day}-${row}`} className="text-[11px] text-gray-500">{row}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                    {schedulesByDay.length === 0 && (
                      <p className="text-xs text-gray-400">ไม่มีข้อมูลตารางเรียน</p>
                    )}
                  </div>
                </section>

                <section id="cd-class-info-educators-section">
                  <p className="mb-2 text-xs font-semibold text-gray-500">
                    ผู้สอน ({classInfo?.educators?.length ?? 0})
                  </p>
                  <div className="space-y-2">
                    {(classInfo?.educators ?? []).map((educator) => (
                      <div key={educator.user_sys_id} className="flex items-center gap-2 rounded-xl bg-gray-50 p-2">
                        {educator.profile_pic ? (
                          <img src={educator.profile_pic} alt={educator.display_name} className="h-9 w-9 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                            {(educator.display_name || '?').charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-gray-800">
                            {educator.display_name || 'ไม่ระบุชื่อ'}
                            {educator.is_main_teacher ? ' (ผู้สอนหลัก)' : ''}
                          </p>
                          <p className="truncate text-[11px] text-gray-500">รหัส: {educator.user_sys_id}</p>
                        </div>
                      </div>
                    ))}
                    {(classInfo?.educators?.length ?? 0) === 0 && (
                      <p className="text-xs text-gray-400">ไม่มีข้อมูลผู้สอน</p>
                    )}
                  </div>
                </section>

                <section id="cd-class-info-members-section">
                  <p className="mb-2 text-xs font-semibold text-gray-500">
                    สมาชิก ({classInfo?.members?.length ?? 0})
                  </p>
                  <div className="max-h-64 space-y-2 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#DB763F_#F8E7DA] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#F8E7DA] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#DB763F]">
                    {(classInfo?.members ?? []).map((member) => (
                      <div key={member.user_sys_id} className="flex items-center gap-2 rounded-xl bg-gray-50 p-2">
                        {member.profile_pic ? (
                          <img src={member.profile_pic} alt={member.display_name} className="h-9 w-9 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-700">
                            {(member.display_name || '?').charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-gray-800">{member.display_name || 'ไม่ระบุชื่อ'}</p>
                          <p className="truncate text-[11px] text-gray-500">รหัส: {member.student_code || member.user_sys_id}</p>
                        </div>
                      </div>
                    ))}
                    {(classInfo?.members?.length ?? 0) === 0 && (
                      <p className="text-xs text-gray-400">ไม่มีสมาชิก</p>
                    )}
                  </div>
                </section>

              </div>
            )}
          </div>
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
            onBack={() => router.back()}
            onSearch={() => setShowSearch(true)}
            onShowClassInfo={() => setShowClassInfo(true)}
            onCreatePost={openCreatePost}
          />

          {/* Search bar — desktop only */}
          <div
            id="cd-search-bar"
            className="mt-3 hidden shrink-0 items-center gap-2 rounded-2xl border border-gray-100 bg-white px-4 py-2.5 shadow-sm xl:flex"
          >
            <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="cd-search-input"
              ref={searchInputRef}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="ค้นหาโพสต์ในห้องเรียนนี้..."
              className="w-full border-none bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
            />
            {keyword && (
              <button
                onClick={clearSearch}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filter bar — ซ่อนตอน search mode */}
          {!isSearchMode && (
            <div id="cd-filter-bar" className="mt-3 flex shrink-0 items-center justify-between rounded-2xl border border-gray-100 bg-white px-4 py-2.5 shadow-sm">
              <p id="cd-filter-label" className="truncate text-sm font-medium text-gray-500">โพสต์ทั้งหมด</p>
              <FilterPost value={filterType} onChange={setFilterType} />
            </div>
          )}

          {/* ── Search mode: แสดง results แทน feed ── */}
          {isSearchMode ? (
            <div
              id="cd-search-results-area"
              className="flex-1 overflow-y-auto pt-3 pb-24 [scrollbar-width:thin] [scrollbar-color:#DB763F_#F8E7DA] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#F8E7DA] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#DB763F] [&::-webkit-scrollbar-thumb]:shadow-[0_0_0_2px_#fff]"
            >
              {/* header แถบ results */}
              <div className="mb-3 flex items-center justify-between px-1">
                <p className="text-sm font-medium text-gray-500">
                  {isSearchLoading
                    ? 'กำลังค้นหา...'
                    : `พบ ${searchResults.length} ผลลัพธ์สำหรับ "${keyword}"`}
                </p>
                <button
                  onClick={clearSearch}
                  className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500 hover:bg-gray-200"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  ล้างการค้นหา
                </button>
              </div>

              {isSearchLoading && (
                <div className="flex flex-col items-center gap-3 py-16">
                  <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-amber-200 border-t-amber-500" />
                  <p className="text-sm text-amber-400">กำลังค้นหา...</p>
                </div>
              )}

              {!isSearchLoading && searchError && (
                <p className="py-4 text-center text-sm text-red-400">{searchError}</p>
              )}

              {!isSearchLoading && !searchError && searchResults.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-20">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-50">
                    <svg className="h-7 w-7 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-400">ไม่พบโพสต์สำหรับ "{keyword}"</p>
                </div>
              )}

              {!isSearchLoading && searchResults.length > 0 && (
                <div id="cd-search-result-list" className="space-y-2">
                  {searchResults.map((post, index) => (
                    <button
                      id={`cd-search-item-${index}`}
                      key={post.post_id}
                      onClick={() => { void focusPostInFeed(post.post_id) }}
                      className="flex w-full items-start gap-3 rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition-colors hover:border-amber-200 hover:bg-amber-50"
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                        <svg className="h-4 w-4 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-800">{post.title || 'ไม่มีหัวข้อ'}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-gray-500">{post.content}</p>
                        <p className="mt-1.5 text-[11px] text-gray-400">{formatDateTime(post.created_at)}</p>
                      </div>
                      <svg className="mt-1 h-4 w-4 shrink-0 text-gray-300" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* ── Normal feed ── */
            <div
              id="cd-scroll-area"
              ref={feedScrollRef}
              onScroll={handleFeedScroll}
              className="flex-1 overflow-y-auto pt-4 pb-24 [scrollbar-width:thin] [scrollbar-color:#DB763F_#F8E7DA] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#F8E7DA] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#DB763F] [&::-webkit-scrollbar-thumb]:shadow-[0_0_0_2px_#fff]"
            >
              {isLoading && (
                <div id="cd-loading" className="flex flex-col items-center gap-3 py-16">
                  <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-amber-200 border-t-amber-500" />
                  <p className="text-sm text-amber-400">กำลังโหลดโพสต์...</p>
                </div>
              )}

              {!isLoading && error && (
                <div id="cd-error" className="flex flex-col items-center gap-4 py-16">
                  <p id="cd-error-msg" className="text-center text-sm text-gray-500">{error}</p>
                  <button id="cd-retry-btn" onClick={refresh} className="rounded-full bg-amber-100 px-5 py-2 text-sm font-medium text-amber-800 hover:bg-amber-200">
                    ลองใหม่
                  </button>
                </div>
              )}

              {!isLoading && !error && posts.length === 0 && (
                <div id="cd-empty" className="flex flex-col items-center gap-3 py-20">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
                    <svg className="h-7 w-7 text-amber-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <p id="cd-empty-msg" className="text-sm text-gray-400">ยังไม่มีโพสต์ในห้องเรียนนี้</p>
                  <button id="cd-empty-create-btn" onClick={openCreatePost} className="rounded-full bg-amber-500 px-5 py-2 text-sm font-medium text-white shadow hover:bg-amber-600">
                    สร้างโพสต์แรก
                  </button>
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
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-200 border-t-amber-500" />
                    </div>
                  )}
                  {!hasMore && posts.length > 0 && (
                    <p id="cd-end-msg" className="py-4 text-center text-xs text-gray-300">แสดงทั้งหมด {posts.length} โพสต์</p>
                  )}
                </div>
              )}
            </div>
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
        <CreatePostModal>
          <div id="cd-create-overlay" className="h-full">
            <CreatePost
              sectionId={sectionId}
              subjectName={safeSubjectName}
              editPostId={editingPost?.post_id}
              editPostContentId={editingPost?.post_content_id}
              allowAnonymous={false}
              onClose={() => {
                setShowCreatePost(false)
                setEditingPost(null)
              }}
              onSubmitted={() => {
                refresh()
              }}
            />
          </div>
        </CreatePostModal>
      )}

      {/* ─── Comment modal ─── */}
      {showCommentPostId && (
        <div id="cd-comment-overlay" className="fixed inset-x-0 bottom-0 top-[60px] z-[9000] bg-black/35 p-3 backdrop-blur-[1px] md:p-6">
          <div id="cd-comment-modal" className="mx-auto flex h-full w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <CommentPage
              sectionId={sectionId}
              postId={showCommentPostId}
              subjectName={safeSubjectName}
              className={className}
              isPopup
              onClose={() => setShowCommentPostId(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ClassDetail