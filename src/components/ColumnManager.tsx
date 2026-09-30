import { useState } from 'react';
import { Column } from '../types/kanban';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Settings, Plus, Edit3, Trash2, GripVertical } from 'lucide-react';
import { motion } from 'motion/react';

interface ColumnManagerProps {
  columns: Column[];
  onCreateColumn: (title: string) => void;
  onUpdateColumn: (columnId: string, updates: { title?: string; backgroundColor?: string }) => void;
  onDeleteColumn: (columnId: string) => void;
  cardCounts: Record<string, number>;
}

export function ColumnManager({ 
  columns, 
  onCreateColumn, 
  onUpdateColumn, 
  onDeleteColumn,
  cardCounts 
}: ColumnManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleCreateColumn = () => {
    if (newColumnTitle.trim()) {
      onCreateColumn(newColumnTitle.trim());
      setNewColumnTitle('');
    }
  };

  const handleStartEdit = (column: Column) => {
    setEditingColumnId(column.id);
    setEditTitle(column.title);
  };

  const handleSaveEdit = () => {
    if (editingColumnId && editTitle.trim()) {
      onUpdateColumn(editingColumnId, { title: editTitle.trim() });
      setEditingColumnId(null);
      setEditTitle('');
    }
  };

  const handleCancelEdit = () => {
    setEditingColumnId(null);
    setEditTitle('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (editingColumnId) {
        handleSaveEdit();
      } else {
        handleCreateColumn();
      }
    } else if (e.key === 'Escape') {
      if (editingColumnId) {
        handleCancelEdit();
      }
    }
  };

  const sortedColumns = [...columns].sort((a, b) => a.position - b.position);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Settings className="w-4 h-4" />
          列管理
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            看板列管理
          </DialogTitle>
          <DialogDescription>
            创建、编辑和删除看板列，管理您的工作流程结构
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Create New Column */}
          <div className="space-y-3">
            <h4 className="font-medium">创建新列</h4>
            <div className="flex gap-2">
              <Input
                placeholder="列标题"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button 
                onClick={handleCreateColumn}
                disabled={!newColumnTitle.trim()}
                className="gap-2 flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                创建
              </Button>
            </div>
          </div>

          {/* Existing Columns */}
          <div className="space-y-3">
            <h4 className="font-medium">现有列</h4>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {sortedColumns.map((column) => (
                <motion.div
                  key={column.id}
                  layout
                  className="flex items-center gap-3 p-3 border rounded-lg bg-card"
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  
                  <div className="flex-1">
                    {editingColumnId === column.id ? (
                      <div className="flex gap-2">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="h-8"
                          autoFocus
                        />
                        <Button size="sm" onClick={handleSaveEdit}>
                          保存
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                          取消
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{column.title}</span>
                        <Badge variant="secondary" className="text-xs">
                          {cardCounts[column.id] || 0}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {editingColumnId !== column.id && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStartEdit(column)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDeleteColumn(column.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}