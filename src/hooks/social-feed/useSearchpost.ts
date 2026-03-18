// ─────────────────────────────────────────────
// hooks/useSearchPosts.ts
// Hook สำหรับ search posts ด้วย debounce
// ─────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from 'react';
import { searchPosts } from '@/utils/api/social-feed/post';
import { PostItem } from '@/utils/interface/class.types';

interface UseSearchPostsReturn {
  results: PostItem[];
  isLoading: boolean;
  error: string | null;
  keyword: string;
  setKeyword: (kw: string) => void;
  clear: () => void;
}

const DEBOUNCE_MS = 400;

export const useSearchPosts = (sectionId?: number): UseSearchPostsReturn => {
  const [results, setResults] = useState<PostItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeywordState] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(
    async (kw: string) => {
      if (!kw.trim()) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const res = await searchPosts({
          keyword: kw.trim(),
          section_id: sectionId,
          limit: 50,
          offset: 0,
        });

        if (res.success) {
          setResults(res.data ?? []);
        } else {
          setError('ค้นหาไม่สำเร็จ กรุณาลองใหม่');
        }
      } catch (err) {
        console.error('[useSearchPosts] search error:', err);
        setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
      } finally {
        setIsLoading(false);
      }
    },
    [sectionId],
  );

  const setKeyword = (kw: string) => {
    setKeywordState(kw);

    // debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!kw.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceRef.current = setTimeout(() => {
      search(kw);
    }, DEBOUNCE_MS);
  };

  const clear = () => {
    setKeywordState('');
    setResults([]);
    setError(null);
    setIsLoading(false);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  };

  // cleanup
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    results,
    isLoading,
    error,
    keyword,
    setKeyword,
    clear,
  };
};
