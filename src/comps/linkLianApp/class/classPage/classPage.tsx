// ─────────────────────────────────────────────
// comps/linkLianApp/class/ClassPage.tsx
// Component หลักสำหรับหน้า class feed
// id convention: classes-{element}
// ─────────────────────────────────────────────

import React, { useEffect, useCallback, useMemo, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import CardClass from '@/comps/linkLianApp/class/classPage/cardClass';
import FilterSemester from '@/comps/linkLianApp/class/classPage/filterSemester';
import ComposerBar from '@/comps/linkLianApp/class/classPage/composeBar';
import CreatePost from '@/comps/linkLianApp/class/shared/createPost';
import CreatePostModal from '@/comps/linkLianApp/class/shared/createPostModal';
import { useClassFeed } from '@/hooks/social-feed/useClassfeed';
import { ClassFeedItem, PostType } from '@/utils/interface/class.types';

type PostTarget = number | 'all' | null;

const ClassPage = () => {
    const router = useRouter();
    const listRef = useRef<HTMLDivElement>(null);

    const [postTarget, setPostTarget] = useState<PostTarget>('all');
    const [showCreatePopup, setShowCreatePopup] = useState(false);
    const selectedPostType: PostType = 'announcement';

    const {
        classList,
        semesters,
        activeSemesterId,
        setActiveSemesterId,
        isLoading,
        isLoadingMore,
        isSemesterLoading,
        error,
        semesterError,
        hasMore,
        loadMore,
        refresh,
    } = useClassFeed();

    useEffect(() => {
        if (classList.length === 0) {
            setPostTarget('all');
            return;
        }
        if (postTarget === 'all') return;
        const exists = classList.some((item) => item.section_id === postTarget);
        if (!exists) setPostTarget(classList[0].section_id);
    }, [classList, postTarget]);

    const selectedClass = useMemo(
        () => classList.find((item) => item.section_id === postTarget) ?? null,
        [classList, postTarget],
    );

    const handleScroll = useCallback(() => {
        if (!listRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = listRef.current;
        if (scrollHeight - scrollTop - clientHeight < 200 && hasMore && !isLoadingMore) loadMore();
    }, [hasMore, isLoadingMore, loadMore]);

    const openClassDetail = (item: ClassFeedItem) => {
        const safeSubjectName =
            item.subject_name_th ||
            item.subject_name_en ||
            item.subject_code ||
            '';

        router.push({
            pathname: '/classes/classDetail',
            query: {
                sectionId: item.section_id,
                subjectName: safeSubjectName,
                className: item.display_class_name,
            },
        });
    };

    return (
        <div id="classes-page" className="relative h-full w-full bg-[#fafafa] px-4 pb-6 pt-4 text-black md:px-6">
        <div id="classes-content" className="mx-auto flex h-full w-full flex-col">

                {/* Composer */}
                <ComposerBar
                    classList={classList}
                    postTarget={postTarget}
                    onTargetChange={setPostTarget}
                    onOpenCreate={() => {
                        if (postTarget !== null) setShowCreatePopup(true);
                    }}
                />

                <div
                    id="classes-header"
                    className="mb-3 flex justify-end bg-[#fafafa] pb-2"
                >
                    <FilterSemester
                        semesters={semesters}
                        activeSemesterId={activeSemesterId}
                        onChange={setActiveSemesterId}
                        isLoading={isSemesterLoading}
                    />
                </div>


                {(isLoading && classList.length === 0) && (
                    <div id="classes-loading" className="flex flex-1 flex-col items-center justify-center gap-3">
                        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-amber-200 border-t-amber-500" />
                        <p className="text-sm text-amber-400">กำลังโหลดห้องเรียน...</p>
                    </div>
                )}

                {!isSemesterLoading && !isLoading && (semesterError || error) && (
                    <div id="classes-error" className="flex flex-1 flex-col items-center justify-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                            <svg className="h-8 w-8 text-red-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                        </div>
                        <p id="classes-error-msg" className="text-center text-sm text-gray-500">{semesterError ?? error}</p>
                        <button
                            id="classes-retry-btn"
                            onClick={refresh}
                            className="rounded-full bg-amber-100 px-5 py-2 text-sm font-medium text-amber-800 hover:bg-amber-200"
                        >
                            ลองใหม่
                        </button>
                    </div>
                )}

                {!isSemesterLoading && !isLoading && !semesterError && !error && classList.length === 0 && (
                    <div id="classes-empty" className="flex flex-col items-center justify-center py-20">
                        <div className="mt-10 flex flex-col items-center justify-center gap-3">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
                                <svg className="h-8 w-8 text-amber-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                                </svg>
                            </div>
                            <p id="classes-empty-msg" className="text-sm text-gray-400">ไม่มีห้องเรียนในภาคเรียนนี้</p>
                        </div>
                    </div>
                )}

                {!isSemesterLoading && !isLoading && !semesterError && !error && classList.length > 0 && (
                    <div
                        id="classes-list"
                        ref={listRef}
                        onScroll={handleScroll}
                        className="flex-1 overflow-y-auto pb-6"
                    >
                        <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
                            {classList.map((item) => (
                                <CardClass key={item.section_id} data={item} onTap={() => openClassDetail(item)} />
                            ))}
                        </div>

                        {isLoadingMore && (
                            <div id="classes-load-more-spinner" className="flex justify-center py-4">
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-200 border-t-amber-500" />
                            </div>
                        )}

                        {!hasMore && classList.length > 0 && (
                            <p id="classes-end-msg" className="py-6 text-center text-xs text-gray-300">
                                แสดงทั้งหมด {classList.length} ห้องเรียน
                            </p>
                        )}
                    </div>
                )}
            </div>

            {showCreatePopup && postTarget && (
                <CreatePostModal>
                    <CreatePost
                        sectionId={postTarget === 'all' ? classList[0]?.section_id ?? 0 : postTarget}
                        sectionIds={postTarget === 'all' ? classList.map((item) => item.section_id) : undefined}
                        subjectName={postTarget === 'all' ? 'โพสต์ทุกคลาส' : selectedClass?.subject_name_th}
                        initialPostType={selectedPostType}
                        allowAnonymous={false}
                        onClose={() => setShowCreatePopup(false)}
                        onSubmitted={() => setShowCreatePopup(false)}
                    />
                </CreatePostModal>
            )}
        </div>
    );
};

export default ClassPage;
