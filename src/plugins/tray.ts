import { invoke } from "@tauri-apps/api";

/**
 * 设置托盘的可见性
 */
export const setTrayVisible = (visible: boolean) => {
	invoke(TRAY_PLUGIN.SET_TRAY_VISIBLE, {
		visible,
	});
};
