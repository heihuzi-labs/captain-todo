import { memo, useRef, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Card as CardType, DragItem } from '../types/kanban';
import { Card } from './ui/card';
import { Checkbox } from './ui/checkbox';

interface KanbanCardProps {
  card: CardType;
  onUpdate: (cardId: string, updates: Partial<Pick<CardType, 'completed'>>) => void;
  onClick: (card: CardType) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export const KanbanCardUltraSimple = memo(function KanbanCardUltraSimple({ 
  card, 
  onUpdate, 
  onClick, 
  onDragStart, 
  onDragEnd 
}: KanbanCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // 完全重写的拖拽配置 - 使用函数形式的 item
  const [{ isDragging }, drag, dragPreview] = useDrag<DragItem, void, { isDragging: boolean }>({
    type: 'card',
    item: () => {
      // 拖拽开始时调用
      onDragStart?.();
      return {
        type: 'card',
        id: card.id,
        columnId: card.columnId,
        position: card.position,
        title: card.title,
        description: card.description,
      };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: () => {
      // 拖拽结束
      onDragEnd?.();
    },
  });

  // 设置空的拖拽预览，让 DragPreview 组件处理预览
  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, [dragPreview]);

  // 绑定拖拽引用
  const dragRef = drag(cardRef);

  return (
    <div 
      ref={dragRef} 
      className={`w-full ${isDragging ? 'opacity-50' : 'cursor-grab active:cursor-grabbing'}`}
    >
      <Card className={`
        bg-white border shadow-sm overflow-hidden !rounded-md hover:shadow-md transition-shadow duration-200
        ${card.completed ? 'opacity-70 bg-muted/20' : ''}
      `}>
        <div className="flex" onClick={() => onClick(card)}>
          {/* Checkbox */}
          <div className="flex items-start justify-center px-2.5 py-2.5 pr-1.5">
            <Checkbox
              checked={card.completed || false}
              onCheckedChange={(checked) => onUpdate(card.id, { completed: !!checked })}
              onClick={(e) => e.stopPropagation()}
              className="mt-0.5 flex-shrink-0"
            />
          </div>

          {/* Content */}
          <div className="flex-1 px-1.5 py-2.5 min-w-0">
            <div className="mb-1.5">
              <h4 className={`leading-tight break-words ${
                card.completed ? 'line-through text-muted-foreground/80' : ''
              }`}>
                {card.title}
              </h4>
            </div>
            
            {card.description && (
              <p className={`text-sm mb-3 leading-relaxed break-words line-clamp-2 ${
                card.completed ? 'text-muted-foreground/60 line-through' : 'text-muted-foreground'
              }`}>
                {card.description}
              </p>
            )}

            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
              card.completed 
                ? 'bg-green-600 text-white' 
                : 'bg-slate-100 text-slate-700'
            }`}>
              {card.completed ? '已完成' : '未完成'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
});