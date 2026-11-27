export class UIManager {
    constructor() {
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.tabPanels = document.querySelectorAll('.tab-panel');
        this.themeToggle = document.getElementById('theme-toggle');
        this.fullscreenToggle = document.getElementById('fullscreen-toggle');
        this.userMenuBtn = document.getElementById('user-menu-btn');
        this.userDropdown = document.getElementById('user-dropdown');
        this.logoutBtn = document.querySelector('[data-action="logout"]');
        this.exportBtn = document.getElementById('export-settings');
        this.importBtn = document.getElementById('import-settings');
        this.importFile = document.getElementById('import-file');
        this.resetBtn = document.getElementById('reset-settings');
        this.customTitleInput = document.getElementById('custom-title');
        this.customFaviconInput = document.getElementById('custom-favicon');
        this.customBgUpload = document.getElementById('custom-bg-upload');
        this.themeOptions = document.getElementById('theme-options');
        this.backgroundOptions = document.getElementById('background-options');
        this.cursorOptions = document.getElementById('cursor-options');
        this.autoBackendSwitch = document.getElementById('auto-backend-switch');
        this.proxySSL = document.getElementById('proxy-ssl');
        this.proxyTimeout = document.getElementById('proxy-timeout');

        this.settings = null;
        this.auth = null;
    }

    init(settings, auth) {
        this.settings = settings;
        this.auth = auth;
        this.bindEvents();
        this.renderThemeOptions();
        this.renderBackgroundOptions();
        this.renderCursorOptions();
        this.applySettings();
    }

    bindEvents() {
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        this.fullscreenToggle.addEventListener('click', () => this.toggleFullscreen());

        this.userMenuBtn.addEventListener('click', () => this.toggleUserMenu());

        this.logoutBtn.addEventListener('click', () => {
            this.closeDropdowns();
            if (window.hub) window.hub.logout();
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-menu')) {
                this.closeDropdowns();
            }
        });

        this.exportBtn.addEventListener('click', () => this.exportSettings());
        this.importBtn.addEventListener('click', () => this.importFile.click());
        this.importFile.addEventListener('change', (e) => this.importSettings(e));
        this.resetBtn.addEventListener('click', () => this.resetSettings());

        this.customTitleInput.addEventListener('change', () => this.updateCustomTitle());
        this.customFaviconInput.addEventListener('change', () => this.updateCustomFavicon());
        this.customBgUpload.addEventListener('change', (e) => this.uploadBackground(e));

        this.autoBackendSwitch.addEventListener('change', () => this.settings.set('autoBackendSwitch', this.autoBackendSwitch.checked));
        this.proxySSL.addEventListener('change', () => this.settings.set('proxySSL', this.proxySSL.checked));
        this.proxyTimeout.addEventListener('change', () => this.settings.set('proxyTimeout', parseInt(this.proxyTimeout.value) || 30000));
    }

    switchTab(tabName) {
        this.tabBtns.forEach(btn => {
            const isActive = btn.dataset.tab === tabName;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive);
        });

        this.tabPanels.forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabName}-panel`);
        });
    }

    toggleTheme() {
        const currentTheme = this.settings.get('theme');
        const themes = ['default', 'ocean', 'forest', 'sunset', 'violet', 'rose', 'midnight', 'amber', 'cyber', 'light'];
        const currentIndex = themes.indexOf(currentTheme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];
        this.applyTheme(nextTheme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.settings.set('theme', theme);
        this.updateThemeSelection(theme);
    }

    updateThemeSelection(theme) {
        document.querySelectorAll('.theme-option').forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.theme === theme);
        });
    }

    renderThemeOptions() {
        const themes = [
            { id: 'default', name: 'Default' },
            { id: 'ocean', name: 'Ocean' },
            { id: 'forest', name: 'Forest' },
            { id: 'sunset', name: 'Sunset' },
            { id: 'violet', name: 'Violet' },
            { id: 'rose', name: 'Rose' },
            { id: 'midnight', name: 'Midnight' },
            { id: 'amber', name: 'Amber' },
            { id: 'cyber', name: 'Cyber' },
            { id: 'light', name: 'Light' }
        ];

        this.themeOptions.innerHTML = themes.map(t => `
            <button class="theme-option" data-theme="${t.id}" aria-label="${t.name} theme" aria-pressed="${this.settings.get('theme') === t.id}">
                <div class="theme-preview">
                    <div class="theme-color-bar"></div>
                    <div class="theme-color-bar"></div>
                    <div class="theme-color-bar"></div>
                </div>
                <span class="theme-name">${t.name}</span>
            </button>
        `).join('');

        this.themeOptions.querySelectorAll('.theme-option').forEach(btn => {
            btn.addEventListener('click', () => this.applyTheme(btn.dataset.theme));
        });

        this.updateThemeSelection(this.settings.get('theme'));
    }

    applyBackground(bg) {
        this.settings.set('background', bg);
        this.updateBackgroundSelection(bg);
        this.applyCustomBackground(bg);
    }

    applyCustomBackground(bg) {
        const root = document.documentElement;
        root.style.removeProperty('--custom-bg');

        if (bg === 'custom' && this.settings.get('customBgData')) {
            root.style.setProperty('--custom-bg', `url(${this.settings.get('customBgData')})`);
            root.style.setProperty('--bg-primary', 'transparent');
        } else if (bg !== 'none') {
            root.style.setProperty('--bg-primary', 'var(--bg-primary)');
        }
    }

    updateBackgroundSelection(bg) {
        document.querySelectorAll('.background-option').forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.bg === bg);
        });
    }

    renderBackgroundOptions() {
        const backgrounds = [
            { id: 'none', name: 'None' },
            { id: 'grid', name: 'Grid' },
            { id: 'dots', name: 'Dots' },
            { id: 'mesh', name: 'Mesh' },
            { id: 'noise', name: 'Noise' },
            { id: 'waves', name: 'Waves' }
        ];

        this.backgroundOptions.innerHTML = backgrounds.map(b => `
            <button class="background-option" data-bg="${b.id}" aria-label="${b.name} background" aria-pressed="${this.settings.get('background') === b.id}">
                <div class="background-preview"></div>
                <span class="bg-name">${b.name}</span>
            </button>
        `).join('');

        this.backgroundOptions.querySelectorAll('.background-option').forEach(btn => {
            btn.addEventListener('click', () => this.applyBackground(btn.dataset.bg));
        });

        this.updateBackgroundSelection(this.settings.get('background'));
        this.applyCustomBackground(this.settings.get('background'));
    }

    applyCursor(cursor) {
        this.settings.set('cursor', cursor);
        this.updateCursorSelection(cursor);
        document.body.style.cursor = cursor === 'default' ? '' : `url("assets/cursors/${cursor}.cur"), auto`;
    }

    updateCursorSelection(cursor) {
        document.querySelectorAll('.cursor-option').forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.cursor === cursor);
        });
    }

    renderCursorOptions() {
        const cursors = [
            { id: 'default', name: 'Default' },
            { id: 'crosshair', name: 'Crosshair' },
            { id: 'pointer', name: 'Pointer' },
            { id: 'text', name: 'Text' },
            { id: 'grab', name: 'Grab' },
            { id: 'dot', name: 'Dot' },
            { id: 'star', name: 'Star' },
            { id: 'heart', name: 'Heart' }
        ];

        this.cursorOptions.innerHTML = cursors.map(c => `
            <button class="cursor-option" data-cursor="${c.id}" aria-label="${c.name} cursor" aria-pressed="${this.settings.get('cursor') === c.id}">
                <div class="cursor-preview"></div>
                <span class="cursor-name">${c.name}</span>
            </button>
        `).join('');

        this.cursorOptions.querySelectorAll('.cursor-option').forEach(btn => {
            btn.addEventListener('click', () => this.applyCursor(btn.dataset.cursor));
        });

        this.updateCursorSelection(this.settings.get('cursor'));
        this.applyCursor(this.settings.get('cursor'));
    }

    updateCustomTitle() {
        const title = this.customTitleInput.value.trim() || 'Student Hub';
        this.settings.set('customTitle', title);
        if (document.hidden) {
            document.title = title;
        }
    }

    updateCustomFavicon() {
        const favicon = this.customFaviconInput.value.trim();
        this.settings.set('customFavicon', favicon);
        if (document.hidden && favicon) {
            document.getElementById('favicon').href = favicon;
        }
    }

    uploadBackground(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            window.hub.toast.error('File too large', 'Maximum size is 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.settings.set('customBgData', e.target.result);
            this.applyBackground('custom');
            window.hub.toast.success('Background uploaded', 'Custom background applied');
        };
        reader.readAsDataURL(file);
    }

    exportSettings() {
        const data = this.settings.export();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'student-hub-settings.json';
        a.click();
        URL.revokeObjectURL(url);
        window.hub.toast.success('Settings exported', 'Settings saved to file');
    }

    importSettings(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const success = this.settings.import(e.target.result);
            if (success) {
                this.applySettings();
                window.hub.toast.success('Settings imported', 'Settings have been restored');
            } else {
                window.hub.toast.error('Import failed', 'Invalid settings file');
            }
            event.target.value = '';
        };
        reader.readAsText(file);
    }

    resetSettings() {
        if (confirm('Reset all settings to defaults? This cannot be undone.')) {
            this.settings.reset();
            this.applySettings();
            window.hub.toast.success('Settings reset', 'All settings restored to defaults');
        }
    }

    applySettings() {
        this.applyTheme(this.settings.get('theme'));
        this.applyBackground(this.settings.get('background'));
        this.applyCursor(this.settings.get('cursor'));

        this.customTitleInput.value = this.settings.get('customTitle');
        this.customFaviconInput.value = this.settings.get('customFavicon') || '';

        this.autoBackendSwitch.checked = this.settings.get('autoBackendSwitch');
        this.proxySSL.checked = this.settings.get('proxySSL');
        this.proxyTimeout.value = this.settings.get('proxyTimeout');
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
            this.fullscreenToggle.setAttribute('aria-label', 'Exit fullscreen');
            this.fullscreenToggle.title = 'Exit fullscreen';
        } else {
            document.exitFullscreen();
            this.fullscreenToggle.setAttribute('aria-label', 'Enter fullscreen');
            this.fullscreenToggle.title = 'Fullscreen';
        }
    }

    toggleUserMenu() {
        const isOpen = !this.userDropdown.classList.contains('hidden');
        this.userDropdown.classList.toggle('hidden', isOpen);
        this.userMenuBtn.setAttribute('aria-expanded', !isOpen);
    }

    closeDropdowns() {
        this.userDropdown.classList.add('hidden');
        this.userMenuBtn.setAttribute('aria-expanded', 'false');
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
        document.body.style.overflow = '';
    }
}