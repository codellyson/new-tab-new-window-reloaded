export interface Options {
    extensionEnabled: boolean;
    newWindowsPosition: number;
    windowSizeMode: number;
    windowWidth: number;
    windowHeight: number;
    focusNewWindow: boolean;
    triggerLinkOnly: boolean;
    keepExternalAsTab: boolean;
    excludePinned: boolean;
    minTabsThreshold: number;
    excludeUrls: string;
}

export type OptionName = keyof Options;

export const OPTION_DEFAULTS: Options = {
    extensionEnabled: true,
    newWindowsPosition: 0,
    windowSizeMode: 0,
    windowWidth: 1024,
    windowHeight: 768,
    focusNewWindow: true,
    triggerLinkOnly: false,
    keepExternalAsTab: true,
    excludePinned: true,
    minTabsThreshold: 5,
    excludeUrls: "",
};

const COERCE: { [K in OptionName]: (value: unknown) => Options[K] } = {
    extensionEnabled: Boolean,
    newWindowsPosition: Number,
    windowSizeMode: Number,
    windowWidth: Number,
    windowHeight: Number,
    focusNewWindow: Boolean,
    triggerLinkOnly: Boolean,
    keepExternalAsTab: Boolean,
    excludePinned: Boolean,
    minTabsThreshold: Number,
    excludeUrls: String,
};

export async function getAllOptions(): Promise<Options> {
    return (await chrome.storage.sync.get(OPTION_DEFAULTS)) as Options;
}

export async function getOption<K extends OptionName>(name: K): Promise<Options[K]> {
    const stored = await chrome.storage.sync.get({ [name]: OPTION_DEFAULTS[name] });
    return stored[name] as Options[K];
}

export async function setOption<K extends OptionName>(name: K, value: unknown): Promise<void> {
    await chrome.storage.sync.set({ [name]: COERCE[name](value) });
}
