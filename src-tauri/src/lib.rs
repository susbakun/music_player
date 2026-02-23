use std::sync::Mutex;
use tauri::Manager;

#[cfg(target_os = "macos")]
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};

mod commands;
mod prelude;

pub use commands::*;

use crate::prelude::AppData;



#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(tauri_plugin_log::log::LevelFilter::Info)
                .build(),
        )
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            // making the window transparent
            let window = app
                .get_webview_window("main")
                .expect("Failed to retrieve window object");
            #[cfg(target_os = "macos")]
            apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None)
                .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");

            // custom menu
            let menu = build_menu(app.handle())?;
            app.set_menu(menu)?;

            // reading db
            let db_conn = setup_db(app.handle())?;

            // adding state
            app.manage(Mutex::new(
                AppData::new(db_conn)
            ));
            Ok(())
        })
        .on_menu_event(|app, event| {
            let event_id = event.id().0.as_str();
            match event_id {
                "change_directory_id" => change_directory(app.app_handle()),
                "create_playlist_id" => send_create_playlist_message(app.app_handle()),
                _ => {}
            }
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            read_songs,
            watch_dir,
            play_song,
            pause_song,
            get_song_position,
            change_song_position,
            change_master_volume,
            get_playlists,
            get_playlist_tracks,
            create_playlist,
            edit_playlist_name,
            delete_playlist,
            add_to_playlist,
            remove_from_playlist,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
