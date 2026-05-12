#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════════
✨ HML Reimagined — Icon SVG Generator
Generates pink-tinted folder and app icons as SVG files
═══════════════════════════════════════════════════════════════════
"""

import os
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
ICONS_DIR = PROJECT_ROOT / "themes" / "icons" / "hml-icons" / "scalable"

# ── Color palette ─────────────────────────────────────────────────
PINK = "#FF1493"
PURPLE = "#9C27B0"
MAGENTA = "#E040FB"
DARK = "#1A0A1E"
LIGHT_PINK = "#FFB6D9"


def svg_folder(fill_main, fill_front, fill_tab):
    """Generate a folder SVG icon."""
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- Folder back -->
  <path d="M6 14 L6 52 C6 54.2 7.8 56 10 56 L54 56 C56.2 56 58 54.2 58 52 L58 22 C58 19.8 56.2 18 54 18 L30 18 L26 12 C25.2 10.8 23.8 10 22.4 10 L10 10 C7.8 10 6 11.8 6 14 Z" fill="{fill_main}" opacity="0.85"/>
  <!-- Folder tab -->
  <path d="M6 14 L6 18 L26 18 L30 18 L26 12 C25.2 10.8 23.8 10 22.4 10 L10 10 C7.8 10 6 11.8 6 14 Z" fill="{fill_tab}"/>
  <!-- Folder front -->
  <path d="M4 24 C4 21.8 5.8 20 8 20 L56 20 C58.2 20 60 21.8 60 24 L60 52 C60 54.2 58.2 56 56 56 L8 56 C5.8 56 4 54.2 4 52 Z" fill="{fill_front}" opacity="0.95"/>
  <!-- Highlight -->
  <path d="M8 22 L56 22 C57 22 58 23 58 24 L58 26 L6 26 L6 24 C6 23 7 22 8 22 Z" fill="white" opacity="0.15"/>
</svg>'''


def svg_document_icon(accent_color, doc_label=""):
    """Generate a document/file type SVG icon."""
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- Page -->
  <path d="M14 4 L42 4 L54 16 L54 58 C54 59.1 53.1 60 52 60 L14 60 C12.9 60 12 59.1 12 58 L12 6 C12 4.9 12.9 4 14 4 Z" fill="#2D1540"/>
  <!-- Page fold -->
  <path d="M42 4 L42 14 C42 15.1 42.9 16 44 16 L54 16 Z" fill="{accent_color}" opacity="0.6"/>
  <!-- Accent bar -->
  <rect x="18" y="24" width="28" height="3" rx="1.5" fill="{accent_color}" opacity="0.8"/>
  <!-- Text lines -->
  <rect x="18" y="32" width="24" height="2" rx="1" fill="#8C7896" opacity="0.5"/>
  <rect x="18" y="38" width="20" height="2" rx="1" fill="#8C7896" opacity="0.4"/>
  <rect x="18" y="44" width="22" height="2" rx="1" fill="#8C7896" opacity="0.3"/>
</svg>'''


def svg_star_icon(color):
    """Generate a star icon."""
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:{PINK};stop-opacity:1"/>
      <stop offset="100%" style="stop-color:{PURPLE};stop-opacity:1"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <!-- Glow -->
  <polygon points="32,4 39,24 60,24 43,38 49,58 32,46 15,58 21,38 4,24 25,24" 
           fill="{color}" opacity="0.3" filter="url(#glow)"/>
  <!-- Star -->
  <polygon points="32,8 38,24 56,24 42,36 47,54 32,44 17,54 22,36 8,24 26,24" 
           fill="url(#starGrad)"/>
  <!-- Highlight -->
  <polygon points="32,12 36,24 32,22 28,24" fill="white" opacity="0.3"/>
</svg>'''


def generate_icons():
    print("✨ Generating HML icon SVGs...")

    # ── Folder icons (places) ─────────────────────────────────────
    places = ICONS_DIR / "places"
    places.mkdir(parents=True, exist_ok=True)

    folders = {
        "folder": (PINK, "#CC1177", "#FF3CAF"),
        "folder-documents": (PURPLE, "#7B1FA2", MAGENTA),
        "folder-download": ("#E040FB", "#B030D0", "#F080FF"),
        "folder-music": (PINK, "#CC1177", "#FF6BB5"),
        "folder-pictures": (MAGENTA, "#C020E0", "#FF60FF"),
        "folder-videos": (PURPLE, "#6A1B9A", "#CE93D8"),
        "folder-home": (PINK, "#D01580", "#FF50B0"),
        "folder-desktop": ("#AB47BC", "#8E24AA", "#CE93D8"),
        "folder-templates": ("#7B1FA2", "#6A1B9A", "#9C27B0"),
        "folder-publicshare": ("#E040FB", "#C030D0", "#F070FF"),
        "folder-favorites": ("#FF1493", "#E01280", "#FF60C0"),
        "folder-recent": ("#BA68C8", "#9C27B0", "#CE93D8"),
        "folder-cloud": ("#AB47BC", "#8E24AA", "#D500F9"),
        "folder-games": ("#FF1493", "#D01580", "#FF80D0"),
        "user-home": (PINK, "#CC1177", "#FF3CAF"),
        "user-desktop": ("#AB47BC", "#8E24AA", "#CE93D8"),
        "user-trash": ("#7B1FA2", "#5C1690", "#9C27B0"),
        "user-trash-full": (PINK, "#CC1177", "#FF3CAF"),
        "network-workgroup": (PURPLE, "#7B1FA2", MAGENTA),
    }

    for name, (main, front, tab) in folders.items():
        svg = svg_folder(main, front, tab)
        (places / f"{name}.svg").write_text(svg)
        print(f"  → {name}.svg")

    # ── App icons ─────────────────────────────────────────────────
    apps = ICONS_DIR / "apps"
    apps.mkdir(parents=True, exist_ok=True)

    # HML Control Center icon
    (apps / "hml-control-center.svg").write_text(svg_star_icon(PINK))
    print("  → hml-control-center.svg")

    # Start-here icon
    (apps / "start-here-kde.svg").write_text(svg_star_icon(PINK))
    print("  → start-here-kde.svg")

    # HML distro icon
    (apps / "distributor-logo-hml.svg").write_text(svg_star_icon(PINK))
    print("  → distributor-logo-hml.svg")

    # ── Mimetype icons ────────────────────────────────────────────
    mimetypes = ICONS_DIR / "mimetypes"
    mimetypes.mkdir(parents=True, exist_ok=True)

    doc_types = {
        "text-plain": PINK,
        "text-html": MAGENTA,
        "application-pdf": "#E91E63",
        "application-x-executable": PURPLE,
        "image-x-generic": PINK,
        "audio-x-generic": MAGENTA,
        "video-x-generic": PURPLE,
        "application-x-compressed-tar": "#7B1FA2",
        "application-json": "#E040FB",
        "text-x-python": "#AB47BC",
        "text-x-script": PINK,
    }

    for name, color in doc_types.items():
        svg = svg_document_icon(color)
        (mimetypes / f"{name}.svg").write_text(svg)
        print(f"  → {name}.svg")

    # ── Status icons ──────────────────────────────────────────────
    status = ICONS_DIR / "status"
    status.mkdir(parents=True, exist_ok=True)

    # Battery, network, volume indicators inherit from Breeze
    # Just add branded notification icon
    (status / "notification-active.svg").write_text(svg_star_icon(PINK))
    print("  → notification-active.svg")

    # ── Update icon cache hint ────────────────────────────────────
    print(f"\n✨ Generated {len(folders) + len(doc_types) + 4} icon SVGs!")
    print(f"   Location: {ICONS_DIR}")
    print("   Run: gtk-update-icon-cache /usr/share/icons/hml-icons")


if __name__ == "__main__":
    generate_icons()
