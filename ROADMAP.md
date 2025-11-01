# Cornerstone - Project Roadmap

A WebAssembly-powered voxel engine for building persistent multiplayer worlds with biblical themes and community storytelling.

---

## Phase 1: Foundation & Asset Pipeline (Week 1-2)

### 1.1 Asset Generation System
**Goal:** Enable anyone to generate game assets locally

#### ComfyUI Setup
- [ ] Install ComfyUI locally
- [ ] Configure for CPU-optimized generation (--cpu mode)
- [ ] Test basic Stable Diffusion 1.5 workflow
- [ ] Install ControlNet models:
  - [ ] Canny (edge detection)
  - [ ] OpenPose (character poses)
  - [ ] Tile (seamless textures)
  - [ ] Depth (perspective control)

#### ComfyUI Workflows (create reusable templates)
- [ ] **Block textures workflow** (16x16 tiles)
  - Input: text prompt + tile ControlNet
  - Output: seamless 16x16 texture
  - Batch: generate full set overnight
- [ ] **Character sprite workflow** (32x32 animated)
  - Input: character description + pose ControlNet
  - Generate: front, back, left, right views
  - Generate: 3 walking frames per direction
  - Output: ready for sprite sheet
- [ ] **Item/icon workflow** (16x16)
  - Input: item description
  - Output: centered icon on transparent background
- [ ] **UI elements workflow**
  - Input: style description
  - Output: buttons, borders, decorative elements

#### Procedural Generation (fallback/rapid prototyping)
- [ ] Build browser-based procedural generator
  - [ ] Perlin/Simplex noise implementation
  - [ ] Color palette system
  - [ ] Block texture generator (instant)
  - [ ] Simple character template system
  - [ ] Geometric item icon generator

#### Integration
- [ ] Create `tools/asset-generator/` directory structure
- [ ] Build sprite sheet packer (combine tiles → atlas)
- [ ] Auto-export to `images/` directory
- [ ] Hot-reload system (auto-refresh game when assets change)

### 1.2 Replace Default Assets
- [ ] Generate/acquire license-compliant textures
  - [ ] Block textures (grass, stone, dirt, sand, etc.)
  - [ ] Character sprites (player, NPCs)
  - [ ] UI elements
- [ ] Remove Minecraft/Pokemon assets from `images/`
- [ ] Update sprite references in code

---

## Phase 2: Core Engine Enhancements (Week 3-4)

### 2.1 Text & Bible Content System
**Goal:** Display Bible verses as voxels and UI text

- [ ] Implement voxel font system (5x7 bitmap font)
  - [ ] Create font atlas (A-Z, 0-9, punctuation)
  - [ ] `renderTextAsVoxels()` function
  - [ ] Test with simple messages
- [ ] Bible verse data structure
  - [ ] JSON format for verses (book, chapter, verse, text)
  - [ ] Verse loading system
  - [ ] Random verse selector
- [ ] Bible content features
  - [ ] Voxel "billboards" with verses
  - [ ] Story chapters as world scenes
  - [ ] Post office/message system (Paper Mario style)

### 2.2 Camera & Control Improvements
- [ ] Camera orbit system (3rd person ↔ 1st person zoom)
  - [ ] Smooth zoom transitions
  - [ ] Collision detection for camera
- [ ] Input system refactor
  - [ ] Context-based input capture (player vs UI vs chat)
  - [ ] Control transfer system (player → drone → vehicle)

---

## Phase 3: Multiplayer Foundation (Week 5-6)

### 3.1 Persistent World System
- [ ] No-logout system (permanent player representation)
- [ ] World state saving/loading
- [ ] Chunk persistence to disk

### 3.2 Networking (Better Protocol)
**From feature_list.txt:**
- [ ] Network architecture planning
  - [ ] Peer addressing system
  - [ ] Selective data distribution (teammates vs enemies)
  - [ ] Reliable vs unreliable packet system
- [ ] Network optimizations
  - [ ] Send only changed data
  - [ ] Small updates vs large updates
  - [ ] Timestamp tracking (ping/latency per peer)
- [ ] Server-authoritative systems
  - [ ] Health/damage
  - [ ] Physics/collision
  - [ ] Anti-cheat basics

### 3.3 Security & Privacy Features
**"Dark web" features from list:**
- [ ] Custom networking protocol
- [ ] Quantum-proof encryption research
- [ ] Steganography system (hide data in voxel chunks/colors)
- [ ] Optional content filtering (AI-based, toggle-able)

---

## Phase 4: Gameplay Systems (Week 7-10)

### 4.1 Combat & Physics
- [ ] Gun physics (Wasted-style)
- [ ] Weapon customization (Tarkov-style)
- [ ] Bullet types (Terraria-style)
- [ ] Stopping power (push on bullet collision)
- [ ] Sight-in weapon system (geometry-based aiming)

### 4.2 Building & Interaction
- [ ] Voxel object groups (multi-voxel physics entities)
- [ ] Drone designer/simulator
- [ ] In-game mini-computers (per-pixel 2D displays)
- [ ] Redstone-like logic system

### 4.3 NPCs & AI
- [ ] CubeWorld-style NPCs
- [ ] Pathfinding improvements
- [ ] AI chat assistant (offline, local)
- [ ] Generative AI features:
  - [ ] Structure generation
  - [ ] Texture generation (real-time)
  - [ ] AI NPCs (compact behavior storage)
  - [ ] Scribblenauts-style summoning ("type 'lion' → get lion")

---

## Phase 5: Game Modes & Content (Week 11+)

### 5.1 Tabletop Games In-Game
- [ ] Hologram-style game tables
- [ ] Chess implementation
- [ ] D&D/RPG system (Fire Emblem/Battle Decks style)
- [ ] Card games (remember Battle Decks, Super Senso)

### 5.2 Vehicle & Movement
- [ ] ICBM & spacecraft system
- [ ] Titanfall-style control transfer
- [ ] Movement between world types (low-poly, voxel, "normal")

### 5.3 Special Systems
- [ ] Glyphs/runes (Weiss-style or Minecraft enchanting)
- [ ] Summoning system (RWBY Schnee-style)
- [ ] Natural language processing integration
- [ ] Image-to-action AI (computer vision for control)

### 5.4 Audio & Media
- [ ] Bible audio/subtitles (read-along with highlighting)
- [ ] Word-level timestamp system
- [ ] Auto-audiobook generation (text → server TTS)
- [ ] Schumann resonance music integration

---

## Phase 6: Polish & Community (Week 12+)

### 6.1 Multi-World System
- [ ] Separate world types: low-poly, voxel, "normal"
- [ ] World transition system
- [ ] Chapter-based world saving (Bible story scenes)

### 6.2 Performance & Optimization
- [ ] Multi-threading for light updates
- [ ] Optimized flood-fill lighting
- [ ] Better chunk initialization
- [ ] LOD improvements

### 6.3 Community Features
- [ ] Asset sharing system (share ComfyUI workflows)
- [ ] World sharing (community-built Bible chapters)
- [ ] NPC creation tools
- [ ] Custom game mode creator

---

## Immediate Next Steps (Tomorrow)

### Option A: Asset Pipeline First
1. Install ComfyUI
2. Download SD 1.5 model
3. Test basic generation workflow
4. Create first block texture workflow
5. Generate 10 test textures

### Option B: Quick Win (Visual Progress)
1. Build procedural texture generator in browser
2. Generate 20 block textures procedurally
3. Replace default textures
4. See your own art in the game!

### Option C: Planning & Architecture
1. Review feature_list.txt in detail
2. Prioritize features by impact vs effort
3. Design database schemas
4. Plan multiplayer architecture
5. Create technical design docs

---

## Technical Debt & Refactoring

- [ ] Remove opaque/transparent surface tools (see MeshGrid vs GreedyCubeGrid)
- [ ] Refactor voxel indexing (get_voxel, get_light_level)
- [ ] Refactor flood_fill_light code
- [ ] Refactor terrain chunk initialization vs creation
- [ ] Fix TODO comments in pathing.ts (A-star collision edge case)

---

## Resources & References

### Inspiration Games
- Battle Decks, Super Senso, Hexaverse
- Titanfall (control transfer)
- Elephant Quest
- Fire Emblem / Final Fantasy (grid-based combat)
- Paper Mario (message system)
- CubeWorld
- Weiss (glyphs)
- RWBY (summoning)
- Terraria (bullet types)
- Wasted (gun physics)
- Tarkov (customization)

### Technical References
- Schumann resonance (7.83 Hz - for audio/music)
- Psalm 127:3-5 (bullet types reference)
- WebAssembly optimization resources
- ComfyUI documentation
- ControlNet papers

---

## Success Metrics

### Short-term (1 month)
- [ ] All assets are license-compliant
- [ ] Asset generation workflow is documented
- [ ] Bible verse system displays at least 10 verses in-world
- [ ] Basic multiplayer connection works

### Mid-term (3 months)
- [ ] 5+ community members generating assets
- [ ] First "Bible chapter world" is playable
- [ ] Combat system is fun and balanced
- [ ] 100+ unique blocks/items

### Long-term (6 months)
- [ ] Public demo available
- [ ] Community-run servers
- [ ] Multiple game modes playable
- [ ] Asset library with 500+ items

---

## Notes

**Philosophy:** Build a tool that enables community creativity while sharing biblical truth through interactive experiences.

**Key Differentiator:** The combination of:
- Open, moddable engine
- Biblical content integration
- Community world-building
- Privacy-focused (optional encryption/steganography)
- Local-first AI asset generation (democratized)

**Remember:** Start small, iterate fast, ship often. Each feature should demonstrate a "playable vertical slice" before moving to the next.
