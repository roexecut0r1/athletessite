#!/usr/bin/env bash
#═══════════════════════════════════════════════════════════════════
# HML Reimagined — Automated ISO Build Script
# Builds a custom Kubuntu-based ISO with all HML theming applied
#═══════════════════════════════════════════════════════════════════
set -euo pipefail

# ── Configuration ─────────────────────────────────────────────────
DISTRO_NAME="HML-Reimagined"
DISTRO_VERSION="1.0"
DISTRO_CODENAME="Superstar"
BASE_ISO_URL="https://cdimage.ubuntu.com/kubuntu/releases/24.04.2/release/kubuntu-24.04.2-desktop-amd64.iso"
BASE_ISO="kubuntu-24.04.2-desktop-amd64.iso"

WORK_DIR="/tmp/hml-build"
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUTPUT_DIR="${PROJECT_ROOT}/output"
CHROOT_DIR="${WORK_DIR}/chroot"
ISO_DIR="${WORK_DIR}/iso"
OUTPUT_ISO="${OUTPUT_DIR}/${DISTRO_NAME}-${DISTRO_VERSION}-amd64.iso"

# Colors for output
PINK='\033[38;5;205m'
PURPLE='\033[38;5;141m'
RESET='\033[0m'
BOLD='\033[1m'

log() { echo -e "${PINK}✨ ${BOLD}$1${RESET}"; }
logp() { echo -e "${PURPLE}   → $1${RESET}"; }
err() { echo -e "\033[31m❌ ERROR: $1${RESET}" >&2; exit 1; }

# ── Preflight Checks ─────────────────────────────────────────────
check_requirements() {
    log "Checking requirements..."
    [[ $EUID -eq 0 ]] || err "This script must be run as root (sudo)"
    
    local deps=(xorriso squashfs-tools genisoimage wget rsync
                mksquashfs unsquashfs chroot debootstrap
                grub-efi-amd64-bin grub-efi-amd64-signed shim-signed)
    
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &>/dev/null && ! dpkg -l "$dep" &>/dev/null 2>&1; then
            logp "Installing missing dependency: $dep"
            apt-get install -y "$dep" 2>/dev/null || true
        fi
    done
    
    local required_space=30  # GB
    local available=$(df -BG "${WORK_DIR%/*}" 2>/dev/null | awk 'NR==2{print $4}' | tr -d 'G')
    if [[ "${available:-0}" -lt "$required_space" ]]; then
        err "Need at least ${required_space}GB free space. Available: ${available}GB"
    fi
    
    logp "All requirements satisfied"
}

# ── Download Base ISO ─────────────────────────────────────────────
download_base_iso() {
    log "Checking base ISO..."
    mkdir -p "${WORK_DIR}"
    
    if [[ -f "${WORK_DIR}/${BASE_ISO}" ]]; then
        logp "Base ISO already downloaded"
    else
        logp "Downloading Kubuntu 24.04.2 LTS..."
        wget -c "${BASE_ISO_URL}" -O "${WORK_DIR}/${BASE_ISO}" || \
            err "Failed to download base ISO. Place it manually at ${WORK_DIR}/${BASE_ISO}"
    fi
}

# ── Extract ISO ───────────────────────────────────────────────────
extract_iso() {
    log "Extracting base ISO..."
    
    # Clean previous builds
    rm -rf "${CHROOT_DIR}" "${ISO_DIR}"
    mkdir -p "${CHROOT_DIR}" "${ISO_DIR}"
    
    # Mount and copy ISO contents
    local mnt="${WORK_DIR}/mnt"
    mkdir -p "${mnt}"
    mount -o loop "${WORK_DIR}/${BASE_ISO}" "${mnt}"
    rsync -a "${mnt}/" "${ISO_DIR}/"
    
    # Extract squashfs filesystem
    unsquashfs -d "${CHROOT_DIR}" "${ISO_DIR}/casper/filesystem.squashfs"
    
    umount "${mnt}"
    rmdir "${mnt}"
    
    logp "ISO extracted successfully"
}

# ── Prepare Chroot ────────────────────────────────────────────────
prepare_chroot() {
    log "Preparing chroot environment..."
    
    # Mount essential filesystems
    mount --bind /dev "${CHROOT_DIR}/dev"
    mount --bind /dev/pts "${CHROOT_DIR}/dev/pts"
    mount -t proc proc "${CHROOT_DIR}/proc"
    mount -t sysfs sysfs "${CHROOT_DIR}/sys"
    
    # Copy DNS resolution
    cp /etc/resolv.conf "${CHROOT_DIR}/etc/resolv.conf"
    
    logp "Chroot environment ready"
}

# ── Apply Customizations Inside Chroot ────────────────────────────
customize_chroot() {
    log "Applying HML customizations inside chroot..."
    
    # Copy the chroot customization script
    cp "${PROJECT_ROOT}/build-scripts/cubic-chroot.sh" "${CHROOT_DIR}/tmp/customize.sh"
    chmod +x "${CHROOT_DIR}/tmp/customize.sh"
    
    # Copy theme assets into chroot
    rsync -a "${PROJECT_ROOT}/themes/" "${CHROOT_DIR}/tmp/hml-themes/"
    rsync -a "${PROJECT_ROOT}/sounds/" "${CHROOT_DIR}/tmp/hml-sounds/"
    rsync -a "${PROJECT_ROOT}/wallpapers/" "${CHROOT_DIR}/tmp/hml-wallpapers/"
    rsync -a "${PROJECT_ROOT}/config/" "${CHROOT_DIR}/tmp/hml-config/"
    rsync -a "${PROJECT_ROOT}/apps/" "${CHROOT_DIR}/tmp/hml-apps/"
    rsync -a "${PROJECT_ROOT}/branding/" "${CHROOT_DIR}/tmp/hml-branding/"
    
    # Run customization inside chroot
    chroot "${CHROOT_DIR}" /tmp/customize.sh
    
    # Clean up
    rm -rf "${CHROOT_DIR}/tmp/hml-"* "${CHROOT_DIR}/tmp/customize.sh"
    
    logp "Customizations applied"
}

# ── Clean Chroot ──────────────────────────────────────────────────
cleanup_chroot() {
    log "Cleaning chroot environment..."
    
    chroot "${CHROOT_DIR}" bash -c "
        apt-get autoremove -y
        apt-get clean
        rm -rf /tmp/* /var/tmp/*
        rm -f /etc/resolv.conf
        rm -f /var/lib/dbus/machine-id
        rm -f /sbin/initctl
        dpkg-divert --rename --remove /sbin/initctl
    "
    
    # Unmount chroot filesystems
    umount -l "${CHROOT_DIR}/sys" 2>/dev/null || true
    umount -l "${CHROOT_DIR}/proc" 2>/dev/null || true
    umount -l "${CHROOT_DIR}/dev/pts" 2>/dev/null || true
    umount -l "${CHROOT_DIR}/dev" 2>/dev/null || true
    
    logp "Chroot cleaned"
}

# ── Rebuild Squashfs ──────────────────────────────────────────────
rebuild_squashfs() {
    log "Rebuilding squashfs filesystem..."
    
    rm -f "${ISO_DIR}/casper/filesystem.squashfs"
    mksquashfs "${CHROOT_DIR}" "${ISO_DIR}/casper/filesystem.squashfs" \
        -comp xz -Xbcj x86 -b 1M -Xdict-size 100% \
        -no-recovery -noappend
    
    # Update filesystem size
    du -sx --block-size=1 "${CHROOT_DIR}" | cut -f1 > "${ISO_DIR}/casper/filesystem.size"
    
    # Generate manifest
    chroot "${CHROOT_DIR}" dpkg-query -W --showformat='${Package} ${Version}\n' \
        > "${ISO_DIR}/casper/filesystem.manifest" 2>/dev/null || true
    
    logp "Squashfs rebuilt ($(du -sh "${ISO_DIR}/casper/filesystem.squashfs" | cut -f1))"
}

# ── Apply Boot Branding ──────────────────────────────────────────
apply_boot_branding() {
    log "Applying boot branding..."
    
    # GRUB theme
    if [[ -d "${PROJECT_ROOT}/config/grub" ]]; then
        mkdir -p "${ISO_DIR}/boot/grub/themes/hml"
        rsync -a "${PROJECT_ROOT}/config/grub/" "${ISO_DIR}/boot/grub/themes/hml/"
    fi
    
    # Update GRUB config
    cat > "${ISO_DIR}/boot/grub/grub.cfg" << 'GRUBCFG'
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

menuentry "✨ Start HML Reimagined" --class hml --class ubuntu {
    set gfxpayload=keep
    linux /casper/vmlinuz boot=casper quiet splash --- 
    initrd /casper/initrd
}

menuentry "✨ Start HML Reimagined (Safe Graphics)" --class hml-safe {
    set gfxpayload=keep
    linux /casper/vmlinuz boot=casper quiet splash nomodeset ---
    initrd /casper/initrd
}

menuentry "💾 Install HML Reimagined" --class hml-install {
    set gfxpayload=keep
    linux /casper/vmlinuz boot=casper only-ubiquity quiet splash ---
    initrd /casper/initrd
}

menuentry "🔧 Check disc for defects" --class check {
    linux /casper/vmlinuz boot=casper integrity-check quiet splash ---
    initrd /casper/initrd
}

menuentry "🔌 Boot from first hard disk" --class hd {
    exit
}
GRUBCFG
    
    logp "Boot branding applied"
}

# ── Generate ISO ──────────────────────────────────────────────────
generate_iso() {
    log "Generating final ISO..."
    mkdir -p "${OUTPUT_DIR}"
    
    # Calculate MD5 sums
    cd "${ISO_DIR}"
    find . -type f -not -name 'md5sum.txt' -not -path './isolinux/*' \
        -exec md5sum {} \; > md5sum.txt
    
    # Build UEFI-bootable ISO
    xorriso -as mkisofs \
        -r -V "${DISTRO_NAME} ${DISTRO_VERSION}" \
        -o "${OUTPUT_ISO}" \
        -J -joliet-long \
        -partition_offset 16 \
        --grub2-mbr /usr/lib/grub/i386-pc/boot_hybrid.img \
        --mbr-force-bootable \
        -append_partition 2 0xef "${ISO_DIR}/boot/grub/efi.img" \
        -appended_part_as_gpt \
        -eltorito-catalog boot/grub/boot.cat \
        -eltorito-boot boot/grub/bios.img \
        -no-emul-boot -boot-load-size 4 -boot-info-table --grub2-boot-info \
        -eltorito-alt-boot \
        -e '--interval:appended_partition_2:all::' \
        -no-emul-boot \
        "${ISO_DIR}"
    
    local iso_size=$(du -sh "${OUTPUT_ISO}" | cut -f1)
    log "ISO generated successfully!"
    logp "Output: ${OUTPUT_ISO}"
    logp "Size: ${iso_size}"
    logp ""
    logp "Test with: qemu-system-x86_64 -enable-kvm -m 4G -bios /usr/share/OVMF/OVMF_CODE.fd -cdrom ${OUTPUT_ISO}"
}

# ── Main ──────────────────────────────────────────────────────────
main() {
    echo -e "${PINK}"
    echo "  ╔═══════════════════════════════════════════════════════╗"
    echo "  ║          ✨ HML Reimagined — ISO Builder ✨          ║"
    echo "  ║       Hannah Montana Linux for the Modern Era        ║"
    echo "  ╚═══════════════════════════════════════════════════════╝"
    echo -e "${RESET}"
    
    check_requirements
    download_base_iso
    extract_iso
    prepare_chroot
    customize_chroot
    cleanup_chroot
    rebuild_squashfs
    apply_boot_branding
    generate_iso
    
    echo -e "\n${PINK}${BOLD}  ✨ Build complete! You got the best of both worlds! ✨${RESET}\n"
}

main "$@"
