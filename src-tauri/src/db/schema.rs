// 数据库 Schema 定义和迁移
use rusqlite::Connection;

/// 执行数据库迁移
pub fn run_migrations(conn: &Connection) -> Result<(), rusqlite::Error> {
    // 启用外键约束
    conn.execute_batch("PRAGMA foreign_keys = ON;")?;

    // 创建版本表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS schema_version (
            version INTEGER PRIMARY KEY
        )",
        [],
    )?;

    // 获取当前版本
    let current_version: i32 = conn
        .query_row(
            "SELECT COALESCE(MAX(version), 0) FROM schema_version",
            [],
            |row| row.get(0),
        )
        .unwrap_or(0);

    log::info!("Current database version: {}", current_version);

    // 按顺序执行迁移
    if current_version < 1 {
        migrate_v1(conn)?;
    }
    if current_version < 2 {
        migrate_v2(conn)?;
    }
    if current_version < 3 {
        migrate_v3(conn)?;
    }

    Ok(())
}

/// V3 迁移: 为项目添加排序字段
fn migrate_v3(conn: &Connection) -> Result<(), rusqlite::Error> {
    log::info!("Running migration V3...");

    conn.execute(
        "ALTER TABLE projects ADD COLUMN position INTEGER DEFAULT 0",
        [],
    )?;

    conn.execute(
        "UPDATE projects
         SET position = (
             SELECT COUNT(*)
             FROM projects AS newer_projects
             WHERE newer_projects.created_at > projects.created_at
         )",
        [],
    )?;

    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_projects_position ON projects(position)",
        [],
    )?;

    conn.execute("INSERT INTO schema_version (version) VALUES (3)", [])?;

    log::info!("Migration V3 completed");
    Ok(())
}

/// V1 迁移: 创建基础表
fn migrate_v1(conn: &Connection) -> Result<(), rusqlite::Error> {
    log::info!("Running migration V1...");

    // 项目表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )",
        [],
    )?;

    // 列表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS columns (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            title TEXT NOT NULL,
            position INTEGER NOT NULL,
            background_color TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        )",
        [],
    )?;

    // 卡片表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS cards (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            column_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            position INTEGER NOT NULL,
            completed INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
            FOREIGN KEY (column_id) REFERENCES columns(id) ON DELETE CASCADE
        )",
        [],
    )?;

    // 活动日志表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS activities (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            type TEXT NOT NULL,
            card_id TEXT,
            column_id TEXT,
            from_column_id TEXT,
            to_column_id TEXT,
            title TEXT NOT NULL,
            description TEXT,
            timestamp TEXT NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        )",
        [],
    )?;

    // 设置表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )",
        [],
    )?;

    // 创建索引
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_cards_project_id ON cards(project_id)",
        [],
    )?;
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_cards_column_id ON cards(column_id)",
        [],
    )?;
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_columns_project_id ON columns(project_id)",
        [],
    )?;
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_activities_project_id ON activities(project_id)",
        [],
    )?;

    // 更新版本
    conn.execute("INSERT INTO schema_version (version) VALUES (1)", [])?;

    log::info!("Migration V1 completed");
    Ok(())
}

/// V2 迁移: 添加 priority, start_date, due_date 字段
fn migrate_v2(conn: &Connection) -> Result<(), rusqlite::Error> {
    log::info!("Running migration V2...");

    // 添加 priority 字段
    conn.execute(
        "ALTER TABLE cards ADD COLUMN priority TEXT DEFAULT 'low'",
        [],
    )?;

    // 添加 start_date 字段
    conn.execute("ALTER TABLE cards ADD COLUMN start_date TEXT", [])?;

    // 添加 due_date 字段
    conn.execute("ALTER TABLE cards ADD COLUMN due_date TEXT", [])?;

    // 更新版本
    conn.execute("INSERT INTO schema_version (version) VALUES (2)", [])?;

    log::info!("Migration V2 completed");
    Ok(())
}
