#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════════
✨ HML Reimagined — Cursor Generator
Generates X11 cursor images (PNG) and xcursorgen configs
═══════════════════════════════════════════════════════════════════
"""

import os
from pathlib import Path

try:
    from PIL import Image, ImageDraw
except ImportError:
    print("Pillow required: pip install Pillow")
    exit(1)

PROJECT_ROOT = Path(__file__).parent.parent
CURSOR_DIR = PROJECT_ROOT / "themes" / "cursors" / "hml-cursors"
CURSORS_OUT = CURSOR_DIR / "cursors"

PINK = (255, 20, 147)
WHITE = (255, 255, 255)
DARK = (26, 10, 30)
OUTLINE = (80, 30, 100)

SIZES = [24, 32, 48]


def draw_arrow(size):
    """Draw a standard arrow cursor."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    s = size / 32.0  # scale factor
    
    # Arrow outline
    arrow_outline = [
        (int(1*s), int(1*s)),
        (int(1*s), int(28*s)),
        (int(8*s), int(21*s)),
        (int(13*s), int(30*s)),
        (int(17*s), int(28*s)),
        (int(12*s), int(19*s)),
        (int(21*s), int(19*s)),
    ]
    draw.polygon(arrow_outline, fill=DARK + (240,), outline=OUTLINE + (200,))
    
    # Arrow fill (pink gradient effect)
    arrow_inner = [
        (int(3*s), int(4*s)),
        (int(3*s), int(24*s)),
        (int(8*s), int(19*s)),
        (int(12*s), int(27*s)),
        (int(15*s), int(26*s)),
        (int(11*s), int(18*s)),
        (int(18*s), int(18*s)),
    ]
    draw.polygon(arrow_inner, fill=PINK + (220,))
    
    # White highlight
    highlight = [
        (int(4*s), int(5*s)),
        (int(4*s), int(15*s)),
        (int(10*s), int(15*s)),
    ]
    draw.polygon(highlight, fill=WHITE + (60,))
    
    return img


def draw_hand(size):
    """Draw a hand/pointer cursor."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    s = size / 32.0
    
    # Simple hand shape
    # Pointing finger
    draw.rounded_rectangle(
        [int(10*s), int(1*s), int(15*s), int(16*s)],
        radius=int(2*s), fill=PINK + (230,), outline=OUTLINE + (200,)
    )
    # Palm
    draw.rounded_rectangle(
        [int(5*s), int(12*s), int(24*s), int(28*s)],
        radius=int(3*s), fill=PINK + (230,), outline=OUTLINE + (200,)
    )
    # Other fingers
    for fx in [5, 16, 21]:
        draw.rounded_rectangle(
            [int(fx*s), int(8*s), int((fx+4)*s), int(16*s)],
            radius=int(1.5*s), fill=PINK + (200,), outline=OUTLINE + (180,)
        )
    
    return img


def draw_text_cursor(size):
    """Draw a text/I-beam cursor."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    s = size / 32.0
    cx = int(16 * s)
    
    # Top serif
    draw.line([(cx - int(4*s), int(2*s)), (cx + int(4*s), int(2*s))], 
              fill=PINK + (230,), width=max(1, int(2*s)))
    # Bottom serif
    draw.line([(cx - int(4*s), int(30*s)), (cx + int(4*s), int(30*s))], 
              fill=PINK + (230,), width=max(1, int(2*s)))
    # Vertical bar
    draw.line([(cx, int(2*s)), (cx, int(30*s))], 
              fill=PINK + (240,), width=max(1, int(2*s)))
    
    return img


def draw_crosshair(size):
    """Draw a crosshair cursor."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    cx = cy = size // 2
    s = size / 32.0
    w = max(1, int(1.5 * s))
    
    # Cross lines
    draw.line([(cx, int(4*s)), (cx, int(28*s))], fill=PINK + (230,), width=w)
    draw.line([(int(4*s), cy), (int(28*s), cy)], fill=PINK + (230,), width=w)
    
    # Center circle
    r = int(3 * s)
    draw.ellipse([cx-r, cy-r, cx+r, cy+r], outline=PINK + (230,), width=w)
    
    return img


def draw_wait(size):
    """Draw a wait/busy cursor (spinning circle)."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    cx = cy = size // 2
    s = size / 32.0
    r = int(10 * s)
    w = max(2, int(3 * s))
    
    # Background circle
    draw.arc([cx-r, cy-r, cx+r, cy+r], 0, 360, fill=OUTLINE + (100,), width=w)
    # Active arc (pink)
    draw.arc([cx-r, cy-r, cx+r, cy+r], -90, 90, fill=PINK + (230,), width=w)
    
    return img


CURSOR_TYPES = {
    "default": (draw_arrow, 1, 1),
    "left_ptr": (draw_arrow, 1, 1),
    "pointer": (draw_hand, 10, 4),
    "hand1": (draw_hand, 10, 4),
    "hand2": (draw_hand, 10, 4),
    "text": (draw_text_cursor, 16, 2),
    "xterm": (draw_text_cursor, 16, 2),
    "crosshair": (draw_crosshair, 16, 16),
    "cross": (draw_crosshair, 16, 16),
    "wait": (draw_wait, 16, 16),
    "watch": (draw_wait, 16, 16),
    "progress": (draw_wait, 16, 16),
    "left_ptr_watch": (draw_wait, 1, 1),
}


def main():
    print("✨ Generating HML cursor theme...")
    
    CURSORS_OUT.mkdir(parents=True, exist_ok=True)
    build_dir = CURSOR_DIR / "build"
    build_dir.mkdir(parents=True, exist_ok=True)
    
    for cursor_name, (draw_func, hx_base, hy_base) in CURSOR_TYPES.items():
        config_lines = []
        
        for size in SIZES:
            img = draw_func(size)
            scale = size / 32.0
            hx = int(hx_base * scale)
            hy = int(hy_base * scale)
            
            png_name = f"{cursor_name}_{size}.png"
            img.save(build_dir / png_name, "PNG")
            config_lines.append(f"{size} {hx} {hy} {png_name}")
        
        # Write xcursorgen config
        config_file = build_dir / f"{cursor_name}.cursor"
        config_file.write_text("\n".join(config_lines) + "\n")
        
        print(f"  → {cursor_name}")
    
    # Write build instructions
    build_script = build_dir / "build-cursors.sh"
    build_script.write_text(f"""#!/bin/bash
# Run this on Linux with xcursorgen installed
# sudo apt install x11-apps
set -e
cd "$(dirname "$0")"
mkdir -p ../cursors

""" + "\n".join(
        f'xcursorgen {name}.cursor ../cursors/{name}'
        for name in CURSOR_TYPES.keys()
    ) + """

# Create symlinks for common aliases
cd ../cursors
ln -sf default arrow 2>/dev/null || true
ln -sf pointer hand 2>/dev/null || true  
ln -sf text ibeam 2>/dev/null || true
ln -sf wait busy 2>/dev/null || true
ln -sf crosshair tcross 2>/dev/null || true

echo "✨ Cursors built!"
""")
    build_script.chmod(0o755)
    
    print(f"\n✨ Generated {len(CURSOR_TYPES)} cursor types × {len(SIZES)} sizes!")
    print(f"   PNGs: {build_dir}")
    print(f"   To compile: cd {build_dir} && bash build-cursors.sh")


if __name__ == "__main__":
    main()
