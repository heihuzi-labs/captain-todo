import { useState, useRef, useEffect, memo, useCallback } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Card as CardType } from '../types/kanban';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Edit3, Trash2, MoreHorizontal } from 'lucide-react';

interface KanbanCardProps {
  card: CardType;
  onUpdate: (cardId: string, updates: Partial<Pick<CardType, 'title' | 'description' | 'completed'>>) => void;
  onDelete: (cardId: string) => void;
  onClick: (card: CardType) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export const KanbanCardSimple = memo(function KanbanCardSimple({ card, onUpdate, onDelete, onClick, onDragStart, onDragEnd }: KanbanCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);
  const [editDescription, setEditDescription] = useState(card.description || '');
  const cardRef = useRef<HTMLDivElement>(null);
  const [wasDragging, setWasDragging] = useState(false);

  const [{ isDragging, canDrag }, drag, dragPreview] = useDrag(() => ({
    type: 'card',
    item: () => ({ 
      type: 'card', 
      id: card.id, 
      columnId: card.columnId, 
      position: card.position,
      title: card.title,
      description: card.description,
    }),
    canDrag: !isEditing,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
      canDrag: monitor.canDrag(),
    }),
    end: (item, monitor) => {
      onDragEnd?.();
      if (!monitor.didDrop()) {
        // 拖拽未成功时的处理
      }
    },
    isDragging: (monitor) => {
      return monitor.getItem()?.id === card.id;
    },
  }), [isEditing, card.id, card.columnId, card.position, onDragEnd]);

  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, [dragPreview]);

  // Handle drag start/end using isDragging changes
  useEffect(() => {
    if (isDragging && !wasDragging) {
      setWasDragging(true);
      onDragStart?.();
    } else if (!isDragging && wasDragging) {
      setWasDragging(false);
    }
  }, [isDragging, wasDragging, onDragStart]);

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

  const dragRef = drag(cardRef);

  return (
    <div
      ref={dragRef}
      className={`w-full max-w-full ${isDragging ? 'opacity-30' : 'opacity-100'}`}
      style={{ 
        backfaceVisibility: 'hidden',
        transform: 'translateZ(0)',
      }}
    >
      <Card 
        className={`
          group relative bg-white border shadow-sm w-full max-w-full overflow-hidden !rounded-md
          ${isDragging ? 'shadow-lg' : ''}
          ${isEditing ? 'ring-2 ring-primary shadow-lg' : ''}
          ${card.completed ? 'opacity-70 bg-muted/20' : ''}
        `}
      >
        <div className="flex">
          {/* Checkbox */}
          {!isEditing && (
            <div className="flex items-start justify-center px-2.5 py-2.5 pr-1.5">
              <Checkbox
                checked={card.completed || false}
                onCheckedChange={(checked) => {
                  onUpdate(card.id, { completed: !!checked });
                }}
                onClick={(e) => e.stopPropagation()}
                className="mt-0.5 flex-shrink-0"
              />
            </div>
          )}

          {/* Main Content */}
          <div 
            className={`
              flex-1 px-2.5 py-2.5 min-w-0 max-w-full
              ${!isEditing ? (canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer') : 'cursor-default'}
              ${isEditing ? 'pl-2.5' : 'pl-1.5'}
            `}
            onClick={(e) => {
              if (!isEditing && !isDragging) {
                e.preventDefault();
                e.stopPropagation();
                onClick(card);
              }
            }}
          >
            {isEditing ? (
              <div className="space-y-2.5 w-full max-w-full" onClick={(e) => e.stopPropagation()}>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="卡片标题"
                  className="font-medium w-full max-w-full"
                  style={{ width: '100%', maxWidth: '100%' }}
                  autoFocus
                />
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="描述（可选）"
                  className="min-h-[60px] resize-none w-full max-w-full"
                  style={{ width: '100%', maxWidth: '100%' }}
                />
                <div className="flex gap-2 w-full max-w-full">
                  <Button size="sm" onClick={handleSave} disabled={!editTitle.trim()}>
                    保存
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    取消
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-1.5">
                  <h4 className={`leading-tight break-words break-all overflow-wrap-anywhere ${
                    card.completed ? 'line-through text-muted-foreground/80' : ''
                  }`}>
                    {card.title}
                  </h4>
                </div>
                
                {card.description && (
                  <p className={`text-sm mb-3 leading-relaxed break-words break-all overflow-wrap-anywhere ${
                    card.completed ? 'text-muted-foreground/60 line-through' : 'text-muted-foreground'
                  }`}>
                    {card.description}
                  </p>
                )}

                {/* Status Badge and Actions Row */}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                    card.completed 
                      ? 'bg-green-600 text-white border border-green-600 shadow-sm' 
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {card.completed ? '已完成' : '未完成'}
                  </span>

                  {/* Actions Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="w-4 h-4" />
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
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
});