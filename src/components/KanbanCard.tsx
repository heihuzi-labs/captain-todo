/**
 * KanbanCard 组件 - 基于 @dnd-kit + Tailwind CSS 过渡
 * 参考 cc-switch 设计语言重构
 *
 * 修复 Tauri WebView 兼容性:
 * 1. 将 listeners 绑定到整个卡片容器
 * 2. 移除 touch-none（可能导致 WebView 问题）
 * 3. 添加 MouseSensor 支持
 */
import { useState, memo, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card as CardType, PRIORITY_CONFIG, PRIORITY_ORDER, Priority } from '../types/kanban';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Edit3, Trash2, MoreHorizontal, Flag, CalendarIcon } from 'lucide-react';
import { Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// 辅助函数：格式化日期显示（今天、明天、昨天等友好格式）
const formatDateLabel = (date: Date): string => {
  if (isToday(date)) return '今天';
  if (isTomorrow(date)) return '明天';
  if (isYesterday(date)) return '昨天';
  return format(date, 'MM/dd', { locale: zhCN });
};

// 辅助函数：判断是否已过期
const isOverdue = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(date);
  dueDate.setHours(0, 0, 0, 0);
  return dueDate < today;
};

// 辅助函数：判断是否即将到期（3天内）
const isDueSoon = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(date);
  dueDate.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 3;
};

interface KanbanCardProps {
  card: CardType;
  onUpdate: (cardId: string, updates: Partial<Pick<CardType, 'title' | 'description' | 'completed' | 'priority' | 'startDate' | 'dueDate'>>) => void;
  onDelete: (cardId: string) => void;
  onClick: (card: CardType) => void;
}

export const KanbanCard = memo(function KanbanCard({
  card,
  onUpdate,
  onDelete,
  onClick,
}: KanbanCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);
  const [editDescription, setEditDescription] = useState(card.description || '');

  // @dnd-kit sortable hook
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: 'card',
      columnId: card.columnId,
      position: card.position,
    },
    disabled: isEditing,
  });

  // CSS Transform 样式 - 高性能拖拽
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = useCallback(() => {
    if (editTitle.trim()) {
      onUpdate(card.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
      });
      setIsEditing(false);
    }
  }, [editTitle, editDescription, onUpdate, card.id]);

  const handleCancel = useCallback(() => {
    setEditTitle(card.title);
    setEditDescription(card.description || '');
    setIsEditing(false);
  }, [card.title, card.description]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  }, [handleSave, handleCancel]);

  // 点击处理 - 需要区分拖拽和点击
  const handleCardClick = useCallback((e: React.MouseEvent) => {
    if (!isEditing && !isDragging) {
      e.preventDefault();
      e.stopPropagation();
      onClick(card);
    }
  }, [isEditing, isDragging, onClick, card]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        // 基础样式 - 移除 touch-none 以兼容 Tauri WebView
        "w-full select-none",
        // 拖拽状态
        isDragging && "cursor-grabbing scale-[1.02] shadow-lg",
        !isDragging && !isEditing && "cursor-grab"
      )}
    >
      {/* 卡片容器 - 使用 div 完全控制样式，避免 Card 组件的 bg-card 干扰 */}
      <div
        className={cn(
          // 基础样式 - 白色背景，完全不透明
          "group relative bg-white border border-gray-200 w-full overflow-hidden rounded-lg",
          // 过渡动画
          "transition-all duration-200 ease-out",
          // 悬停效果
          !isDragging && "hover:border-gray-300 hover:shadow-md",
          // 拖拽状态
          isDragging && "border-primary/50 ring-2 ring-primary/20 shadow-xl",
          // 编辑状态
          isEditing && "ring-2 ring-primary",
          // 完成状态 - 浅灰背景
          card.completed && "bg-gray-50 border-gray-200"
        )}
      >
        {isEditing ? (
          // 编辑模式
          <div
            className="p-3 space-y-2.5 animate-in fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="卡片标题"
              className="font-medium w-full"
              autoFocus
            />
            <Textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="描述（可选）"
              className="min-h-[60px] resize-none w-full"
            />
            <div className="flex gap-2 w-full">
              <Button size="sm" onClick={handleSave} disabled={!editTitle.trim()}>
                保存
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                取消
              </Button>
            </div>
          </div>
        ) : (
          // 显示模式
          <div className="py-3">
            {/* 第一行: 复选框 + 标题 + 三点按钮 */}
            <div className="flex items-start px-4">
              {/* Checkbox */}
              <div
                className="flex-shrink-0"
                style={{ marginRight: '16px' }}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <Checkbox
                  checked={card.completed || false}
                  onCheckedChange={(checked: boolean) => {
                    onUpdate(card.id, { completed: !!checked });
                  }}
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  className={cn(
                    "mt-0.5",
                    "transition-transform duration-150 hover:scale-110"
                  )}
                />
              </div>

              {/* 标题 */}
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={handleCardClick}
              >
                <h4 className={cn(
                  "leading-tight break-words transition-all duration-200",
                  card.completed && "line-through text-gray-500"
                )}>
                  {card.title}
                </h4>
              </div>

              {/* 三点菜单按钮 */}
              <div
                className="flex-shrink-0 ml-2"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className={cn(
                        "h-7 w-7 p-0 rounded-md",
                        "bg-gray-100 hover:bg-gray-200",
                        "opacity-0 group-hover:opacity-100",
                        "transition-opacity duration-150"
                      )}
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="w-4 h-4 text-gray-500" />
                      <span className="sr-only">操作菜单</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditing(true);
                      }}
                      className="cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      编辑
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(card.id);
                      }}
                      className="cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* 第二行: 优先级和截止时间（与复选框垂直对齐） */}
            <div
              className="mt-2 px-4 flex items-center gap-2 flex-wrap"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs transition-all duration-150 hover:shadow-sm"
                    style={{
                      color: PRIORITY_CONFIG[card.priority || 'low'].textColor,
                      backgroundColor: PRIORITY_CONFIG[card.priority || 'low'].bgColor,
                      borderColor: PRIORITY_CONFIG[card.priority || 'low'].borderColor,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Flag className="w-3 h-3" />
                    {PRIORITY_CONFIG[card.priority || 'low'].label}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-36">
                  {PRIORITY_ORDER.map((priority) => {
                    const config = PRIORITY_CONFIG[priority];
                    const isSelected = (card.priority || 'low') === priority;
                    return (
                      <DropdownMenuItem
                        key={priority}
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdate(card.id, { priority });
                        }}
                        className="cursor-pointer flex items-center justify-between"
                      >
                        <span
                          className="px-2 py-0.5 rounded border text-xs"
                          style={{
                            color: config.textColor,
                            backgroundColor: config.bgColor,
                            borderColor: config.borderColor,
                          }}
                        >
                          {config.label}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-gray-500" />}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* 时间范围显示 - 只有设置了截止时间才显示 */}
              {card.dueDate && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs",
                    isOverdue(new Date(card.dueDate))
                      ? "text-red-600 bg-red-50 border-red-200"
                      : isDueSoon(new Date(card.dueDate))
                      ? "text-orange-600 bg-orange-50 border-orange-200"
                      : "text-gray-600 bg-gray-50 border-gray-200"
                  )}
                >
                  <CalendarIcon className="w-3 h-3" />
                  {card.startDate && (
                    <>
                      {formatDateLabel(new Date(card.startDate))}
                      <span className="text-gray-400">-</span>
                    </>
                  )}
                  {formatDateLabel(new Date(card.dueDate))}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
