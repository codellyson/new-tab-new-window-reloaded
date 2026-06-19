import { getAllOptions, setOption, type OptionName } from "./options-store";
import { byId, localizeDocument } from "./i18n";

const SAVED_VISIBLE_MS = 1200;
let savedTimer: number | undefined;

function flashSaved(): void {
    const indicator = byId("savedIndicator");
    if (!indicator) {
        return;
    }
    indicator.classList.add("show");
    window.clearTimeout(savedTimer);
    savedTimer = window.setTimeout(() => indicator.classList.remove("show"), SAVED_VISIBLE_MS);
}

function bindRadioGroup(name: OptionName, current: number): void {
    const inputs = document.querySelectorAll<HTMLInputElement>(`input[name="${name}"]`);
    inputs.forEach((input) => {
        input.checked = Number(input.value) === current;
        input.addEventListener("change", () => {
            void setOption(name, input.value);
            flashSaved();
        });
    });
}

function bindCheckbox(name: OptionName, current: boolean): void {
    const input = byId<HTMLInputElement>(name);
    if (!input) {
        return;
    }
    input.checked = current;
    input.addEventListener("change", () => {
        void setOption(name, input.checked);
        flashSaved();
    });
}

function bindNumber(name: OptionName, current: number): void {
    const input = byId<HTMLInputElement>(name);
    if (!input) {
        return;
    }
    input.value = String(current);
    input.addEventListener("change", () => {
        void setOption(name, input.value);
        flashSaved();
    });
}

function bindTextarea(name: OptionName, current: string): void {
    const input = byId<HTMLTextAreaElement>(name);
    if (!input) {
        return;
    }
    input.value = current;
    input.addEventListener("input", () => {
        void setOption(name, input.value);
        flashSaved();
    });
}

async function init(): Promise<void> {
    localizeDocument();
    const opts = await getAllOptions();

    bindRadioGroup("newWindowsPosition", opts.newWindowsPosition);
    bindRadioGroup("windowSizeMode", opts.windowSizeMode);
    bindCheckbox("focusNewWindow", opts.focusNewWindow);
    bindCheckbox("triggerLinkOnly", opts.triggerLinkOnly);
    bindCheckbox("keepExternalAsTab", opts.keepExternalAsTab);
    bindCheckbox("excludePinned", opts.excludePinned);
    bindNumber("windowWidth", opts.windowWidth);
    bindNumber("windowHeight", opts.windowHeight);
    bindNumber("minTabsThreshold", opts.minTabsThreshold);
    bindTextarea("excludeUrls", opts.excludeUrls);

    byId("testBtn")?.addEventListener("click", (event) => {
        event.preventDefault();
        window.open("options_test.html", "_blank");
    });
}

void init();
