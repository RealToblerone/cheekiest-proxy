import { ARCADE_GAMES, PORTED_GAMES } from '../data/games.js';

export class GamesManager {
    constructor() {
        this.arcadeGrid = document.getElementById('arcade-grid');
        this.portedGrid = document.getElementById('ported-grid');
        this.favoritesGrid = document.getElementById('favorites-grid');
        this.searchInput = document.getElementById('games-search');
        this.categoryBtns = document.querySelectorAll('.category-btn');
        this.gameModal = document.getElementById('game-modal');
        this.gameFrame = document.getElementById('game-frame');
        this.gameTitle = document.getElementById('game-modal-title');
        this.closeModalBtn = document.querySelector('.modal-close');
        this.favoriteBtn = document.getElementById('favorite-btn');
        this.fullscreenGameBtn = document.getElementById('fullscreen-game-btn');
        this.settings = null;
        this.currentGame = null;
        this.favorites = new Set();
    }

    init(settings) {
        this.settings = settings;
        this.loadFavorites();
        this.renderGames();
        this.bindEvents();
    }

    loadFavorites() {
        try {
            const stored = localStorage.getItem('student-hub-favorites');
            if (stored) {
                this.favorites = new Set(JSON.parse(stored));
            }
        } catch (e) {
            console.warn('Failed to load favorites:', e);
        }
    }

    saveFavorites() {
        try {
            localStorage.setItem('student-hub-favorites', JSON.stringify([...this.favorites]));
        } catch (e) {
            console.warn('Failed to save favorites:', e);
        }
    }

    toggleFavorite(gameId) {
        if (this.favorites.has(gameId)) {
            this.favorites.delete(gameId);
        } else {
            this.favorites.add(gameId);
        }
        this.saveFavorites();
        this.renderGames();
        this.updateFavoriteButton();
    }

    isFavorite(gameId) {
        return this.favorites.has(gameId);
    }

    renderGames() {
        this.renderCategory('arcade', ARCADE_GAMES);
        this.renderCategory('ported', PORTED_GAMES);
        this.renderFavorites();
    }

    renderCategory(category, games) {
        const grid = category === 'arcade' ? this.arcadeGrid : this.portedGrid;
        grid.innerHTML = '';

        games.forEach(game => {
            const card = this.createGameCard(game, category);
            grid.appendChild(card);
        });
    }

    renderFavorites() {
        this.favoritesGrid.innerHTML = '';

        const allGames = [...ARCADE_GAMES, ...PORTED_GAMES];
        const favoriteGames = allGames.filter(g => this.favorites.has(g.id));

        if (favoriteGames.length === 0) {
            this.favoritesGrid.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    <h3>No favorites yet</h3>
                    <p>Click the heart icon on any game to add it here</p>
                </div>
            `;
            return;
        }

        favoriteGames.forEach(game => {
            const card = this.createGameCard(game, game.category);
            this.favoritesGrid.appendChild(card);
        });
    }

    createGameCard(game, category) {
        const card = document.createElement('article');
        card.className = 'game-card';
        card.dataset.gameId = game.id;
        card.dataset.category = category;
        card.tabIndex = 0;

        const thumbnailUrl = game.thumbnail || `https://via.placeholder.com/400x225/1a1a2e/6366f1?text=${encodeURIComponent(game.name)}`;

        card.innerHTML = `
            <div class="game-thumbnail">
                <img src="${thumbnailUrl}" alt="${game.name}" loading="lazy">
                <div class="game-overlay">
                    <button class="game-play-btn" aria-label="Play ${game.name}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                        <span>Play</span>
                    </button>
                </div>
                <button class="game-favorite ${this.isFavorite(game.id) ? 'active' : ''}" aria-label="${this.isFavorite(game.id) ? 'Remove from favorites' : 'Add to favorites'}" aria-pressed="${this.isFavorite(game.id)}">
                    <svg viewBox="0 0 24 24" fill="${this.isFavorite(game.id) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </button>
            </div>
            <div class="game-info">
                <h3 class="game-title">${game.name}</h3>
                <div class="game-meta">
                    <span class="game-category">${category === 'arcade' ? 'Arcade' : 'Ported'}</span>
                </div>
            </div>
        `;

        const playBtn = card.querySelector('.game-play-btn');
        const favBtn = card.querySelector('.game-favorite');

        const openGame = () => this.openGame(game);
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.game-favorite')) {
                openGame();
            }
        });
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openGame();
            }
        });

        playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openGame();
        });

        favBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleFavorite(game.id);
            favBtn.classList.toggle('active', this.isFavorite(game.id));
            favBtn.setAttribute('aria-pressed', this.isFavorite(game.id));
            favBtn.setAttribute('aria-label', this.isFavorite(game.id) ? 'Remove from favorites' : 'Add to favorites');
            favBtn.querySelector('svg').setAttribute('fill', this.isFavorite(game.id) ? 'currentColor' : 'none');
            this.renderFavorites();
        });

        return card;
    }

    openGame(game) {
        this.currentGame = game;
        this.gameTitle.textContent = game.name;
        this.gameFrame.src = game.url;
        this.gameModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        this.updateFavoriteButton();
        this.gameFrame.focus();
    }

    closeGame() {
        this.gameModal.classList.add('hidden');
        this.gameFrame.src = 'about:blank';
        document.body.style.overflow = '';
        this.currentGame = null;
    }

    updateFavoriteButton() {
        if (this.currentGame) {
            const isFav = this.isFavorite(this.currentGame.id);
            this.favoriteBtn.classList.toggle('active', isFav);
            this.favoriteBtn.querySelector('span').textContent = isFav ? 'Remove from Favorites' : 'Add to Favorites';
            this.favoriteBtn.querySelector('svg').setAttribute('fill', isFav ? 'currentColor' : 'none');
        }
    }

    bindEvents() {
        this.categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchCategory(btn.dataset.category));
        });

        this.searchInput.addEventListener('input', (e) => this.filterGames(e.target.value));

        this.closeModalBtn.addEventListener('click', () => this.closeGame());

        this.gameModal.querySelector('.modal-backdrop').addEventListener('click', () => this.closeGame());

        this.favoriteBtn.addEventListener('click', () => {
            if (this.currentGame) {
                this.toggleFavorite(this.currentGame.id);
                this.updateFavoriteButton();
                this.renderFavorites();
                this.renderGames();
            }
        });

        this.fullscreenGameBtn.addEventListener('click', () => this.toggleGameFullscreen());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.gameModal.classList.contains('hidden')) {
                this.closeGame();
            }
        });
    }

    switchCategory(category) {
        this.categoryBtns.forEach(btn => {
            const isActive = btn.dataset.category === category;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive);
        });

        document.getElementById('arcade-grid').classList.toggle('hidden', category !== 'arcade');
        document.getElementById('ported-grid').classList.toggle('hidden', category !== 'ported');
        document.getElementById('favorites-grid').classList.toggle('hidden', category !== 'favorites');
    }

    filterGames(query) {
        const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
        const allCards = document.querySelectorAll('.game-card');

        allCards.forEach(card => {
            const title = card.querySelector('.game-title').textContent.toLowerCase();
            const category = card.dataset.category.toLowerCase();
            const matches = terms.every(term => title.includes(term) || category.includes(term));
            card.style.display = matches ? 'flex' : 'none';
        });
    }

    toggleGameFullscreen() {
        if (this.gameFrame.requestFullscreen) {
            this.gameFrame.requestFullscreen();
        } else if (this.gameFrame.webkitRequestFullscreen) {
            this.gameFrame.webkitRequestFullscreen();
        } else if (this.gameFrame.msRequestFullscreen) {
            this.gameFrame.msRequestFullscreen();
        }
    }
}