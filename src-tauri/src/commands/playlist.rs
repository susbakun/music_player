use std::sync::Mutex;

use tauri::{AppHandle, Manager};
use uuid::Uuid;

use crate::prelude::AppData;

#[tauri::command(rename_all = "snake_case")]
pub fn get_playlists(window: AppHandle) -> Result<Vec<String>, String> {
    let app_handle = window.app_handle();
    let state = app_handle.state::<Mutex<AppData>>();

    let state= state.lock()
        .map_err(|e| e.to_string())?;

    let db_conn = &state.db_conn;

    let mut stmt = db_conn.prepare("SELECT * FROM playlists")
        .map_err(|e| e.to_string())?;
    let mut rows = stmt.query([])
        .map_err(|e| e.to_string())?;

    let mut results = Vec::new();

    while let Some(row) = rows.next().unwrap() {
        let name: String = row.get(1).map_err(|e| e.to_string())?;
        results.push(name);
    };

    Ok(results)

}


#[tauri::command(rename_all = "snake_case")]
pub fn create_playlist(
    playlist_name: String, 
    window: AppHandle
) -> Result<(), String> {
    let app_handle = window.app_handle();
    let state = app_handle.state::<Mutex<AppData>>();

    let state= state.lock()
        .map_err(|e| e.to_string())?;

    let db_conn = &state.db_conn;

    let id = Uuid::new_v4().to_string();

    db_conn
        .execute(
            "INSERT INTO playlists (id, name) VALUES (?1, ?2)", 
            [&id, &playlist_name])
        .unwrap();

    Ok(())    
}
