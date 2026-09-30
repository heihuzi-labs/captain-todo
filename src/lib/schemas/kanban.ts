// Zod Schema 定义 - 看板相关
import { z } from 'zod';

// 卡片 Schema
export const CardSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1, '标题不能为空'),
  description: z.string().optional(),
  columnId: z.string().min(1),
  position: z.number().int().min(0),
  completed: z.boolean().optional(),
  createdAt: z.union([z.date(), z.string()]),
  updatedAt: z.union([z.date(), z.string()]),
});

export type CardInput = z.infer<typeof CardSchema>;

// 创建卡片 Schema (部分字段可选)
export const CreateCardSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  description: z.string().optional(),
  columnId: z.string().min(1, '必须指定列'),
  position: z.number().int().min(0).optional(),
  completed: z.boolean().optional(),
});

export type CreateCardInput = z.infer<typeof CreateCardSchema>;

// 列 Schema
export const ColumnSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1, '列标题不能为空'),
  position: z.number().int().min(0),
  cardIds: z.array(z.string()),
  backgroundColor: z.string().optional(),
  createdAt: z.union([z.date(), z.string()]),
  updatedAt: z.union([z.date(), z.string()]),
});

export type ColumnInput = z.infer<typeof ColumnSchema>;

// 创建列 Schema
export const CreateColumnSchema = z.object({
  title: z.string().min(1, '列标题不能为空'),
  position: z.number().int().min(0).optional(),
  backgroundColor: z.string().optional(),
});

export type CreateColumnInput = z.infer<typeof CreateColumnSchema>;

// 看板 Schema
export const BoardSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  columns: z.array(ColumnSchema),
  cards: z.array(CardSchema),
  createdAt: z.union([z.date(), z.string()]),
  updatedAt: z.union([z.date(), z.string()]),
});

export type BoardInput = z.infer<typeof BoardSchema>;

// 项目 Schema
export const ProjectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, '项目名称不能为空'),
  description: z.string().optional(),
  position: z.number().int().min(0),
  createdAt: z.union([z.date(), z.string()]),
  updatedAt: z.union([z.date(), z.string()]),
});

export type ProjectInput = z.infer<typeof ProjectSchema>;

// 创建项目 Schema
export const CreateProjectSchema = z.object({
  name: z.string().min(1, '项目名称不能为空'),
  description: z.string().optional(),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

// 移动卡片参数 Schema
export const MoveCardParamsSchema = z.object({
  cardId: z.string().min(1),
  fromColumnId: z.string().min(1),
  toColumnId: z.string().min(1),
  newPosition: z.number().int().min(0),
});

export type MoveCardParamsInput = z.infer<typeof MoveCardParamsSchema>;
