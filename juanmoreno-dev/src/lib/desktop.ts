import {
	closeWindowFrame,
	minimizeWindowFrame,
	openWindowFrame,
	syncWindowFrameTaskbarState,
} from "./window-frame";

const updateDesktopScale = () => {
	const desktopCanvas = document.getElementById("desktop-canvas");
	if (!desktopCanvas) return;

	const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
	const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
	const taskbarHeight =
		document.querySelector("footer")?.getBoundingClientRect().height ?? 40;
	const baseWidth = 1920;
	const baseHeight = 1040;
	const scale = Math.min(
		viewportWidth / baseWidth,
		(viewportHeight - taskbarHeight) / baseHeight,
		1
	);

	desktopCanvas.style.transform = `scale(${scale})`;
	document.documentElement.style.setProperty("--desktop-scale", String(scale));
};

const setupDesktopApp = (appId: string, title: string) => {
	const iconEl = document.getElementById(`${appId}-icon`);
	const windowId = `${appId}-window`;
	const windowEl = document.getElementById(windowId);
	const frameEl = windowEl?.querySelector(`[data-window-id="${windowId}"]`);
	const closeBtn = document.querySelector(`[data-window-close="${windowId}"]`);

	const getIconUrl = () => iconEl?.querySelector("img")?.getAttribute("src") ?? "";

	const ensureTaskbarButton = () => {
		const taskbarItems = document.getElementById("taskbar-items");
		if (!taskbarItems) return null;

		let btn: HTMLButtonElement | null = taskbarItems.querySelector<HTMLButtonElement>(
			`[data-taskbar-window="${windowId}"]`
		);
		if (!btn) {
			btn = document.createElement("button");
			btn.type = "button";
			btn.className = "flex items-center justify-start gap-1 px-2 font-bold";
			btn.style.cssText =
				"min-width: 160px; max-width: 240px; height: 28px; line-height: 1;";
			btn.dataset.taskbarWindow = windowId;
			btn.innerHTML = `
			  <img src="${getIconUrl()}" alt="icon" class="h-4 w-4 shrink-0" />
			  <span style="font-weight: bold;">${title}</span>
			`;
			btn.addEventListener("click", () => {
				if (
					windowEl?.classList.contains("hidden") ||
					frameEl?.classList.contains("hidden")
				) {
					openWindow();
				} else {
					minimizeWindow();
				}
			});
			taskbarItems.appendChild(btn);
		}
		return btn;
	};

	const updateTaskbarState = () => {
		if (!ensureTaskbarButton()) return;
		syncWindowFrameTaskbarState(windowId);
	};

	const openWindow = () => {
		openWindowFrame(windowId);
		updateTaskbarState();
	};

	const minimizeWindow = () => {
		minimizeWindowFrame(windowId);
		updateTaskbarState();
	};

	const closeWindow = () => {
		closeWindowFrame(windowId);
	};

	if (iconEl && windowEl) {
		iconEl.addEventListener("dblclick", () => {
			openWindow();
		});
	}

	if (closeBtn && windowEl) {
		closeBtn.addEventListener("click", () => {
			closeWindow();
		});
	}

	if (windowEl && !windowEl.classList.contains("hidden")) {
		updateTaskbarState();
	}
};

setupDesktopApp("recycle", "Recycle Bin");
setupDesktopApp("portfolio", "Portfolio");

updateDesktopScale();
window.addEventListener("resize", updateDesktopScale);
window.visualViewport?.addEventListener("resize", updateDesktopScale);