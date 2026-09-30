/**
 * DragOverlayCard - 拖拽预览组件
 * 基于 @dnd-kit DragOverlay
 * 参考 cc-switch 设计语言
 *
 * 性能优化点:
 * 1. 使用 @dnd-kit 的 DragOverlay 替代自定义预览
 * 2. 移除 requestAnimationFrame 循环
 * 3. 使用 CSS Transform 替代 React state
 */
import { Card } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { GripVertical } from 'lucide-react';
import { cn } from '../lib/utils';
import { Card as CardType } from '../types/kanban';

interface DragOverlayCardProps {
  card: CardType | null;
}

export function DragOverlayCard({ card }: DragOverlayCardProps) {
  if (!card) return null;

  return (
    <div
      className={cn(
        "w-[240px]",
        // 拖拽效果 - 参考 cc-switch: scale-105 + shadow-lg + cursor-grabbing
        "cursor-grabbing scale-[1.02]"
      )}
    >
      <Card
        className={cn(
          // 基础样式
          "bg-white/95 backdrop-blur-sm overflow-hidden rounded-xl",
          // 边框和阴影
          "border-2 border-primary/30 shadow-2xl"
        )}
      >
        {/* 顶部拖拽指示条 */}
        <div className="h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />

        <div className="flex p-3">
          {/* 拖拽图标 */}
          <div className="flex items-center justify-center w-6 mr-2">
            <GripVertical className="w-4 h-4 text-primary/60 animate-pulse" />
          </div>

          {/* Checkbox */}
          <div className="flex items-start justify-center px-2">
            <Checkbox
              checked={card.completed || false}
              disabled
              className="mt-0.5 flex-shrink-0 pointer-events-none opacity-50"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="mb-1.5">
              <h4 className={cn(
                "leading-tight break-words font-medium text-foreground",
                card.completed && "line-through text-gray-500"
              )}>
                {card.title}
              </h4>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary animate-pulse">
                ↕ 拖拽中...
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
