'use client';

import { useState, useCallback } from 'react';
import { ADMIN_PAGE_SIZE } from '../constants/pagination';

/**
 * Shared state for admin list tables: current page, page size, and handler that resets to page 1 when size changes.
 */
export function usePagedTableState(initialSize = ADMIN_PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialSize);

  const handlePageSizeChange = useCallback((next) => {
    setPageSize(next);
    setPage(1);
  }, []);

  return { page, setPage, pageSize, handlePageSizeChange };
}
