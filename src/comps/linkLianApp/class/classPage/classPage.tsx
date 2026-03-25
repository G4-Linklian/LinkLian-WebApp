// ─────────────────────────────────────────────
// comps/linkLianApp/class/ClassPage.tsx
// Component หลักสำหรับหน้า class feed
// id convention: classes-{element}
// ─────────────────────────────────────────────

import React, { useEffect, useCallback, useMemo, useState, useRef } from 'react';
import { Alert, Button, Loader, ScrollArea, Text } from '@mantine/core';
import { useRouter } from 'next/router';
import CardClass from '@/comps/linkLianApp/class/classPage/cardClass';
import FilterSemester from '@/comps/linkLianApp/class/classPage/filterSemester';
import ComposerBar from '@/comps/linkLianApp/class/classPage/composeBar';
import CreatePostModal from '@/comps/linkLianApp/shared/createPostModal';
import { useClassFeed } from '@/hooks/social-feed/useClassfeed';
import { ClassFeedItem, PostType } from '@/utils/interface/class.types';

type PostTarget = number[];

const ClassPage = () => {
    const router = useRouter();
    const listRef = useRef<HTMLDivElement>(null);

    const [postTarget, setPostTarget] = useState<PostTarget>([]);
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
            setPostTarget([]);
            return;
        }

        const validIds = new Set(classList.map((item) => item.section_id));
        setPostTarget((prev) => {
            const next = prev.filter((id) => validIds.has(id));
            return next.length > 0 ? next : classList.map((item) => item.section_id);
        });
    }, [classList]);

    const selectedClasses = useMemo(
        () => classList.filter((item) => postTarget.includes(item.section_id)),
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
        <div id="classes-content" className="mx-auto flex h-full w-full max-w-[1500px] flex-col">

                {/* Composer */}
                <ComposerBar
                    classList={classList}
                    postTarget={postTarget}
                    onTargetChange={setPostTarget}
                    onOpenCreate={() => {
                        if (postTarget.length > 0) setShowCreatePopup(true);
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
                        <Loader color="orange" size="lg" />
                        <Text size="sm" c="orange.6">กำลังโหลดห้องเรียน...</Text>
                    </div>
                )}

                {!isSemesterLoading && !isLoading && (semesterError || error) && (
                    <div id="classes-error" className="flex flex-1 flex-col items-center justify-center gap-4">
                        <Alert id="classes-error-msg" color="red" radius="lg" variant="light" className="max-w-md">
                            {semesterError ?? error}
                        </Alert>
                        <Button
                            id="classes-retry-btn"
                            onClick={refresh}
                            color="orange"
                            variant="light"
                            radius="xl"
                        >
                            ลองใหม่
                        </Button>
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
                    <ScrollArea
                        id="classes-list"
                        viewportRef={listRef}
                        onScrollPositionChange={handleScroll}
                        type="hover"
                        scrollbars="y"
                        className="min-h-0 flex-1"
                        classNames={{ viewport: 'pb-6' }}
                        styles={{
                            scrollbar: { background: 'transparent', width: '10px', padding: '2px' },
                            thumb: { backgroundColor: '#DB763F', borderRadius: '999px', border: '2px solid transparent', backgroundClip: 'padding-box' },
                        }}
                    >
                        <div className="mx-auto grid w-full gap-x-6 gap-y-4 md:w-[75%] md:grid-cols-2">
                            {classList.map((item) => (
                                <CardClass key={item.section_id} data={item} onTap={() => openClassDetail(item)} />
                            ))}
                        </div>

                        {isLoadingMore && (
                            <div id="classes-load-more-spinner" className="flex justify-center py-4">
                                <Loader color="orange" size="sm" />
                            </div>
                        )}

                        {!hasMore && classList.length > 0 && (
                            <p id="classes-end-msg" className="py-6 text-center text-xs text-gray-300">
                                แสดงทั้งหมด {classList.length} ห้องเรียน
                            </p>
                        )}
                    </ScrollArea>
                )}
            </div>

            {showCreatePopup && postTarget.length > 0 && (
                <CreatePostModal
                    opened={showCreatePopup}
                    onClose={() => setShowCreatePopup(false)}
                    sectionId={postTarget[0] ?? 0}
                    sectionIds={postTarget}
                    subjectName={
                        selectedClasses.length === classList.length
                            ? 'โพสต์ทุกคลาส'
                            : selectedClasses.length === 1
                                ? selectedClasses[0]?.subject_name_th
                                : `${selectedClasses.length} ห้องเรียน`
                    }
                    initialPostType={selectedPostType}
                    allowAnonymous={false}
                    onSubmitted={() => setShowCreatePopup(false)}
                />
            )}
        </div>
    );
};

export default ClassPage;
