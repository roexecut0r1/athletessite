#!/usr/bin/env bash
#═══════════════════════════════════════════════════════════════════
# HML Reimagined — Sound Asset Generator
# Generates system sounds using sox (Sound eXchange)
# Run: sudo apt install sox && bash generate-sounds.sh
#═══════════════════════════════════════════════════════════════════
set -euo pipefail

PINK='\033[38;5;205m'
RESET='\033[0m'
log() { echo -e "${PINK}✨ $1${RESET}"; }

SOUNDS_DIR="$(cd "$(dirname "$0")/.." && pwd)/sounds"

# Check for sox
if ! command -v sox &>/dev/null; then
    echo "sox is required: sudo apt install sox"
    exit 1
fi

log "Generating HML Reimagined sound theme..."

# ── Login chime — sparkly ascending arpeggio ─────────────────────
log "Creating login sound..."
sox -n "${SOUNDS_DIR}/ui/desktop-login.oga" \
    synth 0.15 sine 880 fade 0 0.15 0.05 : \
    synth 0.15 sine 1108 fade 0 0.15 0.05 : \
    synth 0.15 sine 1318 fade 0 0.15 0.05 : \
    synth 0.3  sine 1760 fade 0 0.3  0.15 \
    gain -8 reverb 40 50 80

# ── Logout — gentle descending ───────────────────────────────────
log "Creating logout sound..."
sox -n "${SOUNDS_DIR}/ui/desktop-logout.oga" \
    synth 0.2  sine 1318 fade 0 0.2 0.1 : \
    synth 0.2  sine 1108 fade 0 0.2 0.1 : \
    synth 0.3  sine 880  fade 0 0.3 0.15 \
    gain -10 reverb 30 40 70

# ── Notification — soft sparkle bell ─────────────────────────────
log "Creating notification sound..."
sox -n "${SOUNDS_DIR}/notifications/message.oga" \
    synth 0.08 sine 2200 fade 0 0.08 0.03 : \
    synth 0.12 sine 2640 fade 0 0.12 0.06 \
    gain -12 reverb 50 60 90

# ── Error — gentle two-tone alert ────────────────────────────────
log "Creating error sound..."
sox -n "${SOUNDS_DIR}/notifications/dialog-error.oga" \
    synth 0.15 sine 440 fade 0 0.15 0.05 : \
    synth 0.15 sine 330 fade 0 0.15 0.08 \
    gain -10 reverb 20

# ── Bell — short sparkle ─────────────────────────────────────────
log "Creating bell sound..."
sox -n "${SOUNDS_DIR}/notifications/bell.oga" \
    synth 0.1 sine 1760 synth 0.1 sine 2640 \
    fade 0 0.2 0.1 \
    gain -12 reverb 40 50 80

# ── USB connect — rising sparkle ─────────────────────────────────
log "Creating device-connect sound..."
sox -n "${SOUNDS_DIR}/actions/device-added.oga" \
    synth 0.1 sine 1320 fade 0 0.1 0.03 : \
    synth 0.15 sine 1760 fade 0 0.15 0.08 \
    gain -10 reverb 30 40 70

# ── USB disconnect — falling tone ────────────────────────────────
log "Creating device-disconnect sound..."
sox -n "${SOUNDS_DIR}/actions/device-removed.oga" \
    synth 0.1 sine 1760 fade 0 0.1 0.03 : \
    synth 0.15 sine 1320 fade 0 0.15 0.08 \
    gain -10 reverb 30 40 70

# ── Trash empty — soft woosh ─────────────────────────────────────
log "Creating trash sound..."
sox -n "${SOUNDS_DIR}/actions/trash-empty.oga" \
    synth 0.3 noise fade 0 0.3 0.2 \
    bandpass 2000 500 \
    gain -15 reverb 20

# ── Startup sound — full sparkle jingle ──────────────────────────
log "Creating startup sound..."
sox -n "${SOUNDS_DIR}/ui/desktop-login.oga" \
    synth 0.2 sine 660  fade 0 0.2 0.05 : \
    synth 0.2 sine 880  fade 0 0.2 0.05 : \
    synth 0.2 sine 1108 fade 0 0.2 0.05 : \
    synth 0.2 sine 1320 fade 0 0.2 0.05 : \
    synth 0.5 sine 1760 fade 0 0.5 0.25 \
    gain -8 reverb 50 60 90

# ── Click sounds ─────────────────────────────────────────────────
log "Creating click sounds..."
sox -n "${SOUNDS_DIR}/actions/button-pressed.oga" \
    synth 0.04 sine 1200 fade 0 0.04 0.02 \
    gain -15

sox -n "${SOUNDS_DIR}/actions/button-released.oga" \
    synth 0.03 sine 1000 fade 0 0.03 0.015 \
    gain -18

log "All sounds generated! ✨"
echo ""
echo "Sound files created in: ${SOUNDS_DIR}"
echo ""
echo "Directory contents:"
find "${SOUNDS_DIR}" -name "*.oga" -o -name "*.ogg" | sort
