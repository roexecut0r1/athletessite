#!/usr/bin/env bash
#═══════════════════════════════════════════════════════════════════
# HML Reimagined — ISO Testing Script
# Test the built ISO in QEMU with UEFI (OVMF)
#═══════════════════════════════════════════════════════════════════
set -euo pipefail

PINK='\033[38;5;205m'
RESET='\033[0m'
log() { echo -e "${PINK}✨ $1${RESET}"; }

ISO="${1:-}"
RAM="${2:-4G}"
CORES="${3:-2}"
DISK_SIZE="${4:-40G}"

if [[ -z "$ISO" ]]; then
    echo "Usage: $0 <iso-file> [ram] [cores] [disk-size]"
    echo "  Example: $0 output/HML-Reimagined-1.0-amd64.iso 4G 2 40G"
    exit 1
fi

if [[ ! -f "$ISO" ]]; then
    echo "❌ ISO not found: $ISO"
    exit 1
fi

# Check for OVMF (UEFI firmware)
OVMF_CODE=""
for path in \
    /usr/share/OVMF/OVMF_CODE.fd \
    /usr/share/OVMF/OVMF_CODE_4M.fd \
    /usr/share/edk2/ovmf/OVMF_CODE.fd \
    /usr/share/qemu/OVMF_CODE.fd; do
    if [[ -f "$path" ]]; then
        OVMF_CODE="$path"
        break
    fi
done

if [[ -z "$OVMF_CODE" ]]; then
    log "Installing OVMF for UEFI testing..."
    sudo apt-get install -y ovmf
    OVMF_CODE="/usr/share/OVMF/OVMF_CODE.fd"
fi

# Create UEFI variables copy
OVMF_VARS="/tmp/hml-test-OVMF_VARS.fd"
for path in \
    /usr/share/OVMF/OVMF_VARS.fd \
    /usr/share/OVMF/OVMF_VARS_4M.fd \
    /usr/share/edk2/ovmf/OVMF_VARS.fd; do
    if [[ -f "$path" ]]; then
        cp "$path" "$OVMF_VARS"
        break
    fi
done

# Create test disk
TEST_DISK="/tmp/hml-test-disk.qcow2"
if [[ ! -f "$TEST_DISK" ]]; then
    log "Creating test disk (${DISK_SIZE})..."
    qemu-img create -f qcow2 "$TEST_DISK" "$DISK_SIZE"
fi

log "Launching HML Reimagined in QEMU (UEFI mode)..."
echo ""
echo "  ISO:    $ISO"
echo "  RAM:    $RAM"
echo "  Cores:  $CORES"
echo "  Disk:   $DISK_SIZE"
echo "  UEFI:   $OVMF_CODE"
echo ""
echo "  Press Ctrl+Alt+G to release mouse"
echo "  Press Ctrl+Alt+F to toggle fullscreen"
echo ""

qemu-system-x86_64 \
    -enable-kvm \
    -m "$RAM" \
    -smp "$CORES" \
    -cpu host \
    -drive if=pflash,format=raw,readonly=on,file="$OVMF_CODE" \
    -drive if=pflash,format=raw,file="$OVMF_VARS" \
    -cdrom "$ISO" \
    -drive file="$TEST_DISK",format=qcow2,if=virtio \
    -boot d \
    -device virtio-vga-gl,xres=1920,yres=1080 \
    -display gtk,gl=on \
    -device virtio-net-pci,netdev=net0 \
    -netdev user,id=net0 \
    -usb \
    -device usb-tablet \
    -device intel-hda \
    -device hda-duplex \
    -name "HML Reimagined Test"
