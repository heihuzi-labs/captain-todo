// 数据库模块
// 使用 SQLite 进行数据持久化

pub mod kanban;
pub mod projects;
mod schema;

use rusqlite::Connection;
use std::{
    path::{Path, PathBuf},
    sync::Mutex,
    time::{SystemTime, UNIX_EPOCH},
};
use tauri::{AppHandle, Manager};
use thiserror::Error;

/// 数据库错误类型
#[derive(Error, Debug)]
pub enum DbError {
    #[error("SQLite error: {0}")]
    Sqlite(#[from] rusqlite::Error),
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("Serialization error: {0}")]
    Serde(#[from] serde_json::Error),
    #[error("Database not initialized")]
    NotInitialized,
    #[error("Lock poisoned")]
    LockPoisoned,
    #[error("Item not found: {0}")]
    #[allow(dead_code)]
    NotFound(String),
}

/// 数据库连接状态
pub struct DbState {
    pub conn: Mutex<Connection>,
}

/// 初始化数据库
pub fn init_database(app_handle: &AppHandle) -> Result<(), DbError> {
    // 获取应用数据目录
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|_| DbError::Io(std::io::Error::new(
            std::io::ErrorKind::NotFound,
            "Could not get app data directory",
        )))?;

    // 确保目录存在
    std::fs::create_dir_all(&app_dir)?;

    let db_path = app_dir.join("captaintodo.db");
    migrate_legacy_database_if_needed(&app_dir, &db_path)?;
    log::info!("Database path: {:?}", db_path);

    // 打开或创建数据库
    let conn = Connection::open(&db_path)?;

    // 执行数据库迁移
    schema::run_migrations(&conn)?;

    // 将连接存储到应用状态
    app_handle.manage(DbState {
        conn: Mutex::new(conn),
    });

    Ok(())
}

fn migrate_legacy_database_if_needed(app_dir: &Path, db_path: &Path) -> Result<(), DbError> {
    let Some(legacy_db_path) = legacy_database_path(app_dir) else {
        return Ok(());
    };

    if !legacy_db_path.exists() {
        return Ok(());
    }

    if !db_path.exists() {
        std::fs::copy(&legacy_db_path, db_path)?;
        log::info!(
            "Migrated legacy database from {:?} to {:?}",
            legacy_db_path,
            db_path
        );
        return Ok(());
    }

    if is_bootstrap_database(db_path)? {
        let backup_path = backup_database_path(db_path);
        std::fs::rename(db_path, &backup_path)?;
        std::fs::copy(&legacy_db_path, db_path)?;
        log::info!(
            "Replaced bootstrap database with legacy database from {:?}; backup saved at {:?}",
            legacy_db_path,
            backup_path
        );
    }

    Ok(())
}

fn legacy_database_path(app_dir: &Path) -> Option<PathBuf> {
    let app_support_dir = app_dir.parent()?;
    Some(app_support_dir.join("com.zetodo.app").join("zetodo.db"))
}

fn backup_database_path(db_path: &Path) -> PathBuf {
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_secs())
        .unwrap_or(0);
    db_path.with_extension(format!("db.bootstrap-{}.bak", timestamp))
}

fn is_bootstrap_database(db_path: &Path) -> Result<bool, DbError> {
    let conn = Connection::open(db_path)?;

    if !table_exists(&conn, "projects")? {
        return Ok(true);
    }

    let project_count: i64 = conn.query_row("SELECT COUNT(*) FROM projects", [], |row| row.get(0))?;
    if project_count > 1 {
        return Ok(false);
    }

    if !table_exists(&conn, "cards")? {
        return Ok(true);
    }

    let card_count: i64 = conn.query_row("SELECT COUNT(*) FROM cards", [], |row| row.get(0))?;
    Ok(card_count == 0)
}

fn table_exists(conn: &Connection, table_name: &str) -> Result<bool, DbError> {
    let exists: i64 = conn.query_row(
        "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = ?",
        [table_name],
        |row| row.get(0),
    )?;
    Ok(exists > 0)
}

/// 使用数据库连接执行操作
pub fn with_connection<F, T>(app_handle: &AppHandle, f: F) -> Result<T, DbError>
where
    F: FnOnce(&Connection) -> Result<T, DbError>,
{
    let state = app_handle
        .try_state::<DbState>()
        .ok_or(DbError::NotInitialized)?;

    let conn = state.conn.lock().map_err(|_| DbError::LockPoisoned)?;
    f(&conn)
}
