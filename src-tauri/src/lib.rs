use rodio::Sink;
use std::sync::{Arc, Mutex,};
use tauri::Manager;

#[cfg(target_os = "macos")]
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};

mod commands;
mod prelude;

pub use commands::*;

#[derive(Default)]
struct AppData {
    pub sink: Option<Arc<Sink>>,
    pub current_song_name: Option<String>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            // making the window transparent
            let window = app.get_webview_window("main")
                .expect("Failed to retrieve window object");
            #[cfg(target_os = "macos")]
            apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None)
                .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");

            // custom menu
            let menu = build_menu(app.handle())?;
            app.set_menu(menu)?;

            app.manage(Mutex::new(AppData::default()));
            Ok(())
        })
        .on_menu_event(|app, event| {
            let event_id = event.id().0.as_str();
            match  event_id {
                "change_directory_id" => change_directory(app.app_handle()),
                _ => {}
            }
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            read_songs,
            play_song,
            pause_song,
            get_song_position,
            change_song_position,
            change_master_volume
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
