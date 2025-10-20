# Russian Civil War Card Game

## Overview

A 2D Hearthstone-style strategy card game set during the Russian Civil War (1917-1923). Players choose between the White Army (Imperial Loyalists) and Red Army (Bolsheviks) factions, building decks and deploying cards in a lane-based tactical battle system. The objective is to destroy the enemy's main tower while defending your own through strategic card placement and combat management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Core Technologies:**
- React 18 with TypeScript for type-safe UI development
- Vite as the build tool and development server
- TailwindCSS for utility-first styling
- Framer Motion for smooth animations and transitions
- Radix UI components for accessible, unstyled primitives

**State Management Strategy:**
- Zustand stores for global game state (`useGameState`) and audio control (`useAudio`)
- React Query (@tanstack/react-query) configured for server data fetching with infinite stale time and no refetch
- Local component state using React hooks for UI-specific concerns

**Game Rendering Approach:**
- 2D Hearthstone-style interface with lane-based card positioning (left, center, right lanes)
- CSS Grid and Flexbox for responsive layouts
- Framer Motion for card play animations, hover effects, and UI transitions
- Gradient backgrounds and visual effects for faction theming

**Game Flow Architecture:**
- **Menu Phase:** Main menu with faction selection, deck building, and settings
- **Faction Select Phase:** Choose between White Army or Red Army
- **Deck Building Phase:** Create and save custom 8-card decks from faction-specific cards
- **Playing Phase:** Active turn-based gameplay on lane-based battlefield
- **Game Over Phase:** Victory/defeat screen with reset capability

**Component Organization:**
- Game-specific components in `client/src/components/game/`
- UI primitives in `client/src/components/ui/` (Radix-based)
- 2D implementations: `GameScreen2D.tsx`, `Card2D.tsx`, `Tower2D.tsx`, `Board2D.tsx`
- Legacy 3D components preserved but unused (React Three Fiber, Three.js)

**Game Logic:**
- Card types: Units (assault, support, spy) and Bonuses (medic, engineer, instructor, aerial)
- Flying units converted to aerial bombardment bonus cards (attack towers directly, ignore enemy units)
- Spy units (Разведчик-шпион for Whites, Агент ВЧК for Reds) attack main tower directly
- Lane-based positioning with three slots per faction
- Combat system: center lane attacks enemies → side towers → main tower
- Turn-based resource management: +3 supply per turn, max supply tracked
- Tower defense mechanics (main tower + side towers with 10/6/6 health)

**Data Persistence:**
- LocalStorage for deck persistence with versioning system
- Deck storage includes card names (not full data) for migration flexibility
- Maximum 10 saved decks per user with automatic pruning

### Backend Architecture

**Server Framework:**
- Express.js server with TypeScript
- Vite middleware integration for development HMR
- Custom logging middleware for API request tracking

**API Design:**
- RESTful endpoints for game session management
- Placeholder routes for future multiplayer functionality
- Routes: game session creation, state retrieval, action processing, statistics

**Development vs Production:**
- Development: Vite dev server with HMR for instant feedback
- Production: Static file serving from compiled `dist/public` directory
- Environment-aware setup in `server/vite.ts`

**Storage Layer:**
- In-memory storage implementation (`MemStorage`) for development
- Interface-based design (`IStorage`) for future database integration
- User management schema defined but not actively used in current game flow

### External Dependencies

**Database:**
- Drizzle ORM configured for PostgreSQL (via `@neondatabase/serverless`)
- Schema defined in `shared/schema.ts` with user table
- Migration support via `drizzle-kit` (currently unused for game state)
- Connection via `DATABASE_URL` environment variable

**UI Component Libraries:**
- Extensive Radix UI component collection for accessible primitives:
  - Dialog, Dropdown, Tooltip, Accordion, Alert Dialog
  - Select, Checkbox, Radio Group, Slider, Switch
  - Navigation Menu, Context Menu, Hover Card
  - Tabs, Toast, Progress, Scroll Area
- `class-variance-authority` for component variant styling
- `cmdk` for command palette functionality

**Animation & 3D (Legacy):**
- `@react-three/fiber` and `@react-three/drei` for 3D rendering (not used in current 2D version)
- `@react-three/postprocessing` for shader effects (not used)
- `vite-plugin-glsl` for shader support
- Framer Motion for 2D animations (actively used)

**Build & Development Tools:**
- TypeScript with strict mode and ESNext modules
- Path aliases: `@/` for client source, `@shared/` for shared code
- PostCSS with Tailwind and Autoprefixer
- Asset handling for GLTF/GLB models and audio files (MP3, OGG, WAV)

**Runtime:**
- `tsx` for TypeScript execution in development
- `esbuild` for server-side bundling in production
- Environment variable management for database connections

## Recent Changes

**Date:** October 19, 2025 - v.2.11

**UI/UX Redesign - Minimalistic & Visual:**
- ✅ Main Menu redesign:
  - Removed card container for clean, minimalistic look
  - Kept only "RUSSIAN CIVIL WAR" title (removed subtitle and objectives)
  - New buttons: **Кампания** (disabled), **Быстрый бой**, **Сетевая игра** (disabled), **Колода**
  - Settings moved to gear icon in bottom right corner
  - Sound toggle moved to Settings page
  - Background changed to show new user-provided historical images
- ✅ Deck Builder complete visual redesign:
  - Cards now display as real playing cards with actual battle images
  - Visual card component shows: card image background, cost badge, card name, stat icons (Swords/Castle/Heart)
  - Hover animations and glow effects for better UX
  - Changed layout from 2-column list to 3-column grid (2/3 available, 1/3 selected deck)
  - Empty deck slots shown with dashed borders and "?" placeholder
  - Background changed from gradient to solid gray-900 (minimalistic)
  - All text updated to Russian, simplified button labels
- ✅ Settings page redesign:
  - Background changed from amber gradient to solid gray-900
  - Updated from amber theme to clean gray minimalistic theme
  - Maintained sound toggle functionality
- ✅ All card images replaced with user-provided historical artwork:
  - white_army_soldier.jpg, red_army_soldier.jpg, white_army_cavalry.jpg, red_army_infantry.jpg
  - field_medic.jpg, artillery_cannon.jpg, aerial_bomber.jpg
- ✅ All 5 main menu background images replaced with user-provided historical scenes

**Date:** October 16, 2025 - v.2.10

**Critical AI Architecture Improvements:**
- ✅ Fixed AI supply system: AI now receives +3 supply at START of turn (not end)
  - Previously AI received supply at end of turn, causing it to be capped at 3
  - Now AI gets supply when turn begins, allowing proper accumulation
- ✅ AI can now accumulate unlimited supply points
  - Removed maxSupply restriction for AI (same as player)
  - AI can bank resources across multiple turns for strategic plays
- ✅ Refactored AI turn logic with recursive card playing
  - Replaced problematic synchronous while loop with recursive `playNextAICard` function
  - Each card plays with 600ms delay for smooth animations
  - Eliminates race conditions by ensuring state updates between card plays
  - `aiAttackPhase` function handles attack phase separately after all cards played
  - Clean turn handoff to player after AI attacks complete
- ✅ AI now plays multiple cards per turn based on available supply
  - Plays cards until supply runs out or no playable cards remain
  - AI strategically plays aerial bombardment cards first, then units
  - Proper state synchronization prevents card disappearance issues
- ✅ Player mechanics preserved and stable
  - playCard, attackWithCard, and playBonusCard functions unchanged
  - boardCards state properly maintained across all operations
  - Card parameters remain correct throughout gameplay

**Critical Combat Bug Fixes:**
- ✅ Fixed critical combat damage bug where cards were not taking damage
  - attackWithCard was applying damage but immediately overwriting with old state
  - Now gets fresh state AFTER damage is applied, preserving health changes
  - Cards now properly take damage and die when health reaches 0
  - Counter-attack damage also works correctly
- ✅ Fixed tower health values: Main tower = 15 HP, Side towers = 10 HP
- ✅ Fixed supply UI to show current/max format (e.g., "💰 6/9")
- ✅ Fixed supply system: both supply and maxSupply increase by 3 each turn
- ✅ Fixed cards disappearing bug: dead cards properly filtered in combat targeting

**Version Updates:**
- ✅ Version updated to 2.10

**Previous Updates (v2.8 - October 13, 2025):**
- ✅ Fixed AI deck initialization bug: AI now correctly uses cards from its own faction instead of player's faction cards
- ✅ All 8 cards in deck must now be unique - no duplicates allowed
- ✅ Cards remain on battlefield until destroyed (health drops to 0)
- ✅ Supply points accumulate if not spent (removed max supply cap for player)

**Previous Updates (v2.4):**
- ✅ Converted flying units to aerial bombardment bonus cards (ignore units, attack towers directly)
- ✅ Added spy unit class: "Разведчик-шпион" (Whites), "Агент ВЧК" (Reds) - attack main tower directly
- ✅ Supply generation increased from +1 to +3 per turn for faster gameplay
- ✅ Combat mechanics improved: center lane attacks enemies first, then side towers, then main tower
- ✅ Enhanced AI logic to play bonus cards and use aerial bombardment strategically
- ✅ Card parameter icons changed from text (ATK/TWR/HP) to minimalist icons (Swords/Castle/Heart)
- ✅ All card images replaced with Russian Civil War 1917 themed images
- ✅ Menu buttons redesigned with game-like textures using gradients and shadows
- ✅ Studio credits added: "Студия Марка Минченко"

**Known Issues:**
- Background music still uses placeholder. User can replace `/sounds/background.mp3` with sad/heavy piano music from Pixabay

## Replit Environment Setup

**Date:** October 13, 2025

**Development Setup:**
- Workflow configured: `npm run dev` on port 5000
- Frontend served at 0.0.0.0:5000 with allowedHosts enabled for Replit proxy
- Vite dev server with HMR for hot module reloading
- All dependencies installed via npm

**Deployment Configuration:**
- Deployment target: Autoscale (stateless web app)
- Build command: `npm run build` (builds both frontend and backend)
- Run command: `npm run start` (production mode with static file serving)
- Output directory: `dist/public` for frontend, `dist/index.js` for backend

**Database Status:**
- Database not provisioned (in-memory storage used via MemStorage)
- Future PostgreSQL integration available via Drizzle ORM
- User authentication schema defined but not actively used
- Game state managed client-side with localStorage for deck persistence

**Port Configuration:**
- Development: Port 5000 (both API and frontend)
- Backend API endpoints: `/api/*`
- Frontend: All other routes handled by Vite/static files

**Current Status:**
- ✅ Dependencies installed
- ✅ Development server running
- ✅ Frontend accessible and functional
- ✅ Build process verified
- ✅ Deployment configured
- ✅ Game loads with main menu and deck builder