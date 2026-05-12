#!/usr/bin/env bash
#═══════════════════════════════════════════════════════════════════
# HML Reimagined — USB Writer
# Writes the ISO to a USB drive for portable use
#═══════════════════════════════════════════════════════════════════
set -euo pipefail

PINK='\033[38;5;205m'
RED='\033[31m'
RESET='\033[0m'
BOLD='\033[1m'

ISO="${1:-}"
USB="${2:-}"

if [[ -z "$ISO" || -z "$USB" ]]; then
    echo -e "${PINK}✨ HML Reimagined — USB Writer${RESET}"
    echo ""
    echo "Usage: sudo $0 <iso-file> <usb-device>"
    echo "  Example: sudo $0 output/HML-Reimagined-1.0-amd64.iso /dev/sdb"
    echo ""
    echo "Available USB devices:"
    lsblk -d -o NAME,SIZE,MODEL,TRAN | grep -E "usb|removable" || \
        lsblk -d -o NAME,SIZE,MODEL | grep -v "loop\|sr\|nvme\|sda"
    exit 1
fi

if [[ $EUID -ne 0 ]]; then
    echo -e "${RED}❌ Must run as root: sudo $0 $*${RESET}"
    exit 1
fi

if [[ ! -f "$ISO" ]]; then
    echo -e "${RED}❌ ISO not found: $ISO${RESET}"
    exit 1
fi

if [[ ! -b "$USB" ]]; then
    echo -e "${RED}❌ Device not found: $USB${RESET}"
    exit 1
fi

# Safety check — don't write to system disk
if [[ "$USB" == "/dev/sda" || "$USB" == "/dev/nvme0n1" ]]; then
    echo -e "${RED}❌ SAFETY: Refusing to write to ${USB} (likely system disk)${RESET}"
    exit 1
fi

echo -e "${PINK}${BOLD}"
echo "  ╔═══════════════════════════════════════════════════════╗"
echo "  ║          ✨ HML Reimagined — USB Writer ✨           ║"
echo "  ╚═══════════════════════════════════════════════════════╝"
echo -e "${RESET}"
echo ""
echo "  ISO:    $ISO"
echo "  Target: $USB"
echo "  Size:   $(lsblk -d -o SIZE "$USB" | tail -1)"
echo ""
echo -e "${RED}${BOLD}  ⚠️  WARNING: ALL DATA ON ${USB} WILL BE DESTROYED!${RESET}"
echo ""
read -p "  Type 'YES' to continue: " confirm
if [[ "$confirm" != "YES" ]]; then
    echo "  Aborted."
    exit 0
fi

# Unmount any mounted partitions
echo ""
echo -e "${PINK}  → Unmounting partitions...${RESET}"
umount "${USB}"* 2>/dev/null || true

# Write ISO
echo -e "${PINK}  → Writing ISO to USB (this may take a while)...${RESET}"
dd if="$ISO" of="$USB" bs=4M status=progress oflag=sync conv=fsync

# Sync
echo -e "${PINK}  → Syncing...${RESET}"
sync

echo ""
echo -e "${PINK}${BOLD}  ✨ Done! USB drive is ready.${RESET}"
echo ""
echo "  Boot instructions:"
echo "  1. Insert the USB drive"
echo "  2. Enter BIOS/UEFI boot menu (usually F12, F9, or Esc)"
echo "  3. Select the USB drive (UEFI mode)"
echo "  4. Enjoy HML Reimagined! ✨"
