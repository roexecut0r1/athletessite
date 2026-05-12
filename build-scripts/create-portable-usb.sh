#!/usr/bin/env bash
#═══════════════════════════════════════════════════════════════════
# HML Reimagined — Portable USB Creator with Persistence
# Creates a bootable USB with persistent storage
# so changes survive reboots (true portable OS)
#═══════════════════════════════════════════════════════════════════
set -euo pipefail

PINK='\033[38;5;205m'
RED='\033[31m'
RESET='\033[0m'
BOLD='\033[1m'
log() { echo -e "${PINK}✨ $1${RESET}"; }

ISO="${1:-}"
USB="${2:-}"
PERSIST_SIZE="${3:-8G}"  # Size of persistent partition

if [[ -z "$ISO" || -z "$USB" ]]; then
    echo -e "${PINK}✨ HML Reimagined — Portable USB Creator${RESET}"
    echo ""
    echo "Usage: sudo $0 <iso-file> <usb-device> [persistence-size]"
    echo "  Example: sudo $0 output/HML-Reimagined-1.0-amd64.iso /dev/sdb 8G"
    echo ""
    echo "This creates a bootable USB with persistent storage."
    echo "Your files, settings, and installed apps survive reboots."
    exit 1
fi

[[ $EUID -eq 0 ]] || { echo -e "${RED}❌ Must run as root${RESET}"; exit 1; }
[[ -f "$ISO" ]] || { echo -e "${RED}❌ ISO not found: $ISO${RESET}"; exit 1; }
[[ -b "$USB" ]] || { echo -e "${RED}❌ Device not found: $USB${RESET}"; exit 1; }

# Safety
if [[ "$USB" == "/dev/sda" || "$USB" == "/dev/nvme0n1" ]]; then
    echo -e "${RED}❌ SAFETY: Refusing to write to ${USB}${RESET}"
    exit 1
fi

echo -e "${PINK}${BOLD}"
echo "  ╔═══════════════════════════════════════════════════════╗"
echo "  ║     ✨ HML Reimagined — Portable USB Creator ✨     ║"
echo "  ╚═══════════════════════════════════════════════════════╝"
echo -e "${RESET}"
echo ""
echo "  ISO:         $ISO"
echo "  Target:      $USB"
echo "  Persistence: $PERSIST_SIZE"
echo ""
echo -e "${RED}${BOLD}  ⚠️  WARNING: ALL DATA ON ${USB} WILL BE DESTROYED!${RESET}"
echo ""
read -p "  Type 'YES' to continue: " confirm
[[ "$confirm" == "YES" ]] || { echo "Aborted."; exit 0; }

# Unmount
log "Unmounting ${USB}..."
umount "${USB}"* 2>/dev/null || true

# Get ISO size
ISO_SIZE=$(stat -c%s "$ISO")
ISO_SIZE_MB=$((ISO_SIZE / 1024 / 1024))

log "Creating GPT partition table..."
parted -s "$USB" mklabel gpt

# Partition 1: EFI System Partition
log "Creating EFI partition..."
parted -s "$USB" mkpart EFI fat32 1MiB 512MiB
parted -s "$USB" set 1 esp on

# Partition 2: ISO data partition
ISO_END=$((512 + ISO_SIZE_MB + 100))  # Extra buffer
log "Creating ISO partition (${ISO_SIZE_MB}MB)..."
parted -s "$USB" mkpart ISO fat32 512MiB "${ISO_END}MiB"

# Partition 3: Persistent storage (casper-rw)
log "Creating persistence partition (${PERSIST_SIZE})..."
parted -s "$USB" mkpart persistence ext4 "${ISO_END}MiB" "100%"

# Wait for kernel to recognize partitions
sleep 2
partprobe "$USB"
sleep 2

# Determine partition names
if [[ "$USB" == *"nvme"* ]]; then
    P1="${USB}p1"
    P2="${USB}p2"
    P3="${USB}p3"
else
    P1="${USB}1"
    P2="${USB}2"
    P3="${USB}3"
fi

# Format partitions
log "Formatting EFI partition..."
mkfs.vfat -F 32 -n "EFI" "$P1"

log "Formatting ISO partition..."
mkfs.vfat -F 32 -n "HMLISO" "$P2"

log "Formatting persistence partition..."
mkfs.ext4 -L "casper-rw" -F "$P3"

# Mount and copy
MOUNT_EFI="/tmp/hml-efi"
MOUNT_ISO="/tmp/hml-iso"
MOUNT_PERSIST="/tmp/hml-persist"
MOUNT_SRC="/tmp/hml-src"

mkdir -p "$MOUNT_EFI" "$MOUNT_ISO" "$MOUNT_PERSIST" "$MOUNT_SRC"

# Mount ISO source
log "Mounting source ISO..."
mount -o loop "$ISO" "$MOUNT_SRC"

# Copy ISO contents to ISO partition
log "Copying ISO contents..."
mount "$P2" "$MOUNT_ISO"
rsync -a --info=progress2 "$MOUNT_SRC/" "$MOUNT_ISO/"

# Setup EFI partition
log "Setting up EFI boot..."
mount "$P1" "$MOUNT_EFI"
mkdir -p "$MOUNT_EFI/EFI/BOOT/"
if [[ -d "$MOUNT_SRC/EFI" ]]; then
    cp -r "$MOUNT_SRC/EFI/"* "$MOUNT_EFI/EFI/"
fi
# Ensure fallback boot
if [[ -f "$MOUNT_SRC/EFI/BOOT/BOOTX64.EFI" ]]; then
    cp "$MOUNT_SRC/EFI/BOOT/BOOTX64.EFI" "$MOUNT_EFI/EFI/BOOT/"
fi
if [[ -f "$MOUNT_SRC/EFI/BOOT/grubx64.efi" ]]; then
    cp "$MOUNT_SRC/EFI/BOOT/grubx64.efi" "$MOUNT_EFI/EFI/BOOT/"
fi

# Setup GRUB for persistence
log "Configuring GRUB for persistence..."
cat > "$MOUNT_ISO/boot/grub/grub.cfg" << 'GRUBCFG'
set timeout=10
set default=0
set gfxmode=auto
set gfxpayload=keep

insmod all_video
insmod gfxterm
insmod png

loadfont /boot/grub/themes/hml/font.pf2 2>/dev/null || loadfont unicode

set theme=/boot/grub/themes/hml/theme.txt
export theme

menuentry "✨ Start HML Reimagined (Persistent)" --class hml {
    set gfxpayload=keep
    linux /casper/vmlinuz boot=casper persistent quiet splash ---
    initrd /casper/initrd
}

menuentry "✨ Start HML Reimagined (Live - No Persistence)" --class hml {
    set gfxpayload=keep
    linux /casper/vmlinuz boot=casper quiet splash ---
    initrd /casper/initrd
}

menuentry "✨ Start HML Reimagined (Safe Graphics)" --class hml-safe {
    set gfxpayload=keep
    linux /casper/vmlinuz boot=casper persistent quiet splash nomodeset ---
    initrd /casper/initrd
}

menuentry "💾 Install HML Reimagined" --class hml-install {
    set gfxpayload=keep
    linux /casper/vmlinuz boot=casper only-ubiquity quiet splash ---
    initrd /casper/initrd
}
GRUBCFG

# Setup persistence partition
log "Setting up persistence..."
mount "$P3" "$MOUNT_PERSIST"
# The casper-rw label on the ext4 partition enables automatic persistence

# Cleanup
sync
umount "$MOUNT_SRC"
umount "$MOUNT_EFI"
umount "$MOUNT_ISO"
umount "$MOUNT_PERSIST"
rmdir "$MOUNT_SRC" "$MOUNT_EFI" "$MOUNT_ISO" "$MOUNT_PERSIST" 2>/dev/null || true

echo ""
log "Portable USB created successfully! ✨"
echo ""
echo "  Your HML Reimagined portable USB is ready!"
echo "  Changes and files will persist across reboots."
echo ""
echo "  Boot instructions:"
echo "  1. Insert the USB drive"
echo "  2. Enter BIOS/UEFI boot menu (F12, F9, or Esc)"
echo "  3. Select the USB drive (UEFI mode)"
echo "  4. Choose 'Start HML Reimagined (Persistent)'"
echo "  5. Enjoy your portable desktop! ✨"
