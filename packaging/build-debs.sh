#!/usr/bin/env bash
#═══════════════════════════════════════════════════════════════════
# HML Reimagined — Debian Package Builder
# Builds .deb packages for all HML components
#═══════════════════════════════════════════════════════════════════
set -euo pipefail

PINK='\033[38;5;205m'
RESET='\033[0m'
log() { echo -e "${PINK}✨ $1${RESET}"; }

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BUILD_DIR="${PROJECT_ROOT}/output/debs"
VERSION="1.0"

mkdir -p "${BUILD_DIR}"

# ── Build theme package ──────────────────────────────────────────
build_theme_package() {
    log "Building hml-reimagined-theme package..."
    local PKG_DIR="${BUILD_DIR}/hml-reimagined-theme_${VERSION}_all"
    rm -rf "${PKG_DIR}"
    mkdir -p "${PKG_DIR}/DEBIAN"
    
    cat > "${PKG_DIR}/DEBIAN/control" << EOF
Package: hml-reimagined-theme
Version: ${VERSION}
Architecture: all
Maintainer: HML Reimagined Team <hml@reimagined.dev>
Depends: breeze, plasma-workspace
Description: HML Reimagined desktop theme
 Complete KDE Plasma, GTK, icon, cursor, SDDM, GRUB, and Plymouth theme.
EOF
    
    cat > "${PKG_DIR}/DEBIAN/postinst" << 'POSTINST'
#!/bin/sh
set -e
# Update icon cache
gtk-update-icon-cache /usr/share/icons/hml-icons 2>/dev/null || true
# Set Plymouth theme
update-alternatives --install /usr/share/plymouth/themes/default.plymouth \
    default.plymouth \
    /usr/share/plymouth/themes/hml-reimagined/hml-reimagined.plymouth 200 2>/dev/null || true
update-initramfs -u 2>/dev/null || true
# Update GRUB
update-grub 2>/dev/null || true
POSTINST
    chmod 755 "${PKG_DIR}/DEBIAN/postinst"
    
    # KDE Plasma theme
    mkdir -p "${PKG_DIR}/usr/share/plasma/look-and-feel/"
    cp -r "${PROJECT_ROOT}/themes/kde-plasma/look-and-feel/hml.reimagined" \
        "${PKG_DIR}/usr/share/plasma/look-and-feel/"
    
    mkdir -p "${PKG_DIR}/usr/share/plasma/desktoptheme/"
    cp -r "${PROJECT_ROOT}/themes/kde-plasma/plasma-theme/hml" \
        "${PKG_DIR}/usr/share/plasma/desktoptheme/"
    
    # Color schemes
    mkdir -p "${PKG_DIR}/usr/share/color-schemes/"
    cp "${PROJECT_ROOT}/themes/kde-plasma/color-schemes/"*.colors \
        "${PKG_DIR}/usr/share/color-schemes/"
    
    # GTK themes
    mkdir -p "${PKG_DIR}/usr/share/themes/HML-Reimagined/"
    cp -r "${PROJECT_ROOT}/themes/gtk/"* "${PKG_DIR}/usr/share/themes/HML-Reimagined/"
    
    # Icons
    mkdir -p "${PKG_DIR}/usr/share/icons/"
    cp -r "${PROJECT_ROOT}/themes/icons/hml-icons" "${PKG_DIR}/usr/share/icons/"
    
    # SDDM theme
    mkdir -p "${PKG_DIR}/usr/share/sddm/themes/hml-reimagined/"
    cp -r "${PROJECT_ROOT}/config/sddm/hml-theme/"* \
        "${PKG_DIR}/usr/share/sddm/themes/hml-reimagined/"
    
    # SDDM config
    mkdir -p "${PKG_DIR}/etc/sddm.conf.d/"
    cat > "${PKG_DIR}/etc/sddm.conf.d/hml-theme.conf" << 'SDDMCFG'
[Theme]
Current=hml-reimagined
SDDMCFG
    
    # Plymouth theme
    mkdir -p "${PKG_DIR}/usr/share/plymouth/themes/hml-reimagined/"
    cp -r "${PROJECT_ROOT}/config/plymouth/hml-theme/"* \
        "${PKG_DIR}/usr/share/plymouth/themes/hml-reimagined/"
    
    # GRUB theme
    mkdir -p "${PKG_DIR}/boot/grub/themes/hml/"
    cp -r "${PROJECT_ROOT}/config/grub/"* "${PKG_DIR}/boot/grub/themes/hml/"
    mkdir -p "${PKG_DIR}/etc/default/grub.d/"
    cat > "${PKG_DIR}/etc/default/grub.d/hml-branding.cfg" << 'GRUBCFG'
GRUB_DISTRIBUTOR="HML Reimagined"
GRUB_THEME="/boot/grub/themes/hml/theme.txt"
GRUB_GFXMODE="auto"
GRUB_TERMINAL_OUTPUT="gfxterm"
GRUBCFG
    
    # Build
    dpkg-deb --build "${PKG_DIR}"
    log "Theme package built: ${PKG_DIR}.deb"
}

# ── Build sounds package ─────────────────────────────────────────
build_sounds_package() {
    log "Building hml-reimagined-sounds package..."
    local PKG_DIR="${BUILD_DIR}/hml-reimagined-sounds_${VERSION}_all"
    rm -rf "${PKG_DIR}"
    mkdir -p "${PKG_DIR}/DEBIAN"
    
    cat > "${PKG_DIR}/DEBIAN/control" << EOF
Package: hml-reimagined-sounds
Version: ${VERSION}
Architecture: all
Maintainer: HML Reimagined Team <hml@reimagined.dev>
Description: HML Reimagined sound theme
EOF
    
    mkdir -p "${PKG_DIR}/usr/share/sounds/hml-reimagined/"
    cp -r "${PROJECT_ROOT}/sounds/"* "${PKG_DIR}/usr/share/sounds/hml-reimagined/"
    
    dpkg-deb --build "${PKG_DIR}"
    log "Sounds package built: ${PKG_DIR}.deb"
}

# ── Build wallpapers package ─────────────────────────────────────
build_wallpapers_package() {
    log "Building hml-reimagined-wallpapers package..."
    local PKG_DIR="${BUILD_DIR}/hml-reimagined-wallpapers_${VERSION}_all"
    rm -rf "${PKG_DIR}"
    mkdir -p "${PKG_DIR}/DEBIAN"
    
    cat > "${PKG_DIR}/DEBIAN/control" << EOF
Package: hml-reimagined-wallpapers
Version: ${VERSION}
Architecture: all
Maintainer: HML Reimagined Team <hml@reimagined.dev>
Description: HML Reimagined wallpaper collection
EOF
    
    mkdir -p "${PKG_DIR}/usr/share/wallpapers/HML-Reimagined/contents/images/"
    cp -r "${PROJECT_ROOT}/wallpapers/"* \
        "${PKG_DIR}/usr/share/wallpapers/HML-Reimagined/contents/images/"
    
    dpkg-deb --build "${PKG_DIR}"
    log "Wallpapers package built: ${PKG_DIR}.deb"
}

# ── Build Control Center package ─────────────────────────────────
build_control_center_package() {
    log "Building hml-reimagined-control-center package..."
    local PKG_DIR="${BUILD_DIR}/hml-reimagined-control-center_${VERSION}_all"
    rm -rf "${PKG_DIR}"
    mkdir -p "${PKG_DIR}/DEBIAN"
    
    cat > "${PKG_DIR}/DEBIAN/control" << EOF
Package: hml-reimagined-control-center
Version: ${VERSION}
Architecture: all
Maintainer: HML Reimagined Team <hml@reimagined.dev>
Depends: python3, python3-pyqt6
Description: HML Control Center — theme and customization manager
EOF
    
    mkdir -p "${PKG_DIR}/opt/hml-control-center/"
    cp -r "${PROJECT_ROOT}/apps/hml-control-center/"* \
        "${PKG_DIR}/opt/hml-control-center/"
    chmod +x "${PKG_DIR}/opt/hml-control-center/hml-control-center.py"
    
    mkdir -p "${PKG_DIR}/usr/share/applications/"
    cat > "${PKG_DIR}/usr/share/applications/hml-control-center.desktop" << 'DESKTOP'
[Desktop Entry]
Type=Application
Name=HML Control Center
GenericName=Theme Manager
Comment=Customize your HML Reimagined experience
Exec=/opt/hml-control-center/hml-control-center.py
Icon=preferences-desktop-theme
Terminal=false
Categories=Settings;DesktopSettings;
DESKTOP
    
    mkdir -p "${PKG_DIR}/usr/local/bin/"
    ln -sf /opt/hml-control-center/hml-control-center.py \
        "${PKG_DIR}/usr/local/bin/hml-control-center"
    
    dpkg-deb --build "${PKG_DIR}"
    log "Control Center package built: ${PKG_DIR}.deb"
}

# ── Main ──────────────────────────────────────────────────────────
log "Building HML Reimagined Debian packages..."
echo ""

build_theme_package
build_sounds_package
build_wallpapers_package
build_control_center_package

echo ""
log "All packages built in: ${BUILD_DIR}"
ls -la "${BUILD_DIR}/"*.deb 2>/dev/null || true
