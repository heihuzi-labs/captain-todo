// 看板相关数据库操作
use super::{with_connection, DbError};
use crate::commands::kanban::{Board, Card, Column, MoveCardParams};
use chrono::Utc;
use rusqlite::Connection;
use tauri::AppHandle;
use uuid::Uuid;

/// 获取看板数据
pub fn get_board(app_handle: &AppHandle, project_id: &str) -> Result<Board, DbError> {
    let pid = project_id.to_string();
    with_connection(app_handle, |conn| {
        get_board_impl(conn, &pid)
    })
}

fn get_board_impl(conn: &Connection, project_id: &str) -> Result<Board, DbError> {
    // 获取所有列
    let mut stmt = conn.prepare(
        "SELECT id, title, position, background_color, created_at, updated_at
         FROM columns WHERE project_id = ? ORDER BY position"
    )?;

    let columns_iter = stmt.query_map([project_id], |row| {
        Ok(Column {
            id: row.get(0)?,
            title: row.get(1)?,
            position: row.get(2)?,
            card_ids: Vec::new(),
            background_color: row.get(3)?,
            created_at: row.get(4)?,
            updated_at: row.get(5)?,
        })
    })?;

    let mut columns: Vec<Column> = columns_iter.filter_map(|c| c.ok()).collect();

    // 获取所有卡片
    let mut stmt = conn.prepare(
        "SELECT id, title, description, column_id, position, completed, priority, start_date, due_date, created_at, updated_at
         FROM cards WHERE project_id = ? ORDER BY position"
    )?;

    let cards_iter = stmt.query_map([project_id], |row| {
        let completed: Option<i32> = row.get(5)?;
        Ok(Card {
            id: row.get(0)?,
            title: row.get(1)?,
            description: row.get(2)?,
            column_id: row.get(3)?,
            position: row.get(4)?,
            completed: completed.map(|c| c == 1),
            priority: row.get(6)?,
            start_date: row.get(7)?,
            due_date: row.get(8)?,
            created_at: row.get(9)?,
            updated_at: row.get(10)?,
        })
    })?;

    let cards: Vec<Card> = cards_iter.filter_map(|c| c.ok()).collect();

    // 填充每列的卡片ID
    for column in &mut columns {
        column.card_ids = cards
            .iter()
            .filter(|c| c.column_id == column.id)
            .map(|c| c.id.clone())
            .collect();
    }

    let now = Utc::now().to_rfc3339();
    Ok(Board {
        id: project_id.to_string(),
        title: "看板".to_string(),
        columns,
        cards,
        created_at: now.clone(),
        updated_at: now,
    })
}

/// 保存看板数据 (全量保存)
pub fn save_board(app_handle: &AppHandle, project_id: &str, board: &Board) -> Result<(), DbError> {
    let pid = project_id.to_string();
    let b = board.clone();
    with_connection(app_handle, |conn| {
        save_board_impl(conn, &pid, &b)
    })
}

fn save_board_impl(conn: &Connection, project_id: &str, board: &Board) -> Result<(), DbError> {
    // 开启事务
    conn.execute("BEGIN TRANSACTION", [])?;

    // 删除旧数据
    conn.execute("DELETE FROM cards WHERE project_id = ?", [project_id])?;
    conn.execute("DELETE FROM columns WHERE project_id = ?", [project_id])?;

    // 插入新列
    for column in &board.columns {
        conn.execute(
            "INSERT INTO columns (id, project_id, title, position, background_color, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)",
            rusqlite::params![
                column.id,
                project_id,
                column.title,
                column.position,
                column.background_color,
                column.created_at,
                column.updated_at,
            ],
        )?;
    }

    // 插入新卡片
    for card in &board.cards {
        let completed = card.completed.map(|c| if c { 1 } else { 0 });
        conn.execute(
            "INSERT INTO cards (id, project_id, column_id, title, description, position, completed, priority, start_date, due_date, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            rusqlite::params![
                card.id,
                project_id,
                card.column_id,
                card.title,
                card.description,
                card.position,
                completed,
                card.priority,
                card.start_date,
                card.due_date,
                card.created_at,
                card.updated_at,
            ],
        )?;
    }

    conn.execute("COMMIT", [])?;
    Ok(())
}

/// 创建卡片
pub fn create_card(app_handle: &AppHandle, project_id: &str, card: &Card) -> Result<Card, DbError> {
    let pid = project_id.to_string();
    let c = card.clone();
    with_connection(app_handle, |conn| {
        create_card_impl(conn, &pid, &c)
    })
}

fn create_card_impl(conn: &Connection, project_id: &str, card: &Card) -> Result<Card, DbError> {
    let now = Utc::now().to_rfc3339();
    let id = if card.id.is_empty() { Uuid::new_v4().to_string() } else { card.id.clone() };

    let completed = card.completed.map(|c| if c { 1 } else { 0 });
    conn.execute(
        "INSERT INTO cards (id, project_id, column_id, title, description, position, completed, priority, start_date, due_date, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        rusqlite::params![
            id,
            project_id,
            card.column_id,
            card.title,
            card.description,
            card.position,
            completed,
            card.priority,
            card.start_date,
            card.due_date,
            now,
            now,
        ],
    )?;

    Ok(Card {
        id,
        title: card.title.clone(),
        description: card.description.clone(),
        column_id: card.column_id.clone(),
        position: card.position,
        completed: card.completed,
        priority: card.priority.clone(),
        start_date: card.start_date.clone(),
        due_date: card.due_date.clone(),
        created_at: now.clone(),
        updated_at: now,
    })
}

/// 更新卡片
pub fn update_card(app_handle: &AppHandle, _project_id: &str, card: &Card) -> Result<Card, DbError> {
    let c = card.clone();
    with_connection(app_handle, |conn| {
        update_card_impl(conn, &c)
    })
}

fn update_card_impl(conn: &Connection, card: &Card) -> Result<Card, DbError> {
    let now = Utc::now().to_rfc3339();

    let completed = card.completed.map(|c| if c { 1 } else { 0 });
    conn.execute(
        "UPDATE cards SET title = ?, description = ?, column_id = ?, position = ?, completed = ?, priority = ?, start_date = ?, due_date = ?, updated_at = ?
         WHERE id = ?",
        rusqlite::params![
            card.title,
            card.description,
            card.column_id,
            card.position,
            completed,
            card.priority,
            card.start_date,
            card.due_date,
            now,
            card.id,
        ],
    )?;

    Ok(Card {
        id: card.id.clone(),
        title: card.title.clone(),
        description: card.description.clone(),
        column_id: card.column_id.clone(),
        position: card.position,
        completed: card.completed,
        priority: card.priority.clone(),
        start_date: card.start_date.clone(),
        due_date: card.due_date.clone(),
        created_at: card.created_at.clone(),
        updated_at: now,
    })
}

/// 删除卡片
pub fn delete_card(app_handle: &AppHandle, _project_id: &str, card_id: &str) -> Result<(), DbError> {
    let cid = card_id.to_string();
    with_connection(app_handle, |conn| {
        conn.execute("DELETE FROM cards WHERE id = ?", [&cid])?;
        Ok(())
    })
}

/// 移动卡片
pub fn move_card(app_handle: &AppHandle, _project_id: &str, params: &MoveCardParams) -> Result<(), DbError> {
    let p = params.clone();
    with_connection(app_handle, |conn| {
        let now = Utc::now().to_rfc3339();
        conn.execute(
            "UPDATE cards SET column_id = ?, position = ?, updated_at = ? WHERE id = ?",
            rusqlite::params![
                p.to_column_id,
                p.new_position,
                now,
                p.card_id,
            ],
        )?;
        Ok(())
    })
}

/// 创建列
pub fn create_column(app_handle: &AppHandle, project_id: &str, column: &Column) -> Result<Column, DbError> {
    let pid = project_id.to_string();
    let c = column.clone();
    with_connection(app_handle, |conn| {
        create_column_impl(conn, &pid, &c)
    })
}

fn create_column_impl(conn: &Connection, project_id: &str, column: &Column) -> Result<Column, DbError> {
    let now = Utc::now().to_rfc3339();
    let id = if column.id.is_empty() { Uuid::new_v4().to_string() } else { column.id.clone() };

    conn.execute(
        "INSERT INTO columns (id, project_id, title, position, background_color, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)",
        rusqlite::params![
            id,
            project_id,
            column.title,
            column.position,
            column.background_color,
            now,
            now,
        ],
    )?;

    Ok(Column {
        id,
        title: column.title.clone(),
        position: column.position,
        card_ids: Vec::new(),
        background_color: column.background_color.clone(),
        created_at: now.clone(),
        updated_at: now,
    })
}

/// 更新列
pub fn update_column(app_handle: &AppHandle, _project_id: &str, column: &Column) -> Result<Column, DbError> {
    let c = column.clone();
    with_connection(app_handle, |conn| {
        update_column_impl(conn, &c)
    })
}

fn update_column_impl(conn: &Connection, column: &Column) -> Result<Column, DbError> {
    let now = Utc::now().to_rfc3339();

    conn.execute(
        "UPDATE columns SET title = ?, position = ?, background_color = ?, updated_at = ? WHERE id = ?",
        rusqlite::params![
            column.title,
            column.position,
            column.background_color,
            now,
            column.id,
        ],
    )?;

    Ok(Column {
        id: column.id.clone(),
        title: column.title.clone(),
        position: column.position,
        card_ids: column.card_ids.clone(),
        background_color: column.background_color.clone(),
        created_at: column.created_at.clone(),
        updated_at: now,
    })
}

/// 删除列
pub fn delete_column(app_handle: &AppHandle, _project_id: &str, column_id: &str) -> Result<(), DbError> {
    let cid = column_id.to_string();
    with_connection(app_handle, |conn| {
        // 先删除列中的卡片
        conn.execute("DELETE FROM cards WHERE column_id = ?", [&cid])?;
        // 再删除列
        conn.execute("DELETE FROM columns WHERE id = ?", [&cid])?;
        Ok(())
    })
}
