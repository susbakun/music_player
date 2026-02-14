use rodio::Sink;
use std::sync::{Arc, Mutex,};
use tauri::Manager;

#[cfg(target_os = "macos")]
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};

mod commands;
mod prelude;

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
            let window = app.get_webview_window("main").unwrap();
            #[cfg(target_os = "macos")]
            apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None)
                .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");

            app.manage(Mutex::new(AppData::default()));
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::read_songs,
            commands::play_song,
            commands::pause_song,
            commands::get_song_position,
            commands::change_song_position
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
