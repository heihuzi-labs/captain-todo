// Tauri API 封装层 - 项目相关
import { invoke } from '@tauri-apps/api/core';
import type { Project } from '@/types/kanban';

// 将后端格式转换为前端类型
function fromBackendProject(data: Record<string, unknown>): Project {
  return {
    id: data.id as string,
    name: data.name as string,
    description: data.description as string | undefined,
    position: data.position as number,
    createdAt: new Date(data.createdAt as string),
    updatedAt: new Date(data.updatedAt as string),
  };
}

export const projectsApi = {
  /** 获取所有项目 */
  async getAll(): Promise<Project[]> {
    const result = await invoke<Record<string, unknown>[]>('get_projects');
    return result.map(fromBackendProject);
  },

  /** 创建项目 */
  async create(project: Partial<Project> & { name: string }): Promise<Project> {
    const now = new Date();
    const backendProject = {
      id: project.id || '',
      name: project.name,
      description: project.description || null,
      position: project.position ?? 0,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    const result = await invoke<Record<string, unknown>>('create_project', {
      project: backendProject,
    });
    return fromBackendProject(result);
  },

  /** 更新项目 */
  async update(project: Project): Promise<Project> {
    const backendProject = {
      id: project.id,
      name: project.name,
      description: project.description || null,
      position: project.position,
      createdAt: project.createdAt instanceof Date ? project.createdAt.toISOString() : project.createdAt,
      updatedAt: new Date().toISOString(),
    };
    const result = await invoke<Record<string, unknown>>('update_project', {
      project: backendProject,
    });
    return fromBackendProject(result);
  },

  /** 删除项目 */
  async delete(projectId: string): Promise<void> {
    await invoke('delete_project', { projectId });
  },

  /** 获取当前项目ID */
  async getCurrentId(): Promise<string | null> {
    const result = await invoke<string | null>('get_current_project');
    return result;
  },

  /** 设置当前项目 */
  async setCurrent(projectId: string): Promise<void> {
    await invoke('set_current_project', { projectId });
  },

  /** 按当前列表顺序保存项目排序 */
  async reorder(projectIds: string[]): Promise<Project[]> {
    const result = await invoke<Record<string, unknown>[]>('reorder_projects', {
      projectIds,
    });
    return result.map(fromBackendProject);
  },
};
