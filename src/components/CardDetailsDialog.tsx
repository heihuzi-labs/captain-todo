/**
 * CardDetailsDialog - 任务详情对话框
 * 简洁设计
 */
import { useState, useEffect } from 'react';
import { Card as CardType, PRIORITY_CONFIG, PRIORITY_ORDER } from '../types/kanban';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Save, Trash2, Check, Flag, CalendarIcon, X } from 'lucide-react';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface CardDetailsDialogProps {
  card: CardType | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (cardId: string, updates: Partial<Pick<CardType, 'title' | 'description' | 'completed' | 'priority' | 'startDate' | 'dueDate'>>) => void;
  onDelete: (cardId: string) => void;
}

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

export function CardDetailsDialog({
  card,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}: CardDetailsDialogProps) {
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState<CardType['priority']>('low');
  const [editStartDate, setEditStartDate] = useState<Date | undefined>(undefined);
  const [editDueDate, setEditDueDate] = useState<Date | undefined>(undefined);
  const [hasChanges, setHasChanges] = useState(false);

  // 获取今天的日期（用于默认开始时间）
  const getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  useEffect(() => {
    if (card) {
      setEditTitle(card.title);
      setEditDescription(card.description || '');
      setEditPriority(card.priority || 'low');
      // 如果没有开始时间，默认设置为今天
      setEditStartDate(card.startDate ? new Date(card.startDate) : getToday());
      setEditDueDate(card.dueDate ? new Date(card.dueDate) : undefined);
      setHasChanges(false);
    }
  }, [card]);

  useEffect(() => {
    if (card) {
      const titleChanged = editTitle !== card.title;
      const descriptionChanged = editDescription !== (card.description || '');
      const priorityChanged = editPriority !== (card.priority || 'low');

      const cardStartDate = card.startDate ? new Date(card.startDate).toDateString() : getToday().toDateString();
      const editStartDateStr = editStartDate ? editStartDate.toDateString() : getToday().toDateString();
      const startDateChanged = cardStartDate !== editStartDateStr;

      const cardDueDate = card.dueDate ? new Date(card.dueDate).toDateString() : undefined;
      const editDueDateStr = editDueDate ? editDueDate.toDateString() : undefined;
      const dueDateChanged = cardDueDate !== editDueDateStr;

      setHasChanges(titleChanged || descriptionChanged || priorityChanged || startDateChanged || dueDateChanged);
    }
  }, [editTitle, editDescription, editPriority, editStartDate, editDueDate, card]);

  const handleSave = () => {
    if (card && hasChanges && editTitle.trim()) {
      onUpdate(card.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        priority: editPriority,
        startDate: editStartDate,
        dueDate: editDueDate,
      });
      setHasChanges(false);
      onClose();
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

  // 清除所有时间
  const handleClearDates = () => {
    setEditStartDate(getToday());
    setEditDueDate(undefined);
  };

  if (!card) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg sm:p-8">
        {/* 表单内容 */}
        <div className="space-y-6">
          {/* 标题 */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-600">
              标题
            </label>
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入任务标题"
              className="h-11 border-gray-300"
            />
          </div>

          {/* 描述 */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-600">
              描述
            </label>
            <Textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="添加详细描述..."
              className="min-h-[120px] resize-none border-gray-300"
            />
          </div>

          {/* 优先级 */}
          <div className="flex items-center gap-4 pt-2">
            <span className="text-sm font-medium text-gray-600">
              优先级
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded text-xs font-medium border focus:outline-none"
                  style={{
                    color: PRIORITY_CONFIG[editPriority || 'low'].textColor,
                    backgroundColor: PRIORITY_CONFIG[editPriority || 'low'].bgColor,
                    borderColor: PRIORITY_CONFIG[editPriority || 'low'].borderColor,
                  }}
                >
                  <Flag className="w-3 h-3" />
                  {PRIORITY_CONFIG[editPriority || 'low'].label}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-32">
                {PRIORITY_ORDER.map((priority) => {
                  const config = PRIORITY_CONFIG[priority];
                  const isSelected = (editPriority || 'low') === priority;
                  return (
                    <DropdownMenuItem
                      key={priority}
                      onClick={() => setEditPriority(priority)}
                      className="cursor-pointer flex items-center justify-between"
                    >
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border"
                        style={{
                          color: config.textColor,
                          backgroundColor: config.bgColor,
                          borderColor: config.borderColor,
                        }}
                      >
                        {config.label}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-blue-500" />}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* 时间设置 */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600">
              时间
            </span>
            <div className="flex items-center gap-2">
              {/* 开始时间 */}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded text-xs font-medium border focus:outline-none text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <CalendarIcon className="w-3 h-3" />
                    {editStartDate ? formatDateLabel(editStartDate) : '开始时间'}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={editStartDate}
                    onSelect={(date) => setEditStartDate(date || getToday())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <span className="text-gray-400">-</span>

              {/* 截止时间 */}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded text-xs font-medium border focus:outline-none transition-colors ${
                      editDueDate
                        ? isOverdue(editDueDate)
                          ? 'text-red-600 bg-red-50 border-red-200'
                          : isDueSoon(editDueDate)
                          ? 'text-orange-600 bg-orange-50 border-orange-200'
                          : 'text-gray-600 bg-gray-50 border-gray-200'
                        : 'text-gray-400 bg-gray-50 border-gray-200 hover:text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <CalendarIcon className="w-3 h-3" />
                    {editDueDate ? formatDateLabel(editDueDate) : '截止时间'}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={editDueDate}
                    onSelect={setEditDueDate}
                    disabled={(date) => editStartDate ? date < editStartDate : false}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {/* 清除按钮 */}
              {editDueDate && (
                <button
                  onClick={handleClearDates}
                  className="inline-flex items-center justify-center w-6 h-6 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="清除时间"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
          <button
            onClick={() => {
              onDelete(card.id);
              handleClose();
            }}
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            删除
          </button>

          <Button
            onClick={handleSave}
            disabled={!hasChanges || !editTitle.trim()}
            size="sm"
            className="gap-2 px-4"
          >
            <Save className="w-4 h-4" />
            保存
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
