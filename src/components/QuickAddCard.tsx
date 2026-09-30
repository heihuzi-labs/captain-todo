/**
 * QuickAddCard 组件 - 优化版
 * 功能：点击外部自动关闭，展开有动画，收起无动画
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Plus, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface QuickAddCardProps {
  onAdd: (title: string, description?: string) => void;
  placeholder?: string;
  instanceId?: string;
}

export function QuickAddCard({ onAdd, placeholder = "添加新卡片...", instanceId }: QuickAddCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = useCallback(() => {
    if (title.trim()) {
      onAdd(title.trim(), undefined);
      setTitle('');
      setIsExpanded(false);
    }
  }, [title, onAdd]);

  const handleCancel = useCallback(() => {
    setTitle('');
    setIsExpanded(false);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  }, [handleSubmit, handleCancel]);

  // 点击外部关闭
  useEffect(() => {
    if (!isExpanded) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleCancel();
      }
    };

    // 使用 mousedown 响应更快
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded, handleCancel]);

  if (!isExpanded) {
    return (
      <Button
        variant="ghost"
        className={cn(
          "w-full h-8 justify-center",
          "text-muted-foreground/50 hover:text-muted-foreground",
          // 白色长方形，小圆角
          "bg-white hover:bg-gray-50",
          "border border-gray-100",
          "rounded-sm",
          "transition-all duration-150"
        )}
        onClick={() => setIsExpanded(true)}
      >
        <Plus className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "bg-white border border-border rounded-lg p-2.5 shadow-sm",
        "animate-in fade-in slide-in-from-top-1 duration-150"
      )}
    >
      <div className="flex gap-2 items-center">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入卡片标题..."
          className="flex-1 h-8 text-sm"
          autoFocus
        />
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!title.trim()}
          className="h-8 px-3"
        >
          添加
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCancel}
          className="h-8 w-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
