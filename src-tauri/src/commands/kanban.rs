// 看板相关命令
use serde::{Deserialize, Serialize};
use crate::db;

/// 卡片数据结构
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Card {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    #[serde(rename = "columnId")]
    pub column_id: String,
    pub position: i32,
    pub completed: Option<bool>,
    pub priority: Option<String>,
    #[serde(rename = "startDate")]
    pub start_date: Option<String>,
    #[serde(rename = "dueDate")]
    pub due_date: Option<String>,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "updatedAt")]
    pub updated_at: String,
}

/// 列数据结构
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Column {
    pub id: String,
    pub title: String,
    pub position: i32,
    #[serde(rename = "cardIds")]
    pub card_ids: Vec<String>,
    #[serde(rename = "backgroundColor")]
    pub background_color: Option<String>,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "updatedAt")]
    pub updated_at: String,
}

/// 看板数据结构
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Board {
    pub id: String,
    pub title: String,
    pub columns: Vec<Column>,
    pub cards: Vec<Card>,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "updatedAt")]
    pub updated_at: String,
}

/// 获取看板数据
#[tauri::command]
pub async fn get_board(project_id: String, app_handle: tauri::AppHandle) -> Result<Board, String> {
    db::kanban::get_board(&app_handle, &project_id)
        .map_err(|e| e.to_string())
}

/// 保存看板数据
#[tauri::command]
pub async fn save_board(project_id: String, board: Board, app_handle: tauri::AppHandle) -> Result<(), String> {
    db::kanban::save_board(&app_handle, &project_id, &board)
        .map_err(|e| e.to_string())
}

/// 创建卡片
#[tauri::command]
pub async fn create_card(
    project_id: String,
    card: Card,
    app_handle: tauri::AppHandle,
) -> Result<Card, String> {
    db::kanban::create_card(&app_handle, &project_id, &card)
        .map_err(|e| e.to_string())
}

/// 更新卡片
#[tauri::command]
pub async fn update_card(
    project_id: String,
    card: Card,
    app_handle: tauri::AppHandle,
) -> Result<Card, String> {
    db::kanban::update_card(&app_handle, &project_id, &card)
        .map_err(|e| e.to_string())
}

/// 删除卡片
#[tauri::command]
pub async fn delete_card(
    project_id: String,
    card_id: String,
    app_handle: tauri::AppHandle,
) -> Result<(), String> {
    db::kanban::delete_card(&app_handle, &project_id, &card_id)
        .map_err(|e| e.to_string())
}

/// 移动卡片参数
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MoveCardParams {
    pub card_id: String,
    pub from_column_id: String,
    pub to_column_id: String,
    pub new_position: i32,
}

/// 移动卡片
#[tauri::command]
pub async fn move_card(
    project_id: String,
    params: MoveCardParams,
    app_handle: tauri::AppHandle,
) -> Result<(), String> {
    db::kanban::move_card(&app_handle, &project_id, &params)
        .map_err(|e| e.to_string())
}

/// 创建列
#[tauri::command]
pub async fn create_column(
    project_id: String,
    column: Column,
    app_handle: tauri::AppHandle,
) -> Result<Column, String> {
    db::kanban::create_column(&app_handle, &project_id, &column)
        .map_err(|e| e.to_string())
}

/// 更新列
#[tauri::command]
pub async fn update_column(
    project_id: String,
    column: Column,
    app_handle: tauri::AppHandle,
) -> Result<Column, String> {
    db::kanban::update_column(&app_handle, &project_id, &column)
        .map_err(|e| e.to_string())
}

/// 删除列
#[tauri::command]
pub async fn delete_column(
    project_id: String,
    column_id: String,
    app_handle: tauri::AppHandle,
) -> Result<(), String> {
    db::kanban::delete_column(&app_handle, &project_id, &column_id)
        .map_err(|e| e.to_string())
}
