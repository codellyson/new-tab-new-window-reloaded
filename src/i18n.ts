export function byId<T extends HTMLElement = HTMLElement>(id: string): T | null {
    return document.getElementById(id) as T | null;
}

export function localizeDocument(): void {
    const nodes = document.querySelectorAll<HTMLElement>("[data-i18n]");
    nodes.forEach((node) => {
        const key = node.dataset.i18n;
        if (key) {
            node.textContent = chrome.i18n.getMessage(key);
        }
    });
}
