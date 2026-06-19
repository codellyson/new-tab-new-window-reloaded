import { getAllOptions, getOption, setOption, type Options } from "./options-store";

const POSITION_CASCADE = 0;
const POSITION_MAXIMIZE = 2;
const SIZE_CUSTOM = 1;

let enabled = true;

void (async () => {
    enabled = await getOption("extensionEnabled");
    applyIcon(enabled);
})();

chrome.tabs.onCreated.addListener((tab) => {
    if (tab.index === 0 || !enabled) {
        return;
    }
    void detachTab(tab);
});

chrome.action.onClicked.addListener(() => {
    enabled = !enabled;
    void setOption("extensionEnabled", enabled);
    applyIcon(enabled);
});

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        chrome.runtime.openOptionsPage();
    }
});

async function detachTab(tab: chrome.tabs.Tab): Promise<void> {
    try {
        const opts = await getAllOptions();
        if (!passesTriggers(tab, opts)) {
            return;
        }
        if (opts.minTabsThreshold > 1) {
            // siblings includes the just-created tab, so compare with <= not <.
            const siblings = await chrome.tabs.query({ windowId: tab.windowId });
            if (siblings.length <= opts.minTabsThreshold) {
                return;
            }
        }
        const parent = await chrome.windows.get(tab.windowId);
        const platform = await chrome.runtime.getPlatformInfo();
        await chrome.windows.create(planWindow(tab, parent, opts, platform));
    } catch (err) {
        console.error("[NTNW] failed to detach tab:", err);
    }
}

function passesTriggers(tab: chrome.tabs.Tab, opts: Options): boolean {
    const url = tab.pendingUrl ?? tab.url ?? "";
    if (isInternalPage(url)) {
        return false;
    }
    if (opts.excludePinned && tab.pinned) {
        return false;
    }
    if (opts.triggerLinkOnly && tab.openerTabId == null) {
        return false;
    }
    if (opts.keepExternalAsTab && isExternalLink(tab)) {
        return false;
    }
    if (isExcludedUrl(url, opts.excludeUrls)) {
        return false;
    }
    return true;
}

function isInternalPage(url: string): boolean {
    if (url.startsWith("chrome://")) {
        // Exclude the new-tab page: detaching it is the extension's whole point.
        return !url.startsWith("chrome://newtab");
    }
    return (
        url.startsWith("chrome-extension://") ||
        url.startsWith("chrome-untrusted://") ||
        url.startsWith("devtools://") ||
        url.startsWith("edge://")
    );
}

function isExternalLink(tab: chrome.tabs.Tab): boolean {
    if (tab.openerTabId != null) {
        return false;
    }
    const url = tab.pendingUrl ?? tab.url ?? "";
    return /^https?:\/\//i.test(url);
}

function planWindow(
    tab: chrome.tabs.Tab,
    parent: chrome.windows.Window,
    opts: Options,
    platform: chrome.runtime.PlatformInfo,
): chrome.windows.CreateData {
    const data: chrome.windows.CreateData = {
        tabId: tab.id,
        incognito: tab.incognito,
        focused: opts.focusNewWindow,
    };

    const customSize =
        opts.windowSizeMode === SIZE_CUSTOM &&
        opts.windowWidth > 0 &&
        opts.windowHeight > 0;
    const applySize = () => {
        data.width = opts.windowWidth;
        data.height = opts.windowHeight;
    };

    if (opts.newWindowsPosition === POSITION_MAXIMIZE) {
        data.state = "maximized";
        return data;
    }

    if (opts.newWindowsPosition === POSITION_CASCADE) {
        if (customSize) {
            applySize();
        } else {
            data.state = parent.state;
        }
        return data;
    }

    if (!canPositionRelativeTo(parent.state, platform)) {
        if (customSize) {
            applySize();
        } else {
            data.state = parent.state;
        }
        return data;
    }

    data.top = parent.top;
    data.left = parent.left;
    if (customSize) {
        applySize();
    }
    return data;
}

function canPositionRelativeTo(
    state: chrome.windows.windowStateEnum | undefined,
    platform: chrome.runtime.PlatformInfo,
): boolean {
    if (state === "minimized" || state === "fullscreen") {
        return false;
    }
    if (state === "maximized") {
        return platform.os === "mac";
    }
    return true;
}

function isExcludedUrl(url: string, patterns: string): boolean {
    if (!url || !patterns) {
        return false;
    }
    const lower = url.toLowerCase();
    for (const raw of patterns.split("\n")) {
        const pattern = raw.trim();
        if (!pattern) {
            continue;
        }
        if (pattern.includes("*")) {
            const expr = pattern.split("*").map(escapeRegExp).join(".*");
            if (new RegExp(expr, "i").test(url)) {
                return true;
            }
        } else if (lower.includes(pattern.toLowerCase())) {
            return true;
        }
    }
    return false;
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function applyIcon(on: boolean): void {
    const suffix = on ? "" : "-disabled";
    chrome.action.setIcon({
        path: {
            24: `img/icon${suffix}24.png`,
            32: `img/icon${suffix}32.png`,
            48: `img/icon${suffix}48.png`,
        },
    });
    chrome.action.setTitle({
        title: chrome.i18n.getMessage(on ? "actionTitle" : "actionTitleDisabled"),
    });
}
