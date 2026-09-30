import { useState, useEffect } from 'react';
import { Card as CardType, Activity } from '../types/kanban';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './ui/sheet';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
import { Save, X, Clock, Activity as ActivityIcon, CheckCircle2, Check } from 'lucide-react';


interface CardDetailsDrawerProps {
  card: CardType | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (cardId: string, updates: Partial<Pick<CardType, 'title' | 'description' | 'completed'>>) => void;
  onDelete: (cardId: string) => void;
  activities: Activity[];
  columnTitle: string;
}

export function CardDetailsDrawer({
  card,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  activities,
  columnTitle,
}: CardDetailsDrawerProps) {
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (card) {
      setEditTitle(card.title);
      setEditDescription(card.description || '');
      setHasChanges(false);
    }
  }, [card]);

  useEffect(() => {
    if (card) {
      const titleChanged = editTitle !== card.title;
      const descriptionChanged = editDescription !== (card.description || '');
      setHasChanges(titleChanged || descriptionChanged);
    }
  }, [editTitle, editDescription, card]);

  const handleSave = () => {
    if (card && hasChanges && editTitle.trim()) {
      onUpdate(card.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
      });
      setHasChanges(false);
    }
  };

  const handleClose = () => {
    setHasChanges(false);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleClose();
    }
  };

  // Filter activities for this card
  const cardActivities = card
    ? activities.filter(activity => activity.cardId === card.id)
    : [];

  if (!card) return null;

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent 
        className="w-[540px] sm:max-w-[540px]"
        style={{
          willChange: isOpen ? 'transform' : 'auto',
          backfaceVisibility: 'hidden',
        }}
      >
        <SheetHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <SheetTitle className="text-lg">卡片详情</SheetTitle>
              <SheetDescription>
                编辑卡片信息并查看活动记录
              </SheetDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{columnTitle}</Badge>
              <div className={`
                inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border transition-colors duration-200
                ${card.completed 
                  ? 'bg-green-50 text-green-700 border-green-200' 
                  : 'bg-blue-50 text-blue-700 border-blue-200'
                }
              `}>
                {card.completed ? (
                  <>
                    <Check className="w-3 h-3" />
                    已完成
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3" />
                    未完成
                  </>
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Card Content */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">标题</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入卡片标题"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">描述</label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入卡片描述"
                className="min-h-[120px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">完成状态</label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="completed"
                  checked={card.completed || false}
                  onCheckedChange={(checked) => {
                    onUpdate(card.id, { completed: !!checked });
                  }}
                />
                <label 
                  htmlFor="completed" 
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  标记为已完成
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={!hasChanges || !editTitle.trim()}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  保存更改
                </Button>
                {hasChanges && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditTitle(card.title);
                      setEditDescription(card.description || '');
                    }}
                  >
                    重置
                  </Button>
                )}
              </div>

              <Button
                variant="destructive"
                onClick={() => {
                  onDelete(card.id);
                  handleClose();
                }}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                删除卡片
              </Button>
            </div>
          </div>

          <Separator />

          {/* Card Metadata */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              时间信息
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">创建时间</span>
                <div>{new Date(card.createdAt).toLocaleString('zh-CN')}</div>
              </div>
              <div>
                <span className="text-muted-foreground">更新时间</span>
                <div>{new Date(card.updatedAt).toLocaleString('zh-CN')}</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Activity Log */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2">
              <ActivityIcon className="w-4 h-4" />
              活动记录
            </h4>
            
            <ScrollArea className="h-[300px]">
              {cardActivities.length > 0 ? (
                <div className="space-y-3">
                  {cardActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex gap-3 p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleString('zh-CN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  暂无活动记录
                </p>
              )}
            </ScrollArea>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}