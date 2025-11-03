# Cornerstone - WebAssembly Voxel Engine

A high-performance 3D voxel game engine with spiritual and educational features. Built on WAVE (WebAssembly Voxel Engine), completely rewritten in TypeScript with WebAssembly for exceptional performance.

## Quickstart

Get up and running in 3 simple steps:

### 1. Build the Project
```bash
npx tsc
```

### 2. Start the Server
Choose any method:

**Option A - NPM script (recommended):**
```bash
npm start
```

**Option B - Platform-specific scripts:**
- **Windows:** Double-click `start.bat`
- **Unix/Linux/Mac:** Run `./start.sh`

**Option C - Manual:**
```bash
npx http-server -p 8000
```

### 3. Open in Browser
Navigate to: **http://localhost:8000**

That's it! You should see the voxel world load in your browser.

---

## Development

### Build Commands
```bash
# Compile TypeScript only
npm run build

# Build and start server
npm run dev

# Start server (assumes already built)
npm start
```

### Project Structure
```
cornerstone/
├── src/              # TypeScript source code
├── target/           # Compiled JavaScript (generated)
├── index.html        # Application entry point
├── core.js           # Pre-compiled WASM module
└── images/           # Texture assets
```

### Making Changes
1. Edit TypeScript files in `src/`
2. Run `npx tsc` to compile
3. Refresh your browser to see changes

**Key files to modify:**
- `src/main.ts` - Game logic and initialization
- `src/engine.ts` - Core engine functionality
- CLAUDE.md contains detailed documentation for Claude Code

---

## Features

### Performance
- **WebAssembly-powered** world generation and meshing
- **Greedy meshing** algorithm for optimized geometry
- **Level-of-detail (LOD)** terrain rendering
- **Run-length encoded** chunk storage
- Custom WebGL2 renderer with voxel-optimized shaders

### Gameplay
- **Dynamic lighting** based on cellular automata
- **Entity Component System (ECS)** architecture
- **Physics and collision detection** with auto-stepping
- **A* pathfinding** for AI entities
- **Particle systems** for visual effects

### Spiritual Features (In Development)
- Bible verse rendering in voxel world
- Schumann resonance audio for meditation
- Educational and contemplative gameplay elements

---

## Technical Highlights

- **Modern TypeScript** with strict typing
- **WebGL2** with 2D texture arrays for single-draw-call chunks
- **Compressed geometry format** reducing memory usage by ~80%
- **Spatial hashing** for efficient lighting
- **Fixed timestep** game loop at 60 TPS

---

## Browser Requirements

- **WebGL2 support** (Chrome, Firefox, Edge - modern versions)
- **Pointer Lock API** for mouse look
- **ES6 modules** support

---

## Credits

Built on the foundation of [WAVE: WebAssembly Voxel Engine](https://www.skishore.me/voxels), originally based on [noa-engine](https://github.com/fenomas/noa).

See `WAVE-README.md` for the original engine documentation and technical deep-dive.

---

## License

MIT License - See LICENSE file for details

**Note:** Textures in the `images/` directory are from vanilla Minecraft, Rhodox's Painterly Pack, and Pokemon. They are not covered by this project's license.

---

## Contributing

This project is actively being developed as "Cornerstone" with spiritual and educational features. Contributions and ideas are welcome!

For detailed development documentation, see `CLAUDE.md`.
