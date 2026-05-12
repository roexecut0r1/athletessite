#!/usr/bin/env bash
# Generate GRUB font file from system fonts
# Run on a Linux system with grub-mkfont available

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Generating GRUB font..."
grub-mkfont -o "${SCRIPT_DIR}/font.pf2" -s 16 /usr/share/fonts/truetype/dejavu/DejaVuSans.ttf
grub-mkfont -o "${SCRIPT_DIR}/font_bold.pf2" -s 16 /usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf
grub-mkfont -o "${SCRIPT_DIR}/font_title.pf2" -s 24 /usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf

echo "✨ GRUB fonts generated!"
echo ""
echo "NOTE: You also need to generate these image assets:"
echo "  - background.png (1920x1080, dark purple gradient with sparkles)"
echo "  - menu_item_c.png (menu item center tile)"
echo "  - menu_item_e.png (menu item east edge)"  
echo "  - menu_item_w.png (menu item west edge)"
echo "  - menu_item_selected_c.png (selected item center)"
echo "  - menu_item_selected_e.png (selected item east)"
echo "  - menu_item_selected_w.png (selected item west)"
echo "  - scrollbar_thumb.png"
echo "  - progress_highlight_c.png"
echo ""
echo "Use the wallpaper generator or create matching assets manually."
