const ACCESS_KEYS = [
    'student-hub-2024',
    'cheekiest-proxy',
    'interstellar-access',
    'gaming-hub-key',
    'private-student-2024'
];

const STORAGE_KEY = 'student-hub-auth';

export class AuthManager {
    constructor() {
        this.authenticated = false;
    }

    init(settings) {
        this.settings = settings;
        this.bindEvents();
        this.checkStoredAuth();
    }

    bindEvents() {
        const form = document.getElementById('auth-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const key = document.getElementById('access-key').value.trim();
            if (key) {
                window.hub.handleAuth(key);
            }
        });
    }

    checkStoredAuth() {
        try {
            const stored = sessionStorage.getItem(STORAGE_KEY);
            if (stored === 'true') {
                this.authenticated = true;
            }
        } catch (e) {
            console.warn('Auth storage check failed:', e);
        }
    }

    async verify(key) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return ACCESS_KEYS.includes(key);
    }

    setAuthenticated(value) {
        this.authenticated = value;
        try {
            sessionStorage.setItem(STORAGE_KEY, value.toString());
        } catch (e) {
            console.warn('Auth storage write failed:', e);
        }
        this.updateUserMenu();
    }

    isAuthenticated() {
        return this.authenticated;
    }

    updateUserMenu() {
        const userEl = document.getElementById('dropdown-user');
        const statusEl = document.getElementById('dropdown-status');
        if (this.authenticated) {
            userEl.textContent = 'Student';
            statusEl.textContent = 'Authenticated';
            statusEl.style.color = 'var(--accent-success)';
        } else {
            userEl.textContent = 'Guest';
            statusEl.textContent = 'Not authenticated';
            statusEl.style.color = 'var(--fg-tertiary)';
        }
    }
}