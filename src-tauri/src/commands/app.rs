use std::path::Path;
use std::sync::mpsc;
use std::thread;

use notify::{RecursiveMode, Watcher};
use tauri::menu::{Menu, MenuItem, Submenu};
use tauri::{AppHandle, Emitter, Manager, Wry};

pub fn build_menu(app: &AppHandle) -> tauri::Result<Menu<Wry>> {
    let menu = Menu::default(app)?;

    // removing the default file submenu
    // and inserting our own submenu
    menu.remove_at(1)?;
    let file_submenu = Submenu::new(app, "File", true)?;

    file_submenu.append(&MenuItem::with_id(
        app,
        "change_directory_id",
        "Change Directory",
        true,
        Some("CmdOrCtrl+D"),
    )?)?;

    menu.insert(&file_submenu, 1)?;

    Ok(menu)
}

pub fn change_directory(app: &AppHandle) {
    app.emit("choose-directory", ())
        .expect("failed to change directory")
}


#[tauri::command(rename_all = "snake_case")]
pub fn watch_dir(path: String, window: AppHandle) -> Result<(), String> {
    
    thread::spawn(move || -> Result<(), String> {
        let apphandle = window.app_handle();

        let (tx, rx) = mpsc::channel();
    
        let mut watcher = notify::recommended_watcher(tx)
            .map_err(|e| e.to_string())?;
        watcher.watch(Path::new(&path), RecursiveMode::Recursive)
            .map_err(|e| e.to_string())?;

        for res in rx {
            match res {
                Ok(_) => {
                    apphandle.emit("directory-changed", ())
                        .map_err(|e| e.to_string())
                },
                Err(e) => Err(e.to_string()),
            }?
        }
        Ok(())
    });

    Ok(())
}