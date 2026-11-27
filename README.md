# Student Hub - Personal Dashboard & Entertainment Hub

A high-performance, customizable web application combining a lightweight web proxy with a curated library of games. Hosted on GitHub Pages at `realtoblerone.github.io/cheekiest-proxy`.

## Features

### Browse Tab - Lightweight Proxy
- **Interstellar-based proxy engine** for unrestricted browsing
- **Multiple proxy backends** with automatic failover:
  - Interstellar (Primary)
  - Ultraviolet
  - Rammerhead
  - Holy Unblocker
  - Bare Server
- **Optimized for streaming** - Supports Xbox Cloud Gaming, GeForce Now, YouTube, Discord
- **Low latency** - Real-time latency monitoring and backend switching

### Games Tab - Curated Library
- **Classic Arcade** (60+ games): Run 3, Slope, Paper.io 2, Basketball Stars, Subway Surfers, Moto X3M, Snow Rider 3D, Counter Strike Unblocked, Granny, and many more
- **Ported Titles** (15+ games): Minecraft Classic, DOOM, Quake, Halo, GTA: San Andreas, Portal, Half-Life 2, Team Fortress 2, CS:GO, Valorant, Roblox, Fortnite, Apex Legends, Rocket League, Fall Guys
- **Favorites system** - Heart icon to save games, persistent across sessions
- **Search & filter** - Real-time search across all games

### Customization (Noah's Tutoring Hub inspired)
- **10 Themes**: Default, Ocean, Forest, Sunset, Violet, Rose, Midnight, Amber, Cyber, Light
- **6 Background patterns**: None, Grid, Dots, Mesh, Noise, Waves
- **Custom background upload** (JPG/PNG/WebP, max 5MB)
- **8 Cursor styles**: Default, Crosshair, Pointer, Text, Grab, Dot, Star, Heart
- **Tab customization**: Custom inactive tab title & favicon
- **Export/Import settings** - JSON-based backup & restore
- **Proxy settings**: Auto-backend switching, SSL enforcement, timeout configuration

### Security
- **Whitelist/Access key system** - Only authorized users can access
- **Session-based authentication** - Secure, no persistent credentials
- **Predefined access keys** (configurable)

## Quick Start

### Local Development
```bash
# Clone the repository
git clone https://github.com/realtoblerone/cheekiest-proxy.git
cd cheekiest-proxy

# Serve locally (any static server)
npx serve .
# or
python -m http.server 8000
# or
php -S localhost:8000
```

### Access Keys
Default access keys (configure in `scripts/auth.js`):
- `student-hub-2024`
- `cheekiest-proxy`
- `interstellar-access`
- `gaming-hub-key`
- `private-student-2024`

### GitHub Pages Deployment
1. Push to `main` branch
2. Enable GitHub Pages in repository settings (Source: GitHub Actions)
3. Workflow deploys automatically on push

## Project Structure

```
cheekiest-proxy/
├── index.html              # Main HTML entry point
├── assets/
│   ├── favicon.svg         # App icon
│   └── cursors/            # Custom cursor files
├── styles/
│   ├── main.css            # Core styles & components
│   └── themes.css          # Theme definitions
├── scripts/
│   ├── main.js             # App initialization & coordination
│   ├── auth.js             # Authentication & access control
│   ├── proxy.js            # Interstellar-based proxy engine
│   ├── games.js            # Games library & modal management
│   ├── settings.js         # Settings persistence (localStorage)
│   ├── ui.js               # UI management & customization
│   └── toast.js            # Notification system
├── data/
│   └── games.js            # Game definitions (arcade + ported)
└── .github/
    └── workflows/
        └── deploy.yml      # GitHub Pages deployment
```

## Architecture

### Proxy Engine (Interstellar-based)
The proxy uses a multi-backend architecture with automatic failover:

```
User Request → Backend Selector → URL Rewriter → Proxy Service → Target Site
                    ↓
            Latency Monitor → Auto-switch on failure
```

Each backend implements URL rewriting to proxy content through their service workers, enabling access to restricted content while maintaining low latency for streaming.

### Settings Management
Settings are persisted to `localStorage` with JSON serialization:
- Theme, background, cursor preferences
- Custom tab title/favicon
- Proxy configuration
- Favorites (separate storage key)

### Game Integration
Games are embedded via iframe with appropriate sandbox permissions:
- `allow-scripts`, `allow-same-origin`, `allow-forms`
- `allow-popups`, `allow-pointer-lock`, `allow-fullscreen`
- Pointer lock for FPS games
- Fullscreen support for immersive play

## Customization

### Adding New Themes
Edit `styles/themes.css` and add new `[data-theme="name"]` block:
```css
[data-theme="mytheme"] {
    --bg-primary: #yourcolor;
    --bg-secondary: #yourcolor;
    --bg-tertiary: #yourcolor;
    --accent-primary: #yourcolor;
    --accent-primary-hover: #yourcolor;
}
```

### Adding Games
Edit `data/games.js` and add to `ARCADE_GAMES` or `PORTED_GAMES`:
```javascript
{ id: 'game-id', name: 'Game Name', category: 'arcade', url: 'https://game.url/', thumbnail: 'thumb-url' }
```

### Adding Access Keys
Edit `scripts/auth.js` and add to `ACCESS_KEYS` array.

## Browser Support
- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

Requires: ES Modules, localStorage, Pointer Lock API, Fullscreen API

## License
MIT License - Feel free to customize and deploy your own instance.

## Credits
- **Interstellar Proxy** - Core proxy architecture reference
- **Classroom 6x / Drive U 7 Home** - Game library inspiration
- **Noah's Tutoring Hub** - Customization UI inspiration
- **Font Awesome** - Icon references (inline SVG used)