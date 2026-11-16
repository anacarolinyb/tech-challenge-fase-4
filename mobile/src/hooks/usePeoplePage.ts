import { useCallback, useRef, useState } from 'react';

import { getErrorMessage } from '../services/api';
import { peopleServices } from '../services/peopleService';
import type { Paginated, PersonKind, User } from '../types';

export const PEOPLE_PAGE_SIZE = 5;

/**
 * Listagem paginada (por páginas numeradas) de professores ou alunos.
 * Quando a busca muda, volta para a página 1.
 */
export function usePeoplePage(kind: PersonKind, query: string) {
  const service = peopleServices[kind];
  const [result, setResult] = useState<Paginated<User> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestRef = useRef(0);
  const pageRef = useRef(1);
  const lastQueryRef = useRef(query);

  const fetchPage = useCallback(
    async (requestedPage: number) => {
      let target = requestedPage;
      if (lastQueryRef.current !== query) {
        lastQueryRef.current = query;
        target = 1;
      }

      const requestId = ++requestRef.current;
      setLoading(true);

      try {
        const params = { limit: PEOPLE_PAGE_SIZE, q: query || undefined };
        let data = await service.list({ ...params, page: target });

        // Ex.: excluiu o único item da última página -> mostra a nova última página
        if (data.data.length === 0 && target > 1 && data.total > 0) {
          data = await service.list({ ...params, page: data.totalPages });
        }

        if (requestId !== requestRef.current) return;
        pageRef.current = data.page;
        setResult(data);
        setError(null);
      } catch (err) {
        if (requestId === requestRef.current) setError(getErrorMessage(err));
      } finally {
        if (requestId === requestRef.current) setLoading(false);
      }
    },
    [service, query],
  );

  const reload = useCallback(() => fetchPage(pageRef.current), [fetchPage]);
  const goToPage = useCallback((page: number) => fetchPage(page), [fetchPage]);

  return {
    people: result?.data ?? [],
    page: result?.page ?? 1,
    totalPages: result?.totalPages ?? 1,
    total: result?.total ?? 0,
    hasLoaded: result !== null,
    loading,
    error,
    reload,
    goToPage,
  };
}
