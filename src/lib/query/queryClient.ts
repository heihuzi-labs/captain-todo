// TanStack Query 客户端配置
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 重试次数
      retry: 1,
      // 窗口聚焦时不重新获取
      refetchOnWindowFocus: false,
      // 数据过期时间 (5分钟)
      staleTime: 1000 * 60 * 5,
      // 垃圾回收时间 (30分钟)
      gcTime: 1000 * 60 * 30,
    },
    mutations: {
      // 变更不重试
      retry: false,
    },
  },
});

// Query Keys 常量
export const queryKeys = {
  // 项目相关
  projects: ['projects'] as const,
  currentProject: ['currentProject'] as const,

  // 看板相关
  board: (projectId: string) => ['board', projectId] as const,
  cards: (projectId: string) => ['cards', projectId] as const,
  columns: (projectId: string) => ['columns', projectId] as const,

  // 活动日志
  activities: (projectId: string) => ['activities', projectId] as const,
} as const;
