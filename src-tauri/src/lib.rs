// 船长待办 - Tauri 后端入口
// 四层架构: Commands -> Services -> DB

mod commands;
mod db;

/// 获取应用版本信息
#[tauri::command]
fn get_app_info() -> serde_json::Value {
    serde_json::json!({
        "name": "船长待办",
        "version": env!("CARGO_PKG_VERSION"),
        "description": env!("CARGO_PKG_DESCRIPTION"),
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // 初始化日志
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // 初始化数据库
            let app_handle = app.handle().clone();
            if let Err(e) = db::init_database(&app_handle) {
                log::error!("Failed to initialize database: {}", e);
            } else {
                log::info!("Database initialized successfully");
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_app_info,
            commands::kanban::get_board,
            commands::kanban::save_board,
            commands::kanban::create_card,
            commands::kanban::update_card,
            commands::kanban::delete_card,
            commands::kanban::move_card,
            commands::kanban::create_column,
            commands::kanban::update_column,
            commands::kanban::delete_column,
            commands::projects::get_projects,
            commands::projects::create_project,
            commands::projects::update_project,
            commands::projects::delete_project,
            commands::projects::reorder_projects,
            commands::projects::get_current_project,
            commands::projects::set_current_project,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
