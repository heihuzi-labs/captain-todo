// TanStack Query - 查询定义
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { queryKeys } from './queryClient';
import { kanbanApi, projectsApi } from '../api';

/**
 * 获取所有项目
 */
export function useProjectsQuery() {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: () => projectsApi.getAll(),
    placeholderData: keepPreviousData,
  });
}

/**
 * 获取当前项目ID
 */
export function useCurrentProjectQuery() {
  return useQuery({
    queryKey: queryKeys.currentProject,
    queryFn: () => projectsApi.getCurrentId(),
  });
}

/**
 * 获取看板数据
 */
export function useBoardQuery(projectId: string | null) {
  return useQuery({
    queryKey: queryKeys.board(projectId || ''),
    queryFn: () => kanbanApi.getBoard(projectId!),
    enabled: !!projectId,
    placeholderData: keepPreviousData,
  });
}
