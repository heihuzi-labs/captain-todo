// 优先级类型
export type Priority = 'low' | 'normal' | 'urgent' | 'critical';

// 优先级配置 - 使用具体颜色值确保正确显示
export const PRIORITY_CONFIG: Record<Priority, {
  label: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
}> = {
  low: {
    label: '较低',
    textColor: '#6b7280',      // gray-500
    bgColor: '#f9fafb',        // gray-50
    borderColor: '#d1d5db',    // gray-300
  },
  normal: {
    label: '普通',
    textColor: '#3b82f6',      // blue-500
    bgColor: '#eff6ff',        // blue-50
    borderColor: '#93c5fd',    // blue-300
  },
  urgent: {
    label: '紧急',
    textColor: '#f97316',      // orange-500
    bgColor: '#fff7ed',        // orange-50
    borderColor: '#fdba74',    // orange-300
  },
  critical: {
    label: '非常紧急',
    textColor: '#ef4444',      // red-500
    bgColor: '#fef2f2',        // red-50
    borderColor: '#fca5a5',    // red-300
  },
};

// 优先级顺序（用于排序和显示）
export const PRIORITY_ORDER: Priority[] = ['low', 'normal', 'urgent', 'critical'];

export interface Card {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  position: number;
  completed?: boolean;
  priority?: Priority;
  startDate?: Date;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Column {
  id: string;
  title: string;
  position: number;
  cardIds: string[];
  backgroundColor?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Board {
  id: string;
  title: string;
  columns: Column[];
  cards: Card[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Activity {
  id: string;
  type: 'card_created' | 'card_updated' | 'card_moved' | 'card_deleted' | 'card_completed' | 'card_uncompleted' | 'column_created' | 'column_updated' | 'column_deleted';
  cardId?: string;
  columnId?: string;
  fromColumnId?: string;
  toColumnId?: string;
  title: string;
  description?: string;
  timestamp: Date;
}

export interface DragItem {
  type: 'card';
  id: string;
  columnId: string;
  position: number;
  title?: string;
  description?: string;
}

export interface SearchFilters {
  keyword: string;
  columnIds: string[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}
