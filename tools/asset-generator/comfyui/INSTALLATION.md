# ComfyUI Installation Guide for Cornerstone

This guide covers installing ComfyUI for game asset generation, with emphasis on CPU-optimized workflows for accessibility.

## Overview

ComfyUI is a powerful, node-based interface for Stable Diffusion that enables local AI asset generation. While slower on CPU, it allows anyone to generate game assets without relying on cloud services or expensive GPUs.

---

## Installation Methods

### Method 1: ComfyUI Desktop (Recommended for Beginners)

**Pros:**
- One-click installation
- Automatic Python environment setup
- Easy to use

**Cons:**
- Requires NVIDIA GPU on Windows
- Not ideal for CPU-only setups

**Steps:**
1. Download from [docs.comfy.org](https://docs.comfy.org/installation/desktop/windows)
2. Run installer
3. Launch ComfyUI Desktop

**Skip this method if you don't have an NVIDIA GPU!**

---

### Method 2: Portable Windows Version (Best for CPU Mode)

**Pros:**
- Works on CPU without GPU
- No Python installation required
- Portable - can run from USB drive

**Steps:**

1. **Download**
   - Get `ComfyUI_windows_portable_nvidia_cu118_or_cpu.7z`
   - From: [GitHub Releases](https://github.com/comfyanonymous/ComfyUI/releases)
   - Size: ~2-3 GB

2. **Extract**
   - Extract to `C:\ComfyUI` (or any location)
   - Creates `ComfyUI_windows_portable` folder

3. **Run in CPU Mode**
   - Double-click `run_cpu.bat`
   - Wait for server to start (may take 1-2 minutes)
   - Browser opens to `http://127.0.0.1:8188`

4. **Download Models** (see Models section below)

---

### Method 3: Manual Installation (Advanced)

For Linux, Mac, or custom setups:

```bash
# Clone repository
git clone https://github.com/comfyanonymous/ComfyUI.git
cd ComfyUI

# Install dependencies
pip install -r requirements.txt

# Run in CPU mode
python main.py --cpu

# Run with low VRAM (if you have a GPU with <6GB VRAM)
python main.py --lowvram
```

---

## System Requirements

### Minimum (CPU Mode):
- **RAM:** 16 GB (32 GB recommended)
- **Storage:** 15-20 GB free
- **CPU:** Multi-core processor (4+ cores recommended)
- **OS:** Windows 10+, Linux, macOS

### Recommended (GPU Mode):
- **GPU:** NVIDIA with 6+ GB VRAM
- **RAM:** 16-32 GB
- **Storage:** 50+ GB for multiple models

---

## Downloading Models

ComfyUI requires Stable Diffusion models to generate images. For game assets, we recommend:

### Essential Models

#### 1. Stable Diffusion 1.5
- **Best for:** Quick prototyping, low memory usage
- **Size:** ~4 GB
- **Download:** [Hugging Face - SD 1.5](https://huggingface.co/runwayml/stable-diffusion-v1-5)
- **File:** `v1-5-pruned-emaonly.safetensors`
- **Location:** Place in `ComfyUI/models/checkpoints/`

**Why SD 1.5?**
- Faster on CPU than newer models
- Proven track record
- Good for 16x16 and 32x32 pixel art with the right prompts
- Large community, many tutorials

#### 2. ControlNet Models (Optional but Recommended)

ControlNet helps control generation with edge detection, depth maps, etc.

**Download locations:** [Hugging Face - ControlNet](https://huggingface.co/lllyasviel/ControlNet/tree/main/models)

Place in `ComfyUI/models/controlnet/`

Essential ControlNet models for game assets:

| Model | Use Case | File |
|-------|----------|------|
| **Canny** | Edge-guided textures | `control_sd15_canny.pth` |
| **Tile** | Seamless textures | `control_sd15_tile.pth` |
| **OpenPose** | Character poses | `control_sd15_openpose.pth` |
| **Depth** | 3D-aware generation | `control_sd15_depth.pth` |

---

## CPU Mode Optimization

Running on CPU is slow but workable with these tips:

### Performance Expectations

| Task | GPU (RTX 3060) | CPU (8-core) |
|------|----------------|--------------|
| 16x16 texture | 5 seconds | 2-3 minutes |
| 32x32 sprite | 8 seconds | 4-5 minutes |
| 512x512 image | 15 seconds | 10-15 minutes |

### Optimization Tips

1. **Use Stable Diffusion 1.5**
   - Faster than SD 2.x or SDXL
   - Better for CPU mode

2. **Lower Resolution First**
   - Generate at 256x256 or 384x384
   - Upscale later if needed

3. **Reduce Steps**
   - Use 20-25 steps instead of 50
   - Still produces decent results

4. **Batch Overnight**
   - Queue multiple generations
   - Let it run while you sleep
   - Perfect for generating full asset sets

5. **Use Simple Prompts**
   - Complex prompts take longer
   - Keep it concise

6. **Close Other Programs**
   - Free up RAM
   - CPU can focus on generation

---

## Installing ComfyUI Manager (Highly Recommended)

ComfyUI Manager helps install custom nodes and manage workflows.

### Installation

1. **Open ComfyUI**
2. **Load in browser** (http://127.0.0.1:8188)
3. **Open terminal in ComfyUI folder**
4. **Run:**
   ```bash
   cd custom_nodes
   git clone https://github.com/ltdrdata/ComfyUI-Manager.git
   ```
5. **Restart ComfyUI**
6. **Click "Manager" button** in UI

---

## Directory Structure

After installation, your ComfyUI folder should look like:

```
ComfyUI/
├── models/
│   ├── checkpoints/          # Stable Diffusion models
│   │   └── v1-5-pruned-emaonly.safetensors
│   ├── controlnet/           # ControlNet models
│   │   ├── control_sd15_canny.pth
│   │   ├── control_sd15_tile.pth
│   │   └── ...
│   ├── vae/                  # VAE models (optional)
│   └── loras/                # LoRA models (optional)
├── custom_nodes/             # Custom nodes
│   └── ComfyUI-Manager/
├── input/                    # Input images
├── output/                   # Generated images
└── run_cpu.bat               # CPU launcher (Windows)
```

---

## Testing Your Installation

### Quick Test Workflow

1. **Launch ComfyUI**
   - Run `run_cpu.bat` (Windows) or `python main.py --cpu`

2. **Load Default Workflow**
   - Should auto-load on first run

3. **Select Model**
   - Click "Load Checkpoint" node
   - Select `v1-5-pruned-emaonly.safetensors`

4. **Enter Prompt**
   - Example: "stone texture, seamless, 16x16 pixels"

5. **Queue Prompt**
   - Click "Queue Prompt" button
   - Wait 2-5 minutes on CPU

6. **Check Output**
   - Look in `ComfyUI/output/` folder

---

## Troubleshooting

### "Out of Memory" Errors
- Close other programs
- Use smaller models (SD 1.5 instead of SDXL)
- Reduce resolution
- Enable swap file (Windows: increase virtual memory)

### "Model Not Found"
- Check file is in correct `models/` subfolder
- Restart ComfyUI
- Check filename matches exactly

### Slow Performance
- This is normal for CPU mode!
- See optimization tips above
- Consider overnight batch generation

### ComfyUI Won't Start
- Check Python version (3.10+ required for manual install)
- Try portable version instead
- Check antivirus isn't blocking

---

## Next Steps

Once installed, see:
- **WORKFLOWS.md** - Pre-made workflows for game assets
- **TEXTURE_WORKFLOW.md** - Generate block textures
- **CHARACTER_WORKFLOW.md** - Generate character sprites

---

## Additional Resources

- **Official Docs:** https://docs.comfy.org
- **ComfyUI Wiki:** https://comfyui-wiki.com
- **GitHub:** https://github.com/comfyanonymous/ComfyUI
- **Community:** r/comfyui on Reddit
- **Tutorials:** https://stable-diffusion-art.com/comfyui/

---

## License & Attribution

ComfyUI is licensed under GPL-3.0. Models have their own licenses:
- **SD 1.5:** CreativeML Open RAIL-M License
- **ControlNet:** OpenRAIL License

Always check license before commercial use.

---

**Ready to generate assets?** → See WORKFLOWS.md for pre-configured templates!
