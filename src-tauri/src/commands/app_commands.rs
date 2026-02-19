use tauri::menu::{Menu, MenuItem, Submenu};
use tauri::{AppHandle, Emitter, Wry};

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
    app.emit("change-directory", ())
        .expect("failed to change directory")
}
