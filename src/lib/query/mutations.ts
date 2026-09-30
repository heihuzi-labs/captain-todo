// TanStack Query - 变更定义
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryClient';
import { kanbanApi, projectsApi } from '../api';
import type { Card, Column, Project } from '@/types/kanban';
import type { MoveCardParams } from '../api';

// ==================== 项目相关变更 ====================

/**
 * 创建项目
 */
export function useCreateProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (project: Partial<Project> & { name: string }) =>
      projectsApi.create(project),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
}

/**
 * 更新项目
 */
export function useUpdateProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (project: Project) => projectsApi.update(project),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
}

/**
 * 删除项目
 */
export function useDeleteProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => projectsApi.delete(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
      queryClient.invalidateQueries({ queryKey: queryKeys.currentProject });
    },
  });
}

/**
 * 设置当前项目
 */
export function useSetCurrentProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => projectsApi.setCurrent(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.currentProject });
    },
  });
}

// ==================== 卡片相关变更 ====================

/**
 * 创建卡片
 */
export function useCreateCardMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (card: Partial<Card> & { columnId: string; title: string }) =>
      kanbanApi.createCard(projectId, card),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.board(projectId) });
    },
  });
}

/**
 * 更新卡片
 */
export function useUpdateCardMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (card: Card) => kanbanApi.updateCard(projectId, card),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.board(projectId) });
    },
  });
}

/**
 * 删除卡片
 */
export function useDeleteCardMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cardId: string) => kanbanApi.deleteCard(projectId, cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.board(projectId) });
    },
  });
}

/**
 * 移动卡片
 */
export function useMoveCardMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: MoveCardParams) => kanbanApi.moveCard(projectId, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.board(projectId) });
    },
  });
}

// ==================== 列相关变更 ====================

/**
 * 创建列
 */
export function useCreateColumnMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (column: Partial<Column> & { title: string }) =>
      kanbanApi.createColumn(projectId, column),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.board(projectId) });
    },
  });
}

/**
 * 更新列
 */
export function useUpdateColumnMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (column: Column) => kanbanApi.updateColumn(projectId, column),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.board(projectId) });
    },
  });
}

/**
 * 删除列
 */
export function useDeleteColumnMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (columnId: string) => kanbanApi.deleteColumn(projectId, columnId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.board(projectId) });
    },
  });
}
