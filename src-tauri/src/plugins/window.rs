use tauri::{
    command, generate_handler,
    plugin::{Builder, TauriPlugin},
    Window, Wry,
};

// 主窗口的label
pub static MAIN_WINDOW_LABEL: &str = "main";
// 偏好设置窗口的label
pub static PREFERENCE_WINDOW_LABEL: &str = "preference";
// 主窗口的title
pub static MAIN_WINDOW_TITLE: &str = "EcoPaste";

// 显示窗口（非linux）
#[cfg(not(target_os = "linux"))]
#[command]
pub async fn show_window(window: Window) {
    window.show().unwrap();
    window.unminimize().unwrap();
    window.set_focus().unwrap();
}

// 显示窗口（linux）
#[cfg(target_os = "linux")]
#[command]
pub async fn show_window(window: Window) {
    let position = window.outer_position().unwrap();
    let physical_position = tauri::PhysicalPosition::new(position.x, position.y);

    window.hide().unwrap();
    window.set_position(physical_position).unwrap();
    window.show().unwrap();
}

// 隐藏窗口
#[command]
pub async fn hide_window(window: Window) {
    window.hide().unwrap();
}

// 给窗口添加阴影
#[command]
pub async fn set_window_shadow(window: Window) {
    #[cfg(not(target_os = "linux"))]
    window_shadows::set_shadow(&window, true).unwrap();

    let _ = window;
}

// 磨砂窗口：https://github.com/tauri-apps/window-vibrancy
#[command]
pub fn frosted_window(window: Window) {
    #[cfg(target_os = "macos")]
    window_vibrancy::apply_vibrancy(
        &window,
        window_vibrancy::NSVisualEffectMaterial::Sidebar,
        Some(window_vibrancy::NSVisualEffectState::Active),
        Some(10.0),
    )
    .unwrap();

    let _ = window;
}

pub fn init() -> TauriPlugin<Wry> {
    Builder::new("window")
        .invoke_handler(generate_handler![
            show_window,
            hide_window,
            set_window_shadow,
            frosted_window
        ])
        .build()
}
