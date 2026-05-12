# ✨ HML Reimagined — Hannah Montana Linux Reboot ✨

> A modern reimagining of the legendary Hannah Montana Linux, built on Ubuntu 24.04 LTS with KDE Plasma 6.

![HML Reimagined](branding/logos/banner-placeholder.txt)

## 🌟 What Is This?

HML Reimagined is a **fully usable, modern Linux distribution** that preserves the iconic pink/purple/glitter aesthetic and playful personality of the original Hannah Montana Linux (2009), while making it a genuinely polished daily-driver OS for modern hardware.

- **Base:** Ubuntu 24.04.x LTS (Noble Numbat)
- **Desktop:** KDE Plasma 6 (Wayland default, X11 fallback)
- **Installer:** Calamares with custom HML branding
- **Audio:** PipeWire
- **Boot:** UEFI-only with Secure Boot support

## 🎨 Three Visual Modes

| Mode | Description |
|------|-------------|
| **Classic HML** | Maximum nostalgia — glitter, bright pink, loud sounds |
| **Modern HML** | Clean, polished pink/purple — daily-driver ready |
| **Dark Glam** | Dark mode with neon pink/purple accents — gamer aesthetic |

## 📁 Project Structure

```
hml-reimagined/
├── build-scripts/         # ISO build and remastering scripts
├── config/                # System configuration files
│   ├── calamares/         # Installer branding & modules
│   ├── grub/              # GRUB EFI theme
│   ├── plymouth/          # Boot splash theme
│   ├── sddm/             # Login screen theme
│   └── skel/             # Default user skeleton files
├── themes/                # Desktop theming
│   ├── kde-plasma/        # Plasma global theme, color schemes
│   ├── gtk/               # GTK 3/4 themes
│   ├── icons/             # Custom icon theme
│   ├── cursors/           # Custom cursor theme
│   └── sddm/             # SDDM QML theme
├── sounds/                # System sound theme
├── wallpapers/            # Wallpaper packs per mode
├── apps/                  # Custom applications
│   ├── hml-control-center/ # Theme/sound/mode manager
│   ├── firefox-theme/     # Firefox matching theme
│   └── terminal/          # Terminal profile & ASCII art
├── branding/              # Logos, fonts, brand guidelines
├── installer/             # Calamares slideshow & scripts
├── packaging/             # Debian packages & Flatpak
├── docs/                  # Documentation
└── ci/                    # CI/CD GitHub Actions
```

## 🚀 Quick Start (Building the ISO)

### Prerequisites
- Ubuntu 24.04 LTS host system (or VM)
- 30GB+ free disk space
- Internet connection

### Option A: Cubic (GUI — Recommended for first build)
```bash
sudo apt-add-repository ppa:cubic-wizard/release
sudo apt update && sudo apt install cubic
# Then run: sudo cubic
# Select the Kubuntu 24.04 ISO as base
# Use build-scripts/cubic-chroot.sh inside the chroot
```

### Option B: Automated build script
```bash
cd build-scripts
sudo ./build-iso.sh
```

## 🔧 Hardware Support
- UEFI-only boot (no Legacy/CSM)
- GPT partitioning
- NVMe SSDs
- Intel/AMD/NVIDIA graphics (hybrid supported)
- Modern Wi-Fi chipsets
- Touchpads, touchscreens
- HiDPI & fractional scaling

## 📄 License
- Code & scripts: MIT License
- Original artwork: CC BY-SA 4.0
- This is a fan/parody project. Not affiliated with Disney.
