import { useState, useCallback, useEffect } from 'react';
import { Project } from '../types/kanban';
import { projectsApi } from '../lib/api/projects';

export function useProjectStore() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化：从数据库加载项目列表和当前项目
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [projectList, currentId] = await Promise.all([
          projectsApi.getAll(),
          projectsApi.getCurrentId(),
        ]);

        // 如果没有项目，创建一个默认项目
        if (projectList.length === 0) {
          const defaultProject = await projectsApi.create({
            name: '默认项目',
            description: '这是您的第一个项目',
          });
          setProjects([defaultProject]);
          setCurrentProjectId(defaultProject.id);
          await projectsApi.setCurrent(defaultProject.id);
        } else {
          setProjects(projectList);
          // 如果没有当前项目，设置第一个项目为当前项目
          if (currentId && projectList.find(p => p.id === currentId)) {
            setCurrentProjectId(currentId);
          } else {
            setCurrentProjectId(projectList[0].id);
            await projectsApi.setCurrent(projectList[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to load projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const currentProject = projects.find(p => p.id === currentProjectId) || projects[0];

  const createProject = useCallback(async (name: string, description?: string) => {
    try {
      const newProject = await projectsApi.create({ name, description });
      setProjects(prev => [...prev, newProject]);
      setCurrentProjectId(newProject.id);
      await projectsApi.setCurrent(newProject.id);
      return newProject;
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  }, []);

  const updateProject = useCallback(async (projectId: string, updates: Partial<Pick<Project, 'name' | 'description'>>) => {
    try {
      const project = projects.find(p => p.id === projectId);
      if (!project) return;

      const updatedProject = await projectsApi.update({
        ...project,
        ...updates,
        updatedAt: new Date(),
      });

      setProjects(prev =>
        prev.map(p => p.id === projectId ? updatedProject : p)
      );
    } catch (error) {
      console.error('Failed to update project:', error);
      throw error;
    }
  }, [projects]);

  const deleteProject = useCallback(async (projectId: string) => {
    if (projects.length <= 1) {
      alert('至少需要保留一个项目');
      return false;
    }

    try {
      await projectsApi.delete(projectId);

      const remainingProjects = projects.filter(p => p.id !== projectId);
      setProjects(remainingProjects);

      // 如果删除的是当前项目，切换到另一个项目
      if (projectId === currentProjectId) {
        const newCurrentId = remainingProjects[0].id;
        setCurrentProjectId(newCurrentId);
        await projectsApi.setCurrent(newCurrentId);
      }

      return true;
    } catch (error) {
      console.error('Failed to delete project:', error);
      return false;
    }
  }, [projects, currentProjectId]);

  const reorderProjects = useCallback(async (projectIds: string[]) => {
    if (projectIds.length !== projects.length) {
      return;
    }

    const projectMap = new Map(projects.map(project => [project.id, project]));
    const reorderedProjects = projectIds
      .map(projectId => projectMap.get(projectId))
      .filter((project): project is Project => Boolean(project));

    if (reorderedProjects.length !== projects.length) {
      return;
    }

    const optimisticProjects = reorderedProjects.map((project, index) => ({
      ...project,
      position: index,
      updatedAt: new Date(),
    }));

    setProjects(optimisticProjects);

    try {
      const savedProjects = await projectsApi.reorder(projectIds);
      setProjects(savedProjects);
    } catch (error) {
      console.error('Failed to reorder projects:', error);
      setProjects(projects);
    }
  }, [projects]);

  const switchProject = useCallback(async (projectId: string) => {
    if (projects.find(p => p.id === projectId)) {
      setCurrentProjectId(projectId);
      await projectsApi.setCurrent(projectId);
    }
  }, [projects]);

  return {
    projects,
    currentProject,
    currentProjectId,
    isLoading,
    createProject,
    updateProject,
    deleteProject,
    reorderProjects,
    switchProject,
  };
}
