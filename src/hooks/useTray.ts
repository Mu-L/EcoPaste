import { emit } from "@tauri-apps/api/event";
import { Menu, MenuItem, PredefinedMenuItem } from "@tauri-apps/api/menu";
import { resolveResource } from "@tauri-apps/api/path";
import { TrayIcon, type TrayIconOptions } from "@tauri-apps/api/tray";
import { openUrl } from "@tauri-apps/plugin-opener";
import { exit, relaunch } from "@tauri-apps/plugin-process";

export const useTray = () => {
	const [startListen, { toggle }] = useBoolean(true);
	const { t } = useTranslation();

	// 监听是否显示菜单栏图标
	useSubscribeKey(globalStore.app, "showMenubarIcon", async (value) => {
		const tray = await getTrayById();

		if (tray) {
			tray.setVisible(value);
		} else {
			createTray();
		}
	});

	// 监听语言变更
	useSubscribeKey(globalStore.appearance, "language", () => {
		updateTrayMenu();
	});

	useUpdateEffect(() => {
		updateTrayMenu();

		emit(LISTEN_KEY.TOGGLE_LISTEN_CLIPBOARD, startListen);
	}, [startListen]);

	// 通过 id 获取托盘图标
	const getTrayById = () => {
		return TrayIcon.getById(TRAY_ID);
	};

	// 创建托盘
	const createTray = async () => {
		if (!globalStore.app.showMenubarIcon) return;

		const tray = await getTrayById();

		if (tray) return;

		const { appName, appVersion } = globalStore.env;

		const menu = await getTrayMenu();

		const iconPath = isMac ? "assets/tray-mac.ico" : "assets/tray.ico";
		const icon = await resolveResource(iconPath);

		const options: TrayIconOptions = {
			menu,
			icon,
			id: TRAY_ID,
			tooltip: `${appName} v${appVersion}`,
			iconAsTemplate: true,
			menuOnLeftClick: isMac,
			action: (event) => {
				if (isMac) return;

				if (event.type === "Click" && event.button === "Left") {
					showWindow("main");
				}
			},
		};

		return TrayIcon.new(options);
	};

	// 获取托盘菜单
	const getTrayMenu = async () => {
		const { appVersion } = globalStore.env;

		const items = await Promise.all([
			MenuItem.new({
				text: t("component.tray.label.preference"),
				accelerator: isMac ? "Cmd+," : void 0,
				action: () => showWindow("preference"),
			}),
			MenuItem.new({
				text: startListen
					? t("component.tray.label.stop_listening")
					: t("component.tray.label.start_listening"),
				action: toggle,
			}),
			PredefinedMenuItem.new({ item: "Separator" }),
			MenuItem.new({
				text: t("component.tray.label.check_update"),
				action: () => {
					showWindow();

					emit(LISTEN_KEY.UPDATE_APP, true);
				},
			}),
			MenuItem.new({
				text: t("component.tray.label.open_source_address"),
				action: () => openUrl(GITHUB_LINK),
			}),
			PredefinedMenuItem.new({ item: "Separator" }),
			MenuItem.new({
				text: `${t("component.tray.label.version")} ${appVersion}`,
				enabled: false,
			}),
			MenuItem.new({
				text: t("component.tray.label.relaunch"),
				action: relaunch,
			}),
			MenuItem.new({
				text: t("component.tray.label.exit"),
				accelerator: isMac ? "Cmd+Q" : void 0,
				action: () => exit(0),
			}),
		]);

		return Menu.new({ items });
	};

	// 更新托盘菜单
	const updateTrayMenu = async () => {
		const tray = await getTrayById();

		if (!tray) return;

		const menu = await getTrayMenu();

		tray.setMenu(menu);
	};

	return {
		createTray,
	};
};
