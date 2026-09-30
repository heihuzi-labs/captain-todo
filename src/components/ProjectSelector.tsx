import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ChevronDown, Plus, Edit3, Trash2, FolderOpen, GripVertical } from 'lucide-react';
import { Project } from '../types/kanban';

interface ProjectSelectorProps {
  projects: Project[];
  currentProject: Project;
  onProjectSwitch: (projectId: string) => void;
  onProjectCreate: (name: string, description?: string) => void;
  onProjectUpdate: (projectId: string, updates: { name?: string; description?: string }) => void;
  onProjectDelete: (projectId: string) => void;
  onProjectReorder: (projectIds: string[]) => void;
}

export function ProjectSelector({
  projects,
  currentProject,
  onProjectSwitch,
  onProjectCreate,
  onProjectUpdate,
  onProjectDelete,
  onProjectReorder,
}: ProjectSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [formData, setFormData] = useState({ name: '', description: '' });
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    })
  );

  const handleCreateProject = () => {
    if (formData.name.trim()) {
      onProjectCreate(formData.name.trim(), formData.description.trim() || undefined);
      setFormData({ name: '', description: '' });
      setShowCreateDialog(false);
    }
  };

  const handleEditProject = () => {
    if (editingProject && formData.name.trim()) {
      onProjectUpdate(editingProject.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      });
      setFormData({ name: '', description: '' });
      setEditingProject(null);
      setShowEditDialog(false);
    }
  };

  const openDeleteDialog = (project: Project, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingProject(project);
    setDeleteConfirmName('');
    setIsOpen(false);
  };

  const handleDeleteProject = () => {
    if (!deletingProject || deleteConfirmName !== deletingProject.name) {
      return;
    }

    onProjectDelete(deletingProject.id);
    setDeletingProject(null);
    setDeleteConfirmName('');
  };

  const openEditDialog = (project: Project, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingProject(project);
    setFormData({ name: project.name, description: project.description || '' });
    setShowEditDialog(true);
  };

  const handleProjectSwitch = (projectId: string) => {
    onProjectSwitch(projectId);
    setIsOpen(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = projects.findIndex(project => project.id === active.id);
    const newIndex = projects.findIndex(project => project.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const reorderedProjects = arrayMove(projects, oldIndex, newIndex);
    onProjectReorder(reorderedProjects.map(project => project.id));
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 h-8 px-3">
            <FolderOpen className="w-4 h-4 text-primary" />
            <span className="font-medium">{currentProject.name}</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <div className="px-2 py-1.5">
            <p className="text-xs text-muted-foreground">选择项目</p>
          </div>
          <DropdownMenuSeparator />

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={projects.map(project => project.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1">
                {projects.map((project) => (
                  <SortableProjectItem
                    key={project.id}
                    project={project}
                    isCurrent={project.id === currentProject.id}
                    canDelete={projects.length > 1}
                    onSwitch={handleProjectSwitch}
                    onEdit={openEditDialog}
                    onDelete={openDeleteDialog}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setFormData({ name: '', description: '' });
              setIsOpen(false);
              setShowCreateDialog(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            创建新项目
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create Project Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建新项目</DialogTitle>
            <DialogDescription>
              为你的新项目设置名称和描述
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="project-name">项目名称</Label>
              <Input
                id="project-name"
                placeholder="输入项目名称"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project-description">项目描述（可选）</Label>
              <Textarea
                id="project-description"
                placeholder="输入项目描述"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              取消
            </Button>
            <Button onClick={handleCreateProject} disabled={!formData.name.trim()}>
              创建项目
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑项目</DialogTitle>
            <DialogDescription>
              修改项目的名称和描述
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-project-name">项目名称</Label>
              <Input
                id="edit-project-name"
                placeholder="输入项目名称"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleEditProject()}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-project-description">项目描述（可选）</Label>
              <Textarea
                id="edit-project-description"
                placeholder="输入项目描述"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              取消
            </Button>
            <Button onClick={handleEditProject} disabled={!formData.name.trim()}>
              保存修改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Project Dialog */}
      <Dialog
        open={Boolean(deletingProject)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingProject(null);
            setDeleteConfirmName('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除项目</DialogTitle>
            <DialogDescription>
              此操作会永久删除项目“{deletingProject?.name}”，项目内的所有列、卡片和任务数据也会一起删除，删除后无法恢复。
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              为避免误删，请输入项目名称确认删除。
            </div>
            <div className="grid gap-2">
              <Label htmlFor="delete-project-name">
                输入项目名称：{deletingProject?.name}
              </Label>
              <Input
                id="delete-project-name"
                value={deleteConfirmName}
                onChange={(e) => setDeleteConfirmName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleDeleteProject();
                  }
                }}
                placeholder="输入完整项目名称"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeletingProject(null);
                setDeleteConfirmName('');
              }}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProject}
              disabled={!deletingProject || deleteConfirmName !== deletingProject.name}
            >
              删除项目
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface SortableProjectItemProps {
  project: Project;
  isCurrent: boolean;
  canDelete: boolean;
  onSwitch: (projectId: string) => void;
  onEdit: (project: Project, e: React.MouseEvent) => void;
  onDelete: (project: Project, e: React.MouseEvent) => void;
}

function SortableProjectItem({
  project,
  isCurrent,
  canDelete,
  onSwitch,
  onEdit,
  onDelete,
}: SortableProjectItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none transition-colors ${
        isDragging ? 'relative z-10 bg-accent shadow-sm' : 'hover:bg-accent hover:text-accent-foreground'
      }`}
    >
      <button
        type="button"
        className="flex h-6 w-5 cursor-grab items-center justify-center rounded text-muted-foreground hover:text-foreground active:cursor-grabbing"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        title="拖拽排序"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => onSwitch(project.id)}
        className="flex min-w-0 flex-1 items-center gap-2 text-left"
      >
        <FolderOpen className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <span className="min-w-0 flex-1">
          <span className="block truncate">{project.name}</span>
          {project.description && (
            <span className="block truncate text-xs text-muted-foreground">
              {project.description}
            </span>
          )}
        </span>
        {isCurrent && (
          <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
        )}
      </button>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => onEdit(project, e)}
          title="编辑项目"
        >
          <Edit3 className="w-3 h-3" />
        </Button>
        {canDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => onDelete(project, e)}
            title="删除项目"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
