type WindowFrameSnapshot = {
	windowClassName: string;
	windowStyle: string;
	wrapperClassName: string;
	wrapperStyle: string;
};

type WindowFrameController = {
	open: () => void;
	close: () => void;
	minimize: () => void;
	toggleMaximize: () => void;
	syncTaskbar: () => void;
};

const controllers = new Map<string, WindowFrameController>();
const initializedWindows = new WeakSet<HTMLElement>();

const ACTIVE_TASKBAR_SHADOW =
	"inset -1px -1px #ffffff, inset 1px 1px #0a0a0a, inset -2px -2px #dfdfdf, inset 2px 2px #808080";

const getTaskbarButton = (windowId: string) =>
	document.querySelector<HTMLButtonElement>(
		`[data-taskbar-window="${windowId}"]`
	);

const syncTaskbarButtonState = (windowId: string, isActive: boolean) => {
	const button = getTaskbarButton(windowId);
	if (!button) return;

	if (!isActive) {
		button.classList.remove("active");
		button.style.boxShadow = "";
		button.style.paddingTop = "";
		button.style.paddingLeft = "";
		return;
	}

	button.classList.add("active");
	button.style.boxShadow = ACTIVE_TASKBAR_SHADOW;
	button.style.paddingTop = "2px";
	button.style.paddingLeft = "10px";
};

const removeTaskbarButton = (windowId: string) => {
	getTaskbarButton(windowId)?.remove();
};

const getViewportScale = (desktopCanvas: HTMLElement | null) => {
	const canvasRect = desktopCanvas?.getBoundingClientRect();
	const baseWidth = desktopCanvas?.offsetWidth ?? 1920;

	return canvasRect && baseWidth ? canvasRect.width / baseWidth : 1;
};

const getViewportBounds = (scale: number) => {
	const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
	const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
	const taskbarHeight =
		document.querySelector("footer")?.getBoundingClientRect().height ?? 40;

	return {
		width: viewportWidth / scale,
		height: (viewportHeight - taskbarHeight) / scale,
	};
};

const createSnapshot = (
	windowRoot: HTMLElement,
	windowWrapper: HTMLElement
): WindowFrameSnapshot => ({
	windowClassName: windowRoot.className,
	windowStyle: windowRoot.getAttribute("style") ?? "",
	wrapperClassName: windowWrapper.className,
	wrapperStyle: windowWrapper.getAttribute("style") ?? "",
});

const restoreSnapshot = (
	windowRoot: HTMLElement,
	windowWrapper: HTMLElement,
	snapshot: WindowFrameSnapshot
) => {
	windowRoot.className = snapshot.windowClassName;
	windowRoot.setAttribute("style", snapshot.windowStyle);
	windowWrapper.className = snapshot.wrapperClassName;
	windowWrapper.setAttribute("style", snapshot.wrapperStyle);
};

const setMaximizeButtonState = (
	maximizeButton: HTMLButtonElement | null,
	isMaximized: boolean
) => {
	if (!maximizeButton) return;

	maximizeButton.setAttribute("aria-label", isMaximized ? "Restore" : "Maximize");
	maximizeButton.setAttribute("title", isMaximized ? "Restore" : "Maximize");
};

const isWindowVisible = (
	windowRoot: HTMLElement,
	windowWrapper: HTMLElement
) =>
	!windowRoot.classList.contains("hidden") &&
	!windowWrapper.classList.contains("hidden") &&
	windowRoot.dataset.minimized !== "true";

const registerWindowFrame = (windowRoot: HTMLElement) => {
	if (initializedWindows.has(windowRoot)) return;

	const windowId = windowRoot.dataset.windowId;
	const windowWrapper = windowRoot.parentElement as HTMLElement | null;
	if (!windowId || !windowWrapper) return;

	initializedWindows.add(windowRoot);

	const desktopCanvas = document.getElementById("desktop-canvas") as HTMLElement | null;
	const titleBar = windowRoot.querySelector<HTMLElement>(".title-bar");
	const minimizeButton = windowRoot.querySelector<HTMLButtonElement>(
		`[data-window-minimize="${windowId}"]`
	);
	const maximizeButton = windowRoot.querySelector<HTMLButtonElement>(
		`[data-window-maximize="${windowId}"]`
	);

	let windowSnapshot = createSnapshot(windowRoot, windowWrapper);
	let lastClientX = 0;
	let lastClientY = 0;
	let dragPointerId = -1;
	let isDragging = false;

	const syncTaskbar = () => {
		syncTaskbarButtonState(windowId, isWindowVisible(windowRoot, windowWrapper));
	};

	const saveNormalState = () => {
		windowSnapshot = createSnapshot(windowRoot, windowWrapper);
	};

	const stopDrag = () => {
		if (!isDragging) return;

		isDragging = false;
		dragPointerId = -1;
		document.body.style.userSelect = "";
		saveNormalState();
		window.removeEventListener("pointermove", onDragMove);
		window.removeEventListener("pointerup", stopDrag);
		window.removeEventListener("pointercancel", stopDrag);
	};

	const onDragMove = (event: PointerEvent) => {
		if (!isDragging || event.pointerId !== dragPointerId) return;

		const scale = getViewportScale(desktopCanvas);
		const deltaX = (event.clientX - lastClientX) / scale;
		const deltaY = (event.clientY - lastClientY) / scale;

		lastClientX = event.clientX;
		lastClientY = event.clientY;

		const currentLeft = parseFloat(windowWrapper.style.left || "0");
		const currentTop = parseFloat(windowWrapper.style.top || "0");
		const width = parseFloat(windowWrapper.style.width) || windowRoot.offsetWidth;
		const height = parseFloat(windowWrapper.style.height) || windowRoot.offsetHeight;
		const viewportBounds = getViewportBounds(scale);

		windowWrapper.style.left = `${Math.min(
			Math.max(currentLeft + deltaX, 0),
			Math.max(0, viewportBounds.width - width)
		)}px`;
		windowWrapper.style.top = `${Math.min(
			Math.max(currentTop + deltaY, 0),
			Math.max(0, viewportBounds.height - height)
		)}px`;
	};

	const enterNormalState = () => {
		restoreSnapshot(windowRoot, windowWrapper, windowSnapshot);
		windowRoot.dataset.windowState = "normal";
		setMaximizeButtonState(maximizeButton, false);
		syncTaskbar();
	};

	const maximizeWindow = () => {
		saveNormalState();

		const scale = getViewportScale(desktopCanvas);
		const viewportBounds = getViewportBounds(scale);

		windowWrapper.className = "absolute left-0 top-0 z-20";
		windowWrapper.style.transform = "none";
		windowWrapper.style.maxWidth = "none";
		windowWrapper.style.left = "0px";
		windowWrapper.style.top = "0px";
		windowWrapper.style.width = `${viewportBounds.width}px`;
		windowWrapper.style.height = `${viewportBounds.height}px`;
		windowWrapper.classList.remove("hidden");

		windowRoot.className = "window flex flex-col bg-[#c0c0c0]";
		windowRoot.style.width = "100%";
		windowRoot.style.height = "100%";
		windowRoot.style.maxWidth = "none";
		windowRoot.style.left = "";
		windowRoot.style.top = "";
		windowRoot.dataset.windowState = "maximized";

		setMaximizeButtonState(maximizeButton, true);
		syncTaskbar();
	};

	const closeWindow = () => {
		stopDrag();

		if (windowRoot.dataset.windowState === "maximized") {
			enterNormalState();
		}

		windowRoot.classList.add("hidden");
		windowWrapper.classList.add("hidden");
		windowRoot.dataset.minimized = "false";
		removeTaskbarButton(windowId);
	};

	const openWindow = () => {
		windowRoot.classList.remove("hidden");
		windowWrapper.classList.remove("hidden");
		windowRoot.dataset.minimized = "false";
		syncTaskbar();
	};

	const minimizeWindow = () => {
		if (!isWindowVisible(windowRoot, windowWrapper)) return;

		windowRoot.classList.add("hidden");
		windowWrapper.classList.add("hidden");
		windowRoot.dataset.minimized = "true";
		syncTaskbar();
	};

	const toggleMaximizeWindow = () => {
		if (windowRoot.dataset.windowState === "maximized") {
			enterNormalState();
			return;
		}

		maximizeWindow();
	};

	const startDrag = (event: PointerEvent) => {
		if (windowRoot.dataset.windowState === "maximized") return;
		if (event.target instanceof Element && event.target.closest("button")) return;

		saveNormalState();

		const scale = getViewportScale(desktopCanvas);
		const currentWidth = windowRoot.offsetWidth;
		const currentHeight = windowRoot.offsetHeight;
		const viewportBounds = getViewportBounds(scale);

		if (
			!windowWrapper.style.left ||
			!windowWrapper.style.left.endsWith("px") ||
			windowWrapper.style.transform !== "none"
		) {
			windowWrapper.style.left = `${(viewportBounds.width - currentWidth) / 2}px`;
			windowWrapper.style.top = `${(viewportBounds.height - currentHeight) / 2}px`;
			windowWrapper.style.width = `${currentWidth}px`;
			windowWrapper.style.height = `${currentHeight}px`;
			windowWrapper.style.transform = "none";

			windowWrapper.classList.remove(
				"left-1/2",
				"top-1/2",
				"-translate-x-1/2",
				"-translate-y-1/2",
				"w-full",
				"max-w-content"
			);
		}

		lastClientX = event.clientX;
		lastClientY = event.clientY;
		dragPointerId = event.pointerId;
		isDragging = true;
		document.body.style.userSelect = "none";
		window.addEventListener("pointermove", onDragMove);
		window.addEventListener("pointerup", stopDrag);
		window.addEventListener("pointercancel", stopDrag);
	};

	minimizeButton?.addEventListener("click", minimizeWindow);
	maximizeButton?.addEventListener("click", toggleMaximizeWindow);
	titleBar?.addEventListener("pointerdown", startDrag);

	document.addEventListener("pointerdown", (event) => {
		if (!isWindowVisible(windowRoot, windowWrapper)) return;
		if (windowWrapper.contains(event.target as Node) || windowRoot.contains(event.target as Node)) return;

		const taskbarButton = getTaskbarButton(windowId);
		if (taskbarButton?.contains(event.target as Node)) return;

		minimizeWindow();
	});

	controllers.set(windowId, {
		open: openWindow,
		close: closeWindow,
		minimize: minimizeWindow,
		toggleMaximize: toggleMaximizeWindow,
		syncTaskbar,
	});

	if (windowRoot.dataset.windowState === "maximized") {
		setMaximizeButtonState(maximizeButton, true);
	}

	if (isWindowVisible(windowRoot, windowWrapper)) {
		syncTaskbar();
	}
};

export const initializeWindowFrames = () => {
	const registerAllWindowFrames = () => {
		document.querySelectorAll<HTMLElement>("[data-window-id]").forEach(registerWindowFrame);
	};

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", registerAllWindowFrames, { once: true });
		return;
	}

	registerAllWindowFrames();
};

export const openWindowFrame = (windowId: string) => {
	controllers.get(windowId)?.open();
};

export const closeWindowFrame = (windowId: string) => {
	controllers.get(windowId)?.close();
};

export const minimizeWindowFrame = (windowId: string) => {
	controllers.get(windowId)?.minimize();
};

export const toggleWindowFrameMaximize = (windowId: string) => {
	controllers.get(windowId)?.toggleMaximize();
};

export const syncWindowFrameTaskbarState = (windowId: string) => {
	controllers.get(windowId)?.syncTaskbar();
};

initializeWindowFrames();