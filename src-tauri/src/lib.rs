use rodio::{OutputStream, Sink};
use tauri::Manager;
use std::sync::{Arc, Mutex};

mod commands;

#[derive(Default)]
struct AppData {
    pub sink: Option<Arc<Sink>>,
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            app.manage(Mutex::new(AppData::default()));
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![commands::read_songs, 
            commands::play_song, commands::pause_song])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
