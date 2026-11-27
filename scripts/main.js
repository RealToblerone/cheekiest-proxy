import { AuthManager } from './auth.js';
import { ProxyEngine } from './proxy.js';
import { GamesManager } from './games.js';
import { SettingsManager } from './settings.js';
import { UIManager } from './ui.js';
import { ToastManager } from './toast.js';

class StudentHub {
    constructor() {
        this.auth = new AuthManager();
        this.proxy = new ProxyEngine();
        this.games = new GamesManager();
        this.settings = new SettingsManager();
        this.ui = new UIManager();
        this.toast = new ToastManager();

        this.init();
    }

    async init() {
        await this.settings.load();

        this.ui.init(this.settings, this.auth);
        this.proxy.init(this.settings);
        this.games.init(this.settings);
        this.auth.init(this.settings);

        this.bindGlobalEvents();

        if (this.auth.isAuthenticated()) {
            this.showApp();
        } else {
            this.showAuth();
        }
    }

    bindGlobalEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F11') {
                e.preventDefault();
                this.ui.toggleFullscreen();
            }
            if (e.key === 'Escape') {
                this.ui.closeModals();
                this.ui.closeDropdowns();
            }
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.settings.get('customTitle')) {
                document.title = this.settings.get('customTitle');
                const favicon = document.getElementById('favicon');
                if (this.settings.get('customFavicon')) {
                    favicon.href = this.settings.get('customFavicon');
                }
            } else {
                document.title = 'Student Hub';
                document.getElementById('favicon').href = 'assets/favicon.ico';
            }
        });

        window.addEventListener('message', (e) => {
            if (e.data.type === 'proxy-load') {
                this.proxy.handleIframeMessage(e.data);
            }
        });
    }

    showAuth() {
        document.getElementById('auth-overlay').classList.remove('hidden');
        document.getElementById('app').classList.add('hidden');
        document.getElementById('access-key').focus();
    }

    showApp() {
        document.getElementById('auth-overlay').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        this.ui.applySettings();
    }

    async handleAuth(key) {
        const valid = await this.auth.verify(key);
        if (valid) {
            this.auth.setAuthenticated(true);
            this.showApp();
            this.toast.success('Welcome!', 'Access granted. Enjoy your hub.');
        } else {
            this.showAuthError();
        }
    }

    showAuthError() {
        const errorEl = document.getElementById('auth-error');
        errorEl.classList.remove('hidden');
        document.getElementById('access-key').value = '';
        document.getElementById('access-key').focus();
        setTimeout(() => errorEl.classList.add('hidden'), 3000);
    }

    logout() {
        this.auth.setAuthenticated(false);
        this.proxy.reset();
        this.showAuth();
        this.toast.info('Logged out', 'You have been signed out.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.hub = new StudentHub();
});

export { StudentHub };