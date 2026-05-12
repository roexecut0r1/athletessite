#!/usr/bin/env bash
#═══════════════════════════════════════════════════════════════════
# HML Reimagined — NVIDIA Driver Helper
# Detects and installs the correct NVIDIA driver
#═══════════════════════════════════════════════════════════════════
set -euo pipefail

PINK='\033[38;5;205m'
RESET='\033[0m'
BOLD='\033[1m'
log() { echo -e "${PINK}✨ $1${RESET}"; }

echo -e "${PINK}${BOLD}"
echo "  ╔═══════════════════════════════════════════════════════╗"
echo "  ║       ✨ HML Reimagined — NVIDIA Driver Helper ✨   ║"
echo "  ╚═══════════════════════════════════════════════════════╝"
echo -e "${RESET}"

# Check for NVIDIA hardware
if ! lspci | grep -qi nvidia; then
    echo "  No NVIDIA GPU detected."
    echo "  If you have an NVIDIA GPU, make sure it's enabled in BIOS."
    exit 0
fi

log "NVIDIA GPU detected!"
lspci | grep -i nvidia | sed 's/^/    /'
echo ""

# Check if driver is already installed
if nvidia-smi &>/dev/null; then
    log "NVIDIA driver is already installed!"
    nvidia-smi | head -5 | sed 's/^/    /'
    echo ""
    read -p "  Reinstall/update driver? (y/N): " choice
    [[ "$choice" =~ ^[Yy] ]] || exit 0
fi

# Use ubuntu-drivers
if ! command -v ubuntu-drivers &>/dev/null; then
    log "Installing ubuntu-drivers-common..."
    sudo apt update
    sudo apt install -y ubuntu-drivers-common
fi

log "Detecting recommended driver..."
echo ""
ubuntu-drivers devices 2>/dev/null | sed 's/^/    /'
echo ""

RECOMMENDED=$(ubuntu-drivers devices 2>/dev/null | grep "recommended" | head -1 | awk '{print $3}')
if [[ -n "$RECOMMENDED" ]]; then
    log "Recommended driver: ${RECOMMENDED}"
    echo ""
    echo "  Options:"
    echo "  1) Install recommended driver (${RECOMMENDED})"
    echo "  2) Install all recommended drivers automatically"
    echo "  3) Cancel"
    echo ""
    read -p "  Choose (1/2/3): " choice
    
    case "$choice" in
        1)
            log "Installing ${RECOMMENDED}..."
            sudo apt install -y "$RECOMMENDED"
            ;;
        2)
            log "Installing all recommended drivers..."
            sudo ubuntu-drivers install
            ;;
        *)
            echo "  Cancelled."
            exit 0
            ;;
    esac
    
    echo ""
    log "Driver installed! Please reboot for changes to take effect."
    echo ""
    read -p "  Reboot now? (y/N): " reboot_choice
    [[ "$reboot_choice" =~ ^[Yy] ]] && sudo reboot
else
    echo "  Could not detect recommended driver."
    echo "  Try: sudo ubuntu-drivers install"
fi
