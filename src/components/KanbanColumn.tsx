/**
 * KanbanColumn 组件 - 基于 @dnd-kit 重构
 * 参考 cc-switch 设计语言
 *
 * 性能优化点:
 * 1. 移除嵌套 layout 动画
 * 2. 使用 SortableContext 替代 CardDropZone
 * 3. 使用 Tailwind transition 替代 Framer Motion animate
 */
import { useState, useCallback, memo, useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Column, Card as CardType } from '../types/kanban';
import { KanbanCard } from './KanbanCard';
import { QuickAddCard } from './QuickAddCard';
import { ColumnColorPicker, getColumnBackgroundClass, getCardCountBadgeClass } from './ColumnColorPicker';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { MoreHorizontal, Edit3, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface KanbanColumnProps {
  column: Column;
  cards: CardType[];
  onCreateCard: (columnId: string, title: string, description?: string) => void;
  onUpdateCard: (cardId: string, updates: Partial<Pick<CardType, 'title' | 'description' | 'completed'>>) => void;
  onDeleteCard: (cardId: string) => void;
  onUpdateColumn: (columnId: string, updates: { title?: string; backgroundColor?: string }) => void;
  onDeleteColumn: (columnId: string) => void;
  onCardClick: (card: CardType) => void;
  filteredCardIds?: string[];
}

export const KanbanColumn = memo(function KanbanColumn({
  column,
  cards,
  onCreateCard,
  onUpdateCard,
  onDeleteCard,
  onUpdateColumn,
  onDeleteColumn,
  onCardClick,
  filteredCardIds,
}: KanbanColumnProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);

  // @dnd-kit droppable - 使列成为放置目标
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: {
      type: 'column',
      columnId: column.id,
    },
  });

  // 排序后的卡片
  const sortedCards = useMemo(() => {
    const columnCards = cards.filter(card => card.columnId === column.id);
    const filteredCards = filteredCardIds
      ? columnCards.filter(card => filteredCardIds.includes(card.id))
      : columnCards;

    return filteredCards.sort((a, b) => a.position - b.position);
  }, [cards, column.id, filteredCardIds]);

  // 获取卡片 ID 列表用于 SortableContext
  const cardIds = useMemo(() => sortedCards.map(card => card.id), [sortedCards]);

  const handleSaveTitle = useCallback(() => {
    if (editTitle.trim() && editTitle.trim() !== column.title) {
      onUpdateColumn(column.id, { title: editTitle.trim() });
    }
    setIsEditingTitle(false);
  }, [editTitle, column.title, column.id, onUpdateColumn]);

  const handleColorChange = useCallback((backgroundColor: string | undefined) => {
    onUpdateColumn(column.id, { backgroundColor });
  }, [column.id, onUpdateColumn]);

  const handleCancelEdit = useCallback(() => {
    setEditTitle(column.title);
    setIsEditingTitle(false);
  }, [column.title]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  }, [handleSaveTitle, handleCancelEdit]);

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl flex-shrink-0 h-full",
        // 过渡动画 - 使用 Tailwind
        "transition-all duration-300",
        // 列背景色
        getColumnBackgroundClass(column.backgroundColor)
      )}
      style={{
        width: '280px',
        maxWidth: '280px',
        minWidth: '280px',
      }}
    >
      {/* Column Header */}
      <div
        className={cn(
          "flex items-center justify-between px-4 py-3",
          "transition-colors duration-150 hover:bg-black/[0.02]"
        )}
      >
        {isEditingTitle ? (
          // 编辑标题模式
          <div className="flex-1 mr-2 min-w-0 animate-in fade-in zoom-in-95 duration-200">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSaveTitle}
              className="h-8 w-full font-semibold"
              autoFocus
            />
          </div>
        ) : (
          // 显示标题模式
          <div className="flex items-center gap-2 flex-1 animate-in fade-in duration-150">
            <h3
              className={cn(
                "font-semibold cursor-pointer",
                "transition-colors duration-150 hover:text-primary"
              )}
              onClick={() => setIsEditingTitle(true)}
            >
              {column.title}
            </h3>
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full min-w-[22px] text-center font-medium",
                "transition-transform duration-200",
                getCardCountBadgeClass(column.backgroundColor)
              )}
            >
              {sortedCards.length}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-black/5">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setIsEditingTitle(true)}>
                <Edit3 className="w-4 h-4 mr-2" />
                重命名
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <ColumnColorPicker
                currentColor={column.backgroundColor}
                onColorChange={handleColorChange}
              />
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDeleteColumn(column.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                删除列
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Cards Container - 使用 @dnd-kit */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 px-3 pt-2 pb-1 min-h-[100px] overflow-y-auto",
          // 拖拽悬停状态
          "transition-all duration-200 ease-out",
          isOver && "bg-primary/5 ring-2 ring-inset ring-primary/20"
        )}
      >
        {/* SortableContext 提供排序上下文 */}
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-2 pb-1">
            {sortedCards.map((card) => (
              <KanbanCard
                key={card.id}
                card={card}
                onUpdate={onUpdateCard}
                onDelete={onDeleteCard}
                onClick={onCardClick}
              />
            ))}
          </div>
        </SortableContext>

        {/* 空列提示 */}
        {sortedCards.length === 0 && (
          <div
            className={cn(
              "min-h-[60px] rounded-lg flex items-center justify-center",
              "border-2 border-dashed border-gray-200",
              "text-sm text-gray-400",
              "transition-all duration-200",
              isOver && "border-primary/50 bg-primary/5 text-primary"
            )}
          >
            {isOver ? '放置卡片到此处' : '暂无卡片'}
          </div>
        )}

        {/* Quick Add Card - sticky 定位，卡片多时固定在底部 */}
        <div
          className={cn(
            "sticky bottom-0 z-10",
            // 上下间隙一致，撑满列宽度
            "py-1 -mx-3",
            getColumnBackgroundClass(column.backgroundColor)
          )}
        >
          <QuickAddCard
            key={`quick-add-${column.id}`}
            instanceId={column.id}
            onAdd={(title, description) => onCreateCard(column.id, title, description)}
            placeholder="添加新卡片..."
          />
        </div>
      </div>
    </div>
  );
});
