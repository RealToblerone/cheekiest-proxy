const DEFAULT_SETTINGS = {
    theme: 'default',
    background: 'none',
    cursor: 'default',
    customTitle: 'Student Hub',
    customFavicon: '',
    autoBackendSwitch: true,
    proxySSL: true,
    proxyTimeout: 30000
};

const STORAGE_KEY = 'student-hub-settings';

export class SettingsManager {
    constructor() {
        this.settings = { ...DEFAULT_SETTINGS };
    }

    async load() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
            }
        } catch (e) {
            console.warn('Failed to load settings:', e);
        }
        return this.settings;
    }

    save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
        } catch (e) {
            console.warn('Failed to save settings:', e);
        }
    }

    get(key) {
        return this.settings[key];
    }

    set(key, value) {
        this.settings[key] = value;
        this.save();
    }

    getAll() {
        return { ...this.settings };
    }

    reset() {
        this.settings = { ...DEFAULT_SETTINGS };
        this.save();
        return this.settings;
    }

    export() {
        return JSON.stringify(this.settings, null, 2);
    }

    import(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            this.settings = { ...DEFAULT_SETTINGS, ...imported };
            this.save();
            return true;
        } catch (e) {
            console.error('Failed to import settings:', e);
            return false;
        }
    }
}