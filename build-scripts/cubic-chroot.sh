#!/usr/bin/env bash
#═══════════════════════════════════════════════════════════════════
# HML Reimagined — Chroot Customization Script
# Run this inside the chroot environment (Cubic or build-iso.sh)
#═══════════════════════════════════════════════════════════════════
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive
PINK='\033[38;5;205m'
RESET='\033[0m'
BOLD='\033[1m'

log() { echo -e "${PINK}✨ ${BOLD}$1${RESET}"; }

# ── 1. Update Base System ─────────────────────────────────────────
log "Updating base system..."
apt-get update
apt-get dist-upgrade -y

# ── 2. Install Core Packages ─────────────────────────────────────
log "Installing core packages..."

# Audio stack
apt-get install -y \
    pipewire pipewire-pulse pipewire-alsa wireplumber \
    pipewire-audio-client-libraries

# Graphics & hardware support
apt-get install -y \
    mesa-utils vulkan-tools \
    linux-firmware \
    intel-microcode amd64-microcode \
    firmware-sof-signed \
    va-driver-all \
    xserver-xorg-input-all \
    libinput-tools \
    power-profiles-daemon thermald \
    fwupd \
    bolt  # Thunderbolt support

# NVIDIA helper (ubuntu-drivers will detect at runtime)
apt-get install -y ubuntu-drivers-common

# Flatpak support
apt-get install -y flatpak plasma-discover-backend-flatpak
flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo 2>/dev/null || true

# ── 3. Install Desktop Applications ──────────────────────────────
log "Installing applications..."

apt-get install -y \
    firefox \
    vlc \
    libreoffice libreoffice-kde libreoffice-style-breeze \
    gimp \
    krita \
    obs-studio \
    kdenlive \
    kde-connect \
    ksystemlog plasma-systemmonitor \
    spectacle \
    ark \
    filelight \
    kcalc \
    kbackup \
    plasma-discover \
    konsole yakuake \
    kate \
    gwenview \
    okular \
    elisa \
    partitionmanager \
    neofetch \
    git curl wget htop \
    zsh fonts-firacode fonts-inter \
    plymouth-themes \
    python3-pyqt6 python3-yaml

# Steam (add i386 arch for Steam)
dpkg --add-architecture i386
apt-get update
apt-get install -y steam-installer 2>/dev/null || log "Steam will be available via Flatpak"

# ── 4. Install Calamares Installer ───────────────────────────────
log "Installing Calamares installer..."
apt-get install -y \
    calamares calamares-settings-ubuntu \
    qml6-module-qtquick-controls \
    qml6-module-qtquick-layouts 2>/dev/null || \
    apt-get install -y calamares 2>/dev/null || \
    log "Calamares may need manual setup"

# ── 5. Install Theme Assets ──────────────────────────────────────
log "Installing HML theme assets..."

# KDE Plasma global theme
if [[ -d /tmp/hml-themes/kde-plasma/look-and-feel/hml.reimagined ]]; then
    mkdir -p /usr/share/plasma/look-and-feel/
    cp -r /tmp/hml-themes/kde-plasma/look-and-feel/hml.reimagined \
        /usr/share/plasma/look-and-feel/
fi

# KDE Plasma desktop theme
if [[ -d /tmp/hml-themes/kde-plasma/plasma-theme/hml ]]; then
    mkdir -p /usr/share/plasma/desktoptheme/
    cp -r /tmp/hml-themes/kde-plasma/plasma-theme/hml \
        /usr/share/plasma/desktoptheme/
fi

# Color schemes
if [[ -d /tmp/hml-themes/kde-plasma/color-schemes ]]; then
    mkdir -p /usr/share/color-schemes/
    cp /tmp/hml-themes/kde-plasma/color-schemes/*.colors \
        /usr/share/color-schemes/ 2>/dev/null || true
fi

# GTK themes
if [[ -d /tmp/hml-themes/gtk ]]; then
    mkdir -p /usr/share/themes/HML-Reimagined/
    cp -r /tmp/hml-themes/gtk/* /usr/share/themes/HML-Reimagined/
fi

# Icon theme
if [[ -d /tmp/hml-themes/icons/hml-icons ]]; then
    mkdir -p /usr/share/icons/
    cp -r /tmp/hml-themes/icons/hml-icons /usr/share/icons/
    gtk-update-icon-cache /usr/share/icons/hml-icons 2>/dev/null || true
fi

# Cursor theme
if [[ -d /tmp/hml-themes/cursors/hml-cursors ]]; then
    mkdir -p /usr/share/icons/hml-cursors/
    cp -r /tmp/hml-themes/cursors/hml-cursors/* /usr/share/icons/hml-cursors/
fi

# ── 6. Install Wallpapers ────────────────────────────────────────
log "Installing wallpapers..."
if [[ -d /tmp/hml-wallpapers ]]; then
    mkdir -p /usr/share/wallpapers/HML-Reimagined/contents/images/
    cp -r /tmp/hml-wallpapers/* /usr/share/wallpapers/HML-Reimagined/contents/images/ 2>/dev/null || true
    
    # Create wallpaper metadata
    cat > /usr/share/wallpapers/HML-Reimagined/metadata.json << 'WALLMETA'
{
    "KPlugin": {
        "Authors": [{ "Name": "HML Reimagined Team" }],
        "Id": "HML-Reimagined",
        "License": "CC-BY-SA-4.0",
        "Name": "HML Reimagined"
    }
}
WALLMETA
fi

# ── 7. Install Sound Theme ───────────────────────────────────────
log "Installing sound theme..."
if [[ -d /tmp/hml-sounds ]]; then
    mkdir -p /usr/share/sounds/hml-reimagined/stereo/
    cp /tmp/hml-sounds/**/*.oga /usr/share/sounds/hml-reimagined/stereo/ 2>/dev/null || true
    cp /tmp/hml-sounds/**/*.ogg /usr/share/sounds/hml-reimagined/stereo/ 2>/dev/null || true
    
    # Sound theme index
    cat > /usr/share/sounds/hml-reimagined/index.theme << 'SOUNDTHEME'
[Sound Theme]
Name=HML Reimagined
Comment=Sound theme for HML Reimagined Linux
Inherits=freedesktop
Directories=stereo

[stereo]
OutputProfile=stereo
SOUNDTHEME
fi

# ── 8. Install Plymouth Theme ────────────────────────────────────
log "Installing Plymouth boot splash..."
if [[ -d /tmp/hml-config/plymouth/hml-theme ]]; then
    mkdir -p /usr/share/plymouth/themes/hml-reimagined/
    cp -r /tmp/hml-config/plymouth/hml-theme/* \
        /usr/share/plymouth/themes/hml-reimagined/
    
    # Set as default plymouth theme
    update-alternatives --install /usr/share/plymouth/themes/default.plymouth \
        default.plymouth \
        /usr/share/plymouth/themes/hml-reimagined/hml-reimagined.plymouth 200
    update-alternatives --set default.plymouth \
        /usr/share/plymouth/themes/hml-reimagined/hml-reimagined.plymouth 2>/dev/null || true
    
    update-initramfs -u 2>/dev/null || true
fi

# ── 9. Install SDDM Theme ────────────────────────────────────────
log "Installing SDDM login theme..."
if [[ -d /tmp/hml-config/sddm/hml-theme ]]; then
    mkdir -p /usr/share/sddm/themes/hml-reimagined/
    cp -r /tmp/hml-config/sddm/hml-theme/* \
        /usr/share/sddm/themes/hml-reimagined/
fi

# Configure SDDM to use HML theme
mkdir -p /etc/sddm.conf.d/
cat > /etc/sddm.conf.d/hml-theme.conf << 'SDDMCONF'
[Theme]
Current=hml-reimagined

[General]
InputMethod=

[Users]
MaximumUid=60000
MinimumUid=1000
SDDMCONF

# ── 10. Install GRUB Theme ───────────────────────────────────────
log "Installing GRUB theme..."
if [[ -d /tmp/hml-config/grub ]]; then
    mkdir -p /boot/grub/themes/hml/
    cp -r /tmp/hml-config/grub/* /boot/grub/themes/hml/
fi

# Update GRUB defaults
cat > /etc/default/grub.d/hml-branding.cfg << 'GRUBCFG'
GRUB_DISTRIBUTOR="HML Reimagined"
GRUB_THEME="/boot/grub/themes/hml/theme.txt"
GRUB_GFXMODE="auto"
GRUB_TERMINAL_OUTPUT="gfxterm"
GRUB_TIMEOUT=10
GRUBCFG

# ── 11. Install Calamares Branding ───────────────────────────────
log "Configuring Calamares installer..."
if [[ -d /tmp/hml-config/calamares ]]; then
    mkdir -p /etc/calamares/branding/hml/
    cp -r /tmp/hml-config/calamares/branding/hml/* \
        /etc/calamares/branding/hml/ 2>/dev/null || true
    
    if [[ -d /tmp/hml-config/calamares/modules ]]; then
        cp /tmp/hml-config/calamares/modules/*.conf \
            /etc/calamares/modules/ 2>/dev/null || true
    fi
fi

# ── 12. Install HML Control Center ───────────────────────────────
log "Installing HML Control Center..."
if [[ -d /tmp/hml-apps/hml-control-center ]]; then
    mkdir -p /opt/hml-control-center/
    cp -r /tmp/hml-apps/hml-control-center/* /opt/hml-control-center/
    chmod +x /opt/hml-control-center/hml-control-center.py 2>/dev/null || true
    
    # Desktop entry
    cat > /usr/share/applications/hml-control-center.desktop << 'DESKTOP'
[Desktop Entry]
Type=Application
Name=HML Control Center
GenericName=Theme Manager
Comment=Customize your HML Reimagined experience
Exec=/opt/hml-control-center/hml-control-center.py
Icon=hml-control-center
Terminal=false
Categories=Settings;DesktopSettings;
Keywords=theme;hml;hannah;montana;customize;
DESKTOP
fi

# ── 13. Configure Skeleton (Default User Settings) ───────────────
log "Setting up default user configuration..."

SKEL="/etc/skel"
mkdir -p "${SKEL}/.config" "${SKEL}/.local/share"

# Copy skeleton files
if [[ -d /tmp/hml-config/skel ]]; then
    cp -r /tmp/hml-config/skel/. "${SKEL}/"
fi

# KDE default settings - global theme
mkdir -p "${SKEL}/.config"
cat > "${SKEL}/.config/kdeglobals" << 'KDEGLOBALS'
[General]
ColorScheme=HMLReimagined
Name=HML Reimagined
widgetStyle=Breeze

[Icons]
Theme=hml-icons

[KDE]
LookAndFeelPackage=hml.reimagined
SingleClick=false
AnimationDurationFactor=0.5
KDEGLOBALS

cat > "${SKEL}/.config/kwinrc" << 'KWINRC'
[Compositing]
Backend=OpenGL
GLCore=true
AnimationSpeed=3
Enabled=true

[Effect-Glide]
Duration=200
InDistance=30

[Plugins]
blurEnabled=true
contrastEnabled=true
glideEnabled=true
slideEnabled=true
wobblywindowsEnabled=false

[org.kde.kdecoration2]
library=org.kde.breeze
theme=Breeze
ButtonsOnLeft=XIA
ButtonsOnRight=
KWINRC

cat > "${SKEL}/.config/plasmarc" << 'PLASMARC'
[Theme]
name=hml

[Wallpapers]
usersWallpapers=
PLASMARC

# Konsole (terminal) profile
mkdir -p "${SKEL}/.local/share/konsole"
cat > "${SKEL}/.local/share/konsole/HML.profile" << 'KONSOLEPROFILE'
[Appearance]
AntiAliasCursorCharacter=true
BoldIntense=true
ColorScheme=HML-Reimagined
DimmValue=38
Font=FiraCode Nerd Font,11,-1,5,50,0,0,0,0,0,Regular
UseFontLineChararacters=false

[General]
Command=/bin/zsh
Name=HML Reimagined
Parent=FALLBACK/
TerminalCenter=true
TerminalColumns=120
TerminalRows=36

[Interaction Options]
AutoCopySelectedText=true
TrimLeadingSpacesInSelectedText=true
TrimTrailingSpacesInSelectedText=true

[Scrolling]
HistoryMode=2
ScrollBarPosition=2
KONSOLEPROFILE

# Konsole color scheme
cat > "${SKEL}/.local/share/konsole/HML-Reimagined.colorscheme" << 'KONSOLECOLOR'
[Background]
Color=25,10,30

[BackgroundFaint]
Color=25,10,30

[BackgroundIntense]
Color=35,15,45

[Color0]
Color=30,15,35

[Color0Faint]
Color=30,15,35

[Color0Intense]
Color=60,30,70

[Color1]
Color=255,64,129

[Color1Faint]
Color=200,50,100

[Color1Intense]
Color=255,105,160

[Color2]
Color=105,240,174

[Color2Faint]
Color=80,200,140

[Color2Intense]
Color=130,255,200

[Color3]
Color=255,213,79

[Color3Faint]
Color=200,170,60

[Color3Intense]
Color=255,230,120

[Color4]
Color=130,100,255

[Color4Faint]
Color=100,80,200

[Color4Intense]
Color=160,130,255

[Color5]
Color=224,64,251

[Color5Faint]
Color=180,50,200

[Color5Intense]
Color=240,100,255

[Color6]
Color=128,222,234

[Color6Faint]
Color=100,180,190

[Color6Intense]
Color=160,240,250

[Color7]
Color=224,204,230

[Color7Faint]
Color=180,160,185

[Color7Intense]
Color=255,240,255

[Foreground]
Color=240,220,245

[ForegroundFaint]
Color=200,180,210

[ForegroundIntense]
Color=255,240,255

[General]
Anchor=0.5,0.5
Blur=true
ColorRandomization=false
Description=HML Reimagined
FillStyle=Tile
Opacity=0.92
Wallpaper=
WallpaperFlipType=NoFlip
WallpaperOpacity=1
KONSOLECOLOR

# Default Konsole settings
cat > "${SKEL}/.config/konsolerc" << 'KONSOLERC'
[Desktop Entry]
DefaultProfile=HML.profile

[MainWindow]
MenuBar=Disabled
ToolBarsMovable=Disabled
KONSOLERC

# ── 14. Firefox Theme Extension ──────────────────────────────────
log "Setting up Firefox customization..."
mkdir -p "${SKEL}/.mozilla/firefox/hml.default/chrome"

cat > "${SKEL}/.mozilla/firefox/hml.default/chrome/userChrome.css" << 'FIREFOXCSS'
/* HML Reimagined Firefox Theme */
@namespace url("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul");

:root {
    --hml-pink: #FF1493;
    --hml-purple: #9C27B0;
    --hml-magenta: #E040FB;
    --hml-dark: #1A0A1E;
    --hml-darker: #0D0510;
    --hml-silver: #E0CCE6;
    --hml-accent-glow: 0 0 10px rgba(255, 20, 147, 0.3);
}

/* Tab bar */
#TabsToolbar {
    background: linear-gradient(180deg, var(--hml-dark) 0%, var(--hml-darker) 100%) !important;
}

.tab-background[selected="true"] {
    background: linear-gradient(180deg, var(--hml-purple) 0%, var(--hml-pink) 100%) !important;
    border: none !important;
    border-radius: 8px 8px 0 0 !important;
}

/* Navigation bar */
#nav-bar {
    background: var(--hml-darker) !important;
    border-bottom: 1px solid var(--hml-purple) !important;
}

/* URL bar */
#urlbar-background {
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid var(--hml-purple) !important;
    border-radius: 20px !important;
}

#urlbar:hover #urlbar-background {
    border-color: var(--hml-pink) !important;
    box-shadow: var(--hml-accent-glow) !important;
}

/* Bookmarks bar */
#PersonalToolbar {
    background: var(--hml-darker) !important;
    border-bottom: 1px solid rgba(156, 39, 176, 0.3) !important;
}
FIREFOXCSS

# ── 15. ZSH Configuration ────────────────────────────────────────
log "Setting up ZSH..."
cat > "${SKEL}/.zshrc" << 'ZSHRC'
# ✨ HML Reimagined — ZSH Configuration ✨

# Oh My Zsh (installed separately if desired)
export ZSH="$HOME/.oh-my-zsh"
if [[ -d "$ZSH" ]]; then
    ZSH_THEME="agnoster"
    plugins=(git sudo zsh-autosuggestions zsh-syntax-highlighting)
    source "$ZSH/oh-my-zsh.sh"
fi

# HML custom prompt (fallback if no Oh My Zsh)
if [[ ! -d "$ZSH" ]]; then
    autoload -Uz compinit && compinit
    autoload -Uz vcs_info
    precmd() { vcs_info }
    zstyle ':vcs_info:git:*' formats ' %F{magenta}(%b)%f'
    setopt PROMPT_SUBST
    PROMPT='%F{205}✨%f %F{141}%n%f%F{white}@%f%F{205}%m%f %F{141}%~%f${vcs_info_msg_0_} %F{205}❯%f '
    RPROMPT='%F{60}%T%f'
fi

# Aliases
alias ll='ls -lah --color=auto'
alias la='ls -A --color=auto'
alias cls='clear'
alias update='sudo apt update && sudo apt upgrade -y'
alias hml='neofetch'
alias sparkle='echo "✨✨✨"'

# Welcome screen
if [[ -o interactive ]]; then
    echo ""
    echo -e "\033[38;5;205m  ╔═══════════════════════════════════════════╗\033[0m"
    echo -e "\033[38;5;205m  ║\033[0m   \033[1;38;5;205m✨ HML Reimagined ✨\033[0m                    \033[38;5;205m║\033[0m"
    echo -e "\033[38;5;205m  ║\033[0m   \033[38;5;141mYou got the best of both worlds!\033[0m       \033[38;5;205m║\033[0m"
    echo -e "\033[38;5;205m  ╚═══════════════════════════════════════════╝\033[0m"
    echo ""
    neofetch 2>/dev/null || true
fi

# PATH
export PATH="$HOME/.local/bin:$PATH"
ZSHRC

# ── 16. Neofetch config ──────────────────────────────────────────
mkdir -p "${SKEL}/.config/neofetch"
cat > "${SKEL}/.config/neofetch/config.conf" << 'NEOFETCH'
print_info() {
    info title
    info underline
    info "✨ OS" distro
    info "🎀 Host" model
    info "💜 Kernel" kernel
    info "⏰ Uptime" uptime
    info "📦 Packages" packages
    info "🐚 Shell" shell
    info "🖥️ Resolution" resolution
    info "🎨 DE" de
    info "🪟 WM" wm
    info "🎭 Theme" theme
    info "💎 Icons" icons
    info "🖥️ Terminal" term
    info "🔤 Font" term_font
    info "💻 CPU" cpu
    info "🎮 GPU" gpu
    info "💾 Memory" memory
    info cols
}

ascii_distro="auto"
bold="on"
separator=" →"
color_blocks="on"
block_range=(0 15)
NEOFETCH

# ── 17. System-wide distro branding ─────────────────────────────
log "Applying system branding..."

# LSB release
cat > /etc/lsb-release << 'LSB'
DISTRIB_ID=HMLReimagined
DISTRIB_RELEASE=1.0
DISTRIB_CODENAME=superstar
DISTRIB_DESCRIPTION="HML Reimagined 1.0 Superstar"
LSB

cat > /etc/os-release << 'OSRELEASE'
PRETTY_NAME="HML Reimagined 1.0 (Superstar)"
NAME="HML Reimagined"
VERSION_ID="1.0"
VERSION="1.0 (Superstar)"
VERSION_CODENAME=superstar
ID=hml-reimagined
ID_LIKE=ubuntu debian
HOME_URL="https://github.com/hml-reimagined"
SUPPORT_URL="https://github.com/hml-reimagined/issues"
BUG_REPORT_URL="https://github.com/hml-reimagined/issues"
PRIVACY_POLICY_URL="https://github.com/hml-reimagined"
UBUNTU_CODENAME=noble
OSRELEASE

# Issue banner
cat > /etc/issue << 'ISSUE'

  ✨ HML Reimagined 1.0 "Superstar" ✨
  You got the best of both worlds!
  
  \n \l

ISSUE

cat > /etc/issue.net << 'ISSUENET'
HML Reimagined 1.0 "Superstar"
ISSUENET

# ── 18. Performance Tweaks ───────────────────────────────────────
log "Applying performance tweaks..."

# Reduce swappiness for better responsiveness
cat > /etc/sysctl.d/99-hml-performance.conf << 'SYSCTL'
# HML Reimagined — Performance optimizations
vm.swappiness=10
vm.vfs_cache_pressure=50
vm.dirty_ratio=10
vm.dirty_background_ratio=5
net.core.default_qdisc=fq
net.ipv4.tcp_congestion_control=bbr
SYSCTL

# Preload for faster app startup
apt-get install -y preload 2>/dev/null || true

# ── 19. UEFI & Hardware Support ──────────────────────────────────
log "Ensuring UEFI and hardware support..."
apt-get install -y \
    grub-efi-amd64-signed shim-signed \
    efibootmgr efivar \
    os-prober \
    nvme-cli \
    tlp tlp-rdw \
    acpi acpid \
    bluez bluez-tools

# Enable TLP for laptop power management
systemctl enable tlp 2>/dev/null || true

# ── 20. Final Cleanup ────────────────────────────────────────────
log "Final cleanup..."
apt-get autoremove -y
apt-get clean
rm -rf /tmp/* /var/tmp/*

log "Chroot customization complete! ✨"
