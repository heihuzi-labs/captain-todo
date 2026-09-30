// 项目管理相关命令
use crate::db;
use serde::{Deserialize, Serialize};

/// 项目数据结构
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Project {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub position: i32,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "updatedAt")]
    pub updated_at: String,
}

/// 获取所有项目
#[tauri::command]
pub async fn get_projects(app_handle: tauri::AppHandle) -> Result<Vec<Project>, String> {
    db::projects::get_all_projects(&app_handle).map_err(|e| e.to_string())
}

/// 创建项目
#[tauri::command]
pub async fn create_project(
    project: Project,
    app_handle: tauri::AppHandle,
) -> Result<Project, String> {
    db::projects::create_project(&app_handle, &project).map_err(|e| e.to_string())
}

/// 更新项目
#[tauri::command]
pub async fn update_project(
    project: Project,
    app_handle: tauri::AppHandle,
) -> Result<Project, String> {
    db::projects::update_project(&app_handle, &project).map_err(|e| e.to_string())
}

/// 删除项目
#[tauri::command]
pub async fn delete_project(
    project_id: String,
    app_handle: tauri::AppHandle,
) -> Result<(), String> {
    db::projects::delete_project(&app_handle, &project_id).map_err(|e| e.to_string())
}

/// 保存项目排序
#[tauri::command]
pub async fn reorder_projects(
    project_ids: Vec<String>,
    app_handle: tauri::AppHandle,
) -> Result<Vec<Project>, String> {
    db::projects::reorder_projects(&app_handle, &project_ids).map_err(|e| e.to_string())
}

/// 获取当前选中的项目ID
#[tauri::command]
pub async fn get_current_project(app_handle: tauri::AppHandle) -> Result<Option<String>, String> {
    db::projects::get_current_project(&app_handle).map_err(|e| e.to_string())
}

/// 设置当前项目
#[tauri::command]
pub async fn set_current_project(
    project_id: String,
    app_handle: tauri::AppHandle,
) -> Result<(), String> {
    db::projects::set_current_project(&app_handle, &project_id).map_err(|e| e.to_string())
}
