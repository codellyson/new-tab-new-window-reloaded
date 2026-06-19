// Lightweight DOM helpers for the options pages.

export function byId<T extends HTMLElement = HTMLElement>(id: string): T | null {
    return document.getElementById(id) as T | null;
}

/**
 * Replaces the text of every element carrying a `data-i18n` attribute with the
 * corresponding localized message. Uses textContent (not innerHTML) so message
 * values are never interpreted as markup.
 */
export function localizeDocument(): void {
    const nodes = document.querySelectorAll<HTMLElement>("[data-i18n]");
    nodes.forEach((node) => {
        const key = node.dataset.i18n;
        if (key) {
            node.textContent = chrome.i18n.getMessage(key);
        }
    });
}
