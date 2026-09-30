// Tauri API 封装层 - 看板相关
import { invoke } from '@tauri-apps/api/core';
import type { Board, Card, Column } from '@/types/kanban';

// 将前端类型转换为后端格式 (使用 camelCase，匹配 Rust serde rename)
function toBackendCard(card: Card): Record<string, unknown> {
  return {
    id: card.id,
    title: card.title,
    description: card.description,
    columnId: card.columnId,
    position: card.position,
    completed: card.completed,
    priority: card.priority,
    startDate: card.startDate instanceof Date ? card.startDate.toISOString() : card.startDate,
    dueDate: card.dueDate instanceof Date ? card.dueDate.toISOString() : card.dueDate,
    createdAt: card.createdAt instanceof Date ? card.createdAt.toISOString() : card.createdAt,
    updatedAt: card.updatedAt instanceof Date ? card.updatedAt.toISOString() : card.updatedAt,
  };
}

function toBackendColumn(column: Column): Record<string, unknown> {
  return {
    id: column.id,
    title: column.title,
    position: column.position,
    cardIds: column.cardIds,
    backgroundColor: column.backgroundColor,
    createdAt: column.createdAt instanceof Date ? column.createdAt.toISOString() : column.createdAt,
    updatedAt: column.updatedAt instanceof Date ? column.updatedAt.toISOString() : column.updatedAt,
  };
}

// 将后端格式转换为前端类型 (后端返回 camelCase)
function fromBackendCard(data: Record<string, unknown>): Card {
  return {
    id: data.id as string,
    title: data.title as string,
    description: data.description as string | undefined,
    columnId: data.columnId as string,
    position: data.position as number,
    completed: data.completed as boolean | undefined,
    priority: data.priority as Card['priority'],
    startDate: data.startDate ? new Date(data.startDate as string) : undefined,
    dueDate: data.dueDate ? new Date(data.dueDate as string) : undefined,
    createdAt: new Date(data.createdAt as string),
    updatedAt: new Date(data.updatedAt as string),
  };
}

function fromBackendColumn(data: Record<string, unknown>): Column {
  return {
    id: data.id as string,
    title: data.title as string,
    position: data.position as number,
    cardIds: data.cardIds as string[],
    backgroundColor: data.backgroundColor as string | undefined,
    createdAt: new Date(data.createdAt as string),
    updatedAt: new Date(data.updatedAt as string),
  };
}

function fromBackendBoard(data: Record<string, unknown>): Board {
  const columns = (data.columns as Record<string, unknown>[]).map(fromBackendColumn);
  const cards = (data.cards as Record<string, unknown>[]).map(fromBackendCard);
  return {
    id: data.id as string,
    title: data.title as string,
    columns,
    cards,
    createdAt: new Date(data.createdAt as string),
    updatedAt: new Date(data.updatedAt as string),
  };
}

export interface MoveCardParams {
  cardId: string;
  fromColumnId: string;
  toColumnId: string;
  newPosition: number;
}

export const kanbanApi = {
  /** 获取看板数据 */
  async getBoard(projectId: string): Promise<Board> {
    const result = await invoke<Record<string, unknown>>('get_board', {
      projectId,
    });
    return fromBackendBoard(result);
  },

  /** 保存看板数据 (全量) */
  async saveBoard(projectId: string, board: Board): Promise<void> {
    const backendBoard = {
      id: board.id,
      title: board.title,
      columns: board.columns.map(toBackendColumn),
      cards: board.cards.map(toBackendCard),
      createdAt: board.createdAt instanceof Date ? board.createdAt.toISOString() : board.createdAt,
      updatedAt: board.updatedAt instanceof Date ? board.updatedAt.toISOString() : board.updatedAt,
    };
    await invoke('save_board', { projectId, board: backendBoard });
  },

  /** 创建卡片 */
  async createCard(projectId: string, card: Partial<Card> & { columnId: string; title: string }): Promise<Card> {
    const now = new Date();
    const backendCard = {
      id: card.id || '',
      title: card.title,
      description: card.description || null,
      columnId: card.columnId,
      position: card.position ?? 0,
      completed: card.completed ?? false,
      priority: card.priority || 'low',
      startDate: card.startDate instanceof Date ? card.startDate.toISOString() : card.startDate || null,
      dueDate: card.dueDate instanceof Date ? card.dueDate.toISOString() : card.dueDate || null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    const result = await invoke<Record<string, unknown>>('create_card', {
      projectId,
      card: backendCard,
    });
    return fromBackendCard(result);
  },

  /** 更新卡片 */
  async updateCard(projectId: string, card: Card): Promise<Card> {
    const result = await invoke<Record<string, unknown>>('update_card', {
      projectId,
      card: toBackendCard(card),
    });
    return fromBackendCard(result);
  },

  /** 删除卡片 */
  async deleteCard(projectId: string, cardId: string): Promise<void> {
    await invoke('delete_card', { projectId, cardId });
  },

  /** 移动卡片 */
  async moveCard(projectId: string, params: MoveCardParams): Promise<void> {
    await invoke('move_card', {
      projectId,
      params: {
        card_id: params.cardId,
        from_column_id: params.fromColumnId,
        to_column_id: params.toColumnId,
        new_position: params.newPosition,
      },
    });
  },

  /** 创建列 */
  async createColumn(projectId: string, column: Partial<Column> & { title: string }): Promise<Column> {
    const now = new Date();
    const backendColumn = {
      id: column.id || '',
      title: column.title,
      position: column.position ?? 0,
      cardIds: column.cardIds || [],
      backgroundColor: column.backgroundColor || null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    const result = await invoke<Record<string, unknown>>('create_column', {
      projectId,
      column: backendColumn,
    });
    return fromBackendColumn(result);
  },

  /** 更新列 */
  async updateColumn(projectId: string, column: Column): Promise<Column> {
    const result = await invoke<Record<string, unknown>>('update_column', {
      projectId,
      column: toBackendColumn(column),
    });
    return fromBackendColumn(result);
  },

  /** 删除列 */
  async deleteColumn(projectId: string, columnId: string): Promise<void> {
    await invoke('delete_column', { projectId, columnId });
  },
};
