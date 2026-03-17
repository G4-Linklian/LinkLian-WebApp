// ─────────────────────────────────────────────
// hooks/usePosts.ts
// Hook สำหรับดึง posts ใน class + filter by type
// ─────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from 'react';
import { getPostById, getPostsInClass, searchPosts } from '@/utils/api/social-feed/post';
import { PostItem, PostType } from '@/utils/interface/class.types';

interface UsePostsReturn {
    posts: PostItem[];
    isLoading: boolean;
    isLoadingMore: boolean;
    error: string | null;
    hasMore: boolean;
    filterType: PostType | 'all';
    setFilterType: (type: PostType | 'all') => void;
    loadMore: () => void;
    refresh: () => Promise<void>;
    removePostOptimistic: (postId: number) => void;
    ensurePostInFeed: (postId: number) => Promise<boolean>;
}

const LIMIT = 10;
const NEW_POST_POLL_INTERVAL = 15000;

const normalizePosts = (input: unknown): PostItem[] => {
    if (!Array.isArray(input)) return [];
    return input.filter((item): item is PostItem => {
        const postId = Number((item as any)?.post_id);
        const contentId = Number((item as any)?.post_content_id);
        return Number.isFinite(postId) && postId > 0 && Number.isFinite(contentId) && contentId > 0;
    });
};

export const usePosts = (sectionId: number): UsePostsReturn => {
    const [posts, setPosts] = useState<PostItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const [filterType, setFilterTypeState] = useState<PostType | 'all'>('all');
    const postsRef = useRef<PostItem[]>([]);
    const offsetRef = useRef(0);
    const filterTypeRef = useRef<PostType | 'all'>('all');

    useEffect(() => {
        postsRef.current = posts;
    }, [posts]);

    useEffect(() => {
        offsetRef.current = offset;
    }, [offset]);

    useEffect(() => {
        filterTypeRef.current = filterType;
    }, [filterType]);

    const fetchPosts = useCallback(
        async (opts: { reset?: boolean; type?: PostType | 'all' } = {}) => {
            if (!sectionId) return;

            const currentOffset = opts.reset ? 0 : offset;
            const isFirstLoad = opts.reset || currentOffset === 0;
            const targetType =
                opts.type !== undefined ? opts.type : filterType;

            const apiType: PostType | undefined =
                targetType === 'all' ? undefined : targetType;

            if (isFirstLoad) {
                setIsLoading(true);
            } else {
                setIsLoadingMore(true);
            }

            setError(null);

            try {
                const res = await getPostsInClass({
                    section_id: sectionId,
                    type: apiType,
                    limit: LIMIT,
                    offset: currentOffset,
                });

                if (res.success) {
                    const newPosts = normalizePosts(res.data);
                    setPosts((prev) =>
                        isFirstLoad ? newPosts : [...prev, ...newPosts],
                    );
                    setHasMore(newPosts.length === LIMIT);
                    setOffset(currentOffset + newPosts.length);
                } else {
                    setError('ไม่สามารถโหลดโพสต์ได้');
                }
            } catch (err) {
                console.error('[usePosts] fetch error:', err);

                // Temporary client-side fallback:
                // some backend versions may fail on list fetch when a row contains invalid post_id.
                try {
                    const fallback = await searchPosts({
                        section_id: sectionId,
                        keyword: ' ',
                        limit: LIMIT,
                        offset: currentOffset,
                    });

                    if (fallback?.success) {
                        const fallbackPosts = normalizePosts(fallback.data);
                        setPosts((prev) =>
                            isFirstLoad ? fallbackPosts : [...prev, ...fallbackPosts],
                        );
                        setHasMore(fallbackPosts.length === LIMIT);
                        setOffset(currentOffset + fallbackPosts.length);
                        setError(null);
                        return;
                    }
                } catch (fallbackErr) {
                    console.error('[usePosts] fallback search error:', fallbackErr);
                }

                setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
            } finally {
                setIsLoading(false);
                setIsLoadingMore(false);
            }
        },
        [sectionId, offset, filterType],
    );

    // โหลดครั้งแรก
    useEffect(() => {
        if (sectionId) {
            setOffset(0);
            setPosts([]);
            fetchPosts({ reset: true, type: filterType });
        }
    }, [sectionId]);

    // เมื่อ filter เปลี่ยน → reset
    const setFilterType = (type: PostType | 'all') => {
        setFilterTypeState(type);
        setOffset(0);
        setPosts([]);
        fetchPosts({
            reset: true,
            type,
        });
    };

    const loadMore = () => {
        if (!isLoadingMore && hasMore) {
            fetchPosts();
        }
    };

    const refresh = async () => {
        setOffset(0);
        await fetchPosts({ reset: true });
    };

    // ลบ post ออก optimistically (ไม่ต้องรอ API)
    const removePostOptimistic = (postId: number) => {
        setPosts((prev) => prev.filter((p) => p.post_id !== postId));
    };

    const ensurePostInFeed = async (postId: number): Promise<boolean> => {
        if (!Number.isFinite(postId) || postId <= 0) return false;
        if (posts.some((post) => post.post_id === postId)) return true;

        try {
            const res = await getPostById(postId);
            if (!res?.success || !res?.data) return false;

            const targetPost = res.data;
            setPosts((prev) => {
                const exists = prev.some((post) => post.post_id === targetPost.post_id);
                if (exists) {
                    return prev.map((post) =>
                        post.post_id === targetPost.post_id ? targetPost : post,
                    );
                }
                return [targetPost, ...prev];
            });

            return true;
        } catch (err) {
            console.error('[usePosts] ensure post error:', err);
            return false;
        }
    };

    useEffect(() => {
        if (!sectionId) return;

        const checkForNewPosts = async () => {
            if (document.hidden) return;
            if (isLoading || isLoadingMore) return;

            const activeFilter = filterTypeRef.current;
            const apiType: PostType | undefined = activeFilter === 'all' ? undefined : activeFilter;

            try {
                const res = await getPostsInClass({
                    section_id: sectionId,
                    type: apiType,
                    limit: LIMIT,
                    offset: 0,
                });

                if (!res?.success) return;

                const latestPosts = normalizePosts(res.data);
                if (latestPosts.length === 0) return;

                const currentPosts = postsRef.current;
                const currentIds = new Set(currentPosts.map((post) => post.post_id));
                const unseenPosts = latestPosts.filter((post) => !currentIds.has(post.post_id));

                if (unseenPosts.length === 0) {
                    setPosts((prev) =>
                        prev.map((post) => latestPosts.find((candidate) => candidate.post_id === post.post_id) ?? post),
                    );
                    return;
                }

                setPosts((prev) => {
                    const merged = [...unseenPosts, ...prev];
                    const seen = new Set<number>();
                    return merged.filter((post) => {
                        if (seen.has(post.post_id)) return false;
                        seen.add(post.post_id);
                        return true;
                    });
                });
                setOffset(offsetRef.current + unseenPosts.length);
                offsetRef.current += unseenPosts.length;
            } catch (err) {
                console.error('[usePosts] poll new posts error:', err);
            }
        };

        const intervalId = window.setInterval(() => {
            void checkForNewPosts();
        }, NEW_POST_POLL_INTERVAL);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [sectionId, isLoading, isLoadingMore]);

    return {
        posts,
        isLoading,
        isLoadingMore,
        error,
        hasMore,
        filterType,
        setFilterType,
        loadMore,
        refresh,
        removePostOptimistic,
        ensurePostInFeed,
    };
};
