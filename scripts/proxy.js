const PROXY_BACKENDS = {
    interstellar: {
        name: 'Interstellar',
        url: 'https://interstellar.b-cdn.net/service/',
        rewrite: (target) => `https://interstellar.b-cdn.net/service/${encodeURIComponent(target)}`,
        supportsStreaming: true
    },
    ultraviolet: {
        name: 'Ultraviolet',
        url: 'https://uv.b-cdn.net/service/',
        rewrite: (target) => `https://uv.b-cdn.net/service/${encodeURIComponent(target)}`,
        supportsStreaming: true
    },
    rammerhead: {
        name: 'Rammerhead',
        url: 'https://rammerhead.b-cdn.net/service/',
        rewrite: (target) => `https://rammerhead.b-cdn.net/service/${encodeURIComponent(target)}`,
        supportsStreaming: true
    },
    'holy-unblocker': {
        name: 'Holy Unblocker',
        url: 'https://holy-unblocker.b-cdn.net/service/',
        rewrite: (target) => `https://holy-unblocker.b-cdn.net/service/${encodeURIComponent(target)}`,
        supportsStreaming: true
    },
    bare: {
        name: 'Bare Server',
        url: 'https://bare.b-cdn.net/service/',
        rewrite: (target) => `https://bare.b-cdn.net/service/${encodeURIComponent(target)}`,
        supportsStreaming: true
    }
};

const QUICK_LINKS = [
    { name: 'Xbox Cloud Gaming', url: 'https://xbox.com/play' },
    { name: 'GeForce Now', url: 'https://play.geforcenow.com' },
    { name: 'YouTube', url: 'https://youtube.com' },
    { name: 'Discord', url: 'https://discord.com/app' },
    { name: 'GitHub', url: 'https://github.com' },
    { name: 'Reddit', url: 'https://reddit.com' }
];

export class ProxyEngine {
    constructor() {
        this.currentBackend = 'interstellar';
        this.iframe = document.getElementById('proxy-frame');
        this.urlInput = document.getElementById('proxy-url');
        this.goBtn = document.getElementById('proxy-go');
        this.backendSelect = document.getElementById('proxy-backend');
        this.newTabBtn = document.getElementById('proxy-new-tab');
        this.placeholder = document.getElementById('proxy-placeholder');
        this.statusText = document.querySelector('.status-text');
        this.statusDot = document.querySelector('.status-dot');
        this.backendInfo = document.getElementById('backend-info');
        this.latencyInfo = document.getElementById('latency-info');
        this.quickLinks = document.querySelectorAll('.quick-link');
        this.settings = null;
        this.latencyCheckInterval = null;
        this.requestStartTime = 0;
    }

    init(settings) {
        this.settings = settings;
        this.bindEvents();
        this.applyBackend(this.currentBackend);
    }

    bindEvents() {
        this.goBtn.addEventListener('click', () => this.navigate());
        this.urlInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.navigate();
        });

        this.backendSelect.addEventListener('change', (e) => {
            this.switchBackend(e.target.value);
        });

        this.newTabBtn.addEventListener('click', () => this.reset());

        this.iframe.addEventListener('load', () => this.onIframeLoad());
        this.iframe.addEventListener('error', () => this.onIframeError());

        this.quickLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.urlInput.value = link.dataset.url;
                this.navigate();
            });
        });

        document.getElementById('fullscreen-toggle').addEventListener('click', () => {
            this.toggleIframeFullscreen();
        });
    }

    navigate() {
        let url = this.urlInput.value.trim();
        if (!url) return;

        if (!url.match(/^https?:\/\//i)) {
            url = 'https://' + url;
        }

        try {
            new URL(url);
        } catch {
            window.hub.toast.error('Invalid URL', 'Please enter a valid URL');
            return;
        }

        this.requestStartTime = performance.now();
        this.updateStatus('Connecting...', 'connecting');
        this.placeholder.classList.add('hidden');
        this.iframe.classList.remove('loaded');

        const backend = PROXY_BACKENDS[this.currentBackend];
        const proxyUrl = backend.rewrite(url);

        this.iframe.src = proxyUrl;
        this.urlInput.value = url;
    }

    onIframeLoad() {
        const latency = Math.round(performance.now() - this.requestStartTime);
        this.updateStatus('Connected', 'connected');
        this.latencyInfo.textContent = `Latency: ${latency}ms`;
        this.iframe.classList.add('loaded');
        this.startLatencyMonitoring();
    }

    onIframeError() {
        this.updateStatus('Connection failed', 'error');
        this.latencyInfo.textContent = 'Latency: --ms';
        this.iframe.classList.remove('loaded');
        this.placeholder.classList.remove('hidden');

        if (this.settings.get('autoBackendSwitch') && this.currentBackend !== 'interstellar') {
            this.tryNextBackend();
        }
    }

    tryNextBackend() {
        const backends = Object.keys(PROXY_BACKENDS);
        const currentIndex = backends.indexOf(this.currentBackend);
        const nextIndex = (currentIndex + 1) % backends.length;
        const nextBackend = backends[nextIndex];

        window.hub.toast.warning('Switching backend', `Trying ${PROXY_BACKENDS[nextBackend].name}...`);
        this.switchBackend(nextBackend);

        setTimeout(() => {
            this.navigate();
        }, 500);
    }

    switchBackend(backendKey) {
        if (!PROXY_BACKENDS[backendKey]) return;

        this.currentBackend = backendKey;
        this.applyBackend(backendKey);
        this.backendSelect.value = backendKey;
        this.backendInfo.textContent = `Backend: ${PROXY_BACKENDS[backendKey].name}`;
        this.stopLatencyMonitoring();
    }

    applyBackend(backendKey) {
        const backend = PROXY_BACKENDS[backendKey];
        this.backendInfo.textContent = `Backend: ${backend.name}`;
    }

    startLatencyMonitoring() {
        this.stopLatencyMonitoring();
        this.latencyCheckInterval = setInterval(() => this.checkLatency(), 10000);
    }

    stopLatencyMonitoring() {
        if (this.latencyCheckInterval) {
            clearInterval(this.latencyCheckInterval);
            this.latencyCheckInterval = null;
        }
    }

    async checkLatency() {
        try {
            const start = performance.now();
            await fetch('https://www.gstatic.com/generate_204', {
                method: 'HEAD',
                mode: 'no-cors',
                cache: 'no-cache'
            });
            const latency = Math.round(performance.now() - start);
            this.latencyInfo.textContent = `Latency: ${latency}ms`;
        } catch {
            this.latencyInfo.textContent = 'Latency: --ms';
        }
    }

    updateStatus(text, state) {
        this.statusText.textContent = text;
        this.statusDot.className = 'status-dot';

        switch (state) {
            case 'connecting':
                this.statusDot.style.background = 'var(--accent-warning)';
                this.statusDot.style.animation = 'pulse 1s infinite';
                break;
            case 'connected':
                this.statusDot.style.background = 'var(--accent-success)';
                this.statusDot.style.animation = 'pulse 2s infinite';
                break;
            case 'error':
                this.statusDot.style.background = 'var(--accent-danger)';
                this.statusDot.style.animation = 'none';
                break;
            default:
                this.statusDot.style.background = 'var(--fg-tertiary)';
                this.statusDot.style.animation = 'none';
        }
    }

    reset() {
        this.stopLatencyMonitoring();
        this.iframe.src = 'about:blank';
        this.iframe.classList.remove('loaded');
        this.placeholder.classList.remove('hidden');
        this.urlInput.value = '';
        this.updateStatus('Ready', 'ready');
        this.latencyInfo.textContent = 'Latency: --ms';
        this.urlInput.focus();
    }

    toggleIframeFullscreen() {
        if (this.iframe.classList.contains('loaded')) {
            if (this.iframe.requestFullscreen) {
                this.iframe.requestFullscreen();
            } else if (this.iframe.webkitRequestFullscreen) {
                this.iframe.webkitRequestFullscreen();
            } else if (this.iframe.msRequestFullscreen) {
                this.iframe.msRequestFullscreen();
            }
        }
    }

    handleIframeMessage(data) {
        if (data.payload?.url) {
            this.urlInput.value = data.payload.url;
        }
    }
}