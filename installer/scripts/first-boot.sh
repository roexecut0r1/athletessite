#!/usr/bin/env bash
#═══════════════════════════════════════════════════════════════════
# HML Reimagined — First-Boot Setup Script
# Runs on first login to finalize user-specific configuration
#═══════════════════════════════════════════════════════════════════

MARKER="$HOME/.config/hml-first-boot-done"
if [[ -f "$MARKER" ]]; then
    exit 0
fi

# Welcome notification
notify-send "✨ Welcome to HML Reimagined!" \
    "Your superstar desktop is ready.\nOpen the HML Control Center to customize!" \
    --icon=preferences-desktop-theme \
    --urgency=normal \
    2>/dev/null || true

# Set Plasma global theme
if command -v plasma-apply-lookandfeel &>/dev/null; then
    plasma-apply-lookandfeel --apply hml.reimagined 2>/dev/null || true
fi

# Set SDDM theme (requires elevated privileges, may fail)
# This is already configured system-wide in /etc/sddm.conf.d/

# Configure Firefox homepage
FIREFOX_PROFILE=$(find "$HOME/.mozilla/firefox" -maxdepth 1 -name "*.default*" | head -1)
if [[ -n "$FIREFOX_PROFILE" ]]; then
    mkdir -p "$FIREFOX_PROFILE/chrome"
    # Copy userChrome.css if not already present
    if [[ ! -f "$FIREFOX_PROFILE/chrome/userChrome.css" ]]; then
        cp /etc/skel/.mozilla/firefox/hml.default/chrome/userChrome.css \
            "$FIREFOX_PROFILE/chrome/" 2>/dev/null || true
    fi
    
    # Set homepage
    cat > "$FIREFOX_PROFILE/user.js" << 'USERJS'
user_pref("browser.startup.homepage", "file:///usr/share/hml-reimagined/homepage.html");
user_pref("browser.startup.page", 1);
user_pref("toolkit.legacyUserProfileCustomizations.stylesheets", true);
USERJS
fi

# Install Oh My Zsh if not present
if [[ ! -d "$HOME/.oh-my-zsh" ]] && command -v zsh &>/dev/null; then
    sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended 2>/dev/null || true
    
    # Install plugins
    if [[ -d "$HOME/.oh-my-zsh" ]]; then
        git clone https://github.com/zsh-users/zsh-autosuggestions \
            "$HOME/.oh-my-zsh/custom/plugins/zsh-autosuggestions" 2>/dev/null || true
        git clone https://github.com/zsh-users/zsh-syntax-highlighting \
            "$HOME/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting" 2>/dev/null || true
    fi
fi

# Ensure default shell is zsh
if command -v zsh &>/dev/null; then
    if [[ "$SHELL" != "$(which zsh)" ]]; then
        chsh -s "$(which zsh)" 2>/dev/null || true
    fi
fi

# Mark first boot as done
mkdir -p "$(dirname "$MARKER")"
touch "$MARKER"
