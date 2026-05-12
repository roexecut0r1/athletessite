#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════════
✨ HML Reimagined — Wallpaper & Asset Generator
Generates wallpapers, GRUB backgrounds, Plymouth assets,
and SDDM backgrounds using Python/Pillow
═══════════════════════════════════════════════════════════════════
"""

import os
import sys
import math
import random
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFilter, ImageFont
except ImportError:
    print("Pillow is required: pip install Pillow")
    sys.exit(1)

PROJECT_ROOT = Path(__file__).parent.parent
OUTPUT = {
    "wallpapers_classic": PROJECT_ROOT / "wallpapers" / "classic",
    "wallpapers_modern": PROJECT_ROOT / "wallpapers" / "modern",
    "wallpapers_dark": PROJECT_ROOT / "wallpapers" / "dark-glam",
    "grub": PROJECT_ROOT / "config" / "grub",
    "plymouth": PROJECT_ROOT / "config" / "plymouth" / "hml-theme",
    "sddm": PROJECT_ROOT / "config" / "sddm" / "hml-theme",
    "branding": PROJECT_ROOT / "branding" / "logos",
    "calamares": PROJECT_ROOT / "config" / "calamares" / "branding" / "hml",
}

# ── Color palette ─────────────────────────────────────────────────
COLORS = {
    "pink": (255, 20, 147),
    "purple": (156, 39, 176),
    "magenta": (224, 64, 251),
    "dark": (13, 5, 16),
    "darker": (8, 3, 10),
    "surface": (26, 10, 30),
    "silver": (224, 204, 230),
}


def create_gradient(width, height, color_top, color_bottom):
    """Create a vertical gradient image."""
    img = Image.new("RGB", (width, height))
    draw = ImageDraw.Draw(img)
    for y in range(height):
        t = y / height
        r = int(color_top[0] + (color_bottom[0] - color_top[0]) * t)
        g = int(color_top[1] + (color_bottom[1] - color_top[1]) * t)
        b = int(color_top[2] + (color_bottom[2] - color_top[2]) * t)
        draw.line([(0, y), (width, y)], fill=(r, g, b))
    return img


def add_sparkles(img, count=100, min_size=1, max_size=4):
    """Add sparkle/star effects to an image."""
    draw = ImageDraw.Draw(img)
    w, h = img.size
    for _ in range(count):
        x = random.randint(0, w - 1)
        y = random.randint(0, h - 1)
        size = random.randint(min_size, max_size)
        opacity = random.randint(80, 255)
        color = (255, 255, 255, opacity)
        
        # Star shape (cross pattern)
        if size > 2:
            for dx in range(-size, size + 1):
                if abs(dx) <= 1:
                    for dy in range(-size, size + 1):
                        px, py = x + dx, y + dy
                        if 0 <= px < w and 0 <= py < h:
                            draw.point((px, py), fill=(255, 255, 255))
                else:
                    px, py = x + dx, y
                    if 0 <= px < w and 0 <= py < h:
                        alpha = max(0, opacity - abs(dx) * 40)
                        draw.point((px, py), fill=(255, 255, 255))
        else:
            draw.point((x, y), fill=(255, 255, 255))
    return img


def add_glow_circle(img, cx, cy, radius, color, intensity=0.3):
    """Add a soft glow circle effect."""
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    for r in range(radius, 0, -2):
        alpha = int(intensity * 255 * (1 - r / radius) ** 2)
        alpha = min(255, max(0, alpha))
        draw.ellipse(
            [cx - r, cy - r, cx + r, cy + r],
            fill=(*color, alpha)
        )
    img_rgba = img.convert("RGBA")
    result = Image.alpha_composite(img_rgba, overlay)
    return result.convert("RGB")


def draw_text_centered(img, y, text, size=48, color=(255, 20, 147)):
    """Draw centered text on image."""
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/inter/Inter-Bold.ttf", size)
    except (IOError, OSError):
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size)
        except (IOError, OSError):
            font = ImageFont.load_default()
    
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    x = (img.width - tw) // 2
    draw.text((x, y), text, fill=color, font=font)
    return img


# ═══════════════════════════════════════════════════════════════════
# Wallpaper generators
# ═══════════════════════════════════════════════════════════════════

def generate_classic_wallpaper(width=3840, height=2160):
    """Classic HML — bright pink gradient with lots of sparkles."""
    print("  Generating Classic HML wallpaper...")
    img = create_gradient(width, height, (180, 20, 100), (80, 10, 120))
    
    # Add multiple glow spots
    img = add_glow_circle(img, width // 3, height // 3, 600, COLORS["pink"], 0.4)
    img = add_glow_circle(img, 2 * width // 3, 2 * height // 3, 500, COLORS["magenta"], 0.3)
    img = add_glow_circle(img, width // 2, height // 2, 800, COLORS["purple"], 0.2)
    
    # Lots of sparkles for classic mode
    img = add_sparkles(img, count=300, max_size=5)
    
    return img


def generate_modern_wallpaper(width=3840, height=2160):
    """Modern HML — subtle gradient with refined sparkles."""
    print("  Generating Modern HML wallpaper...")
    img = create_gradient(width, height, (30, 12, 40), (10, 4, 14))
    
    # Subtle glow
    img = add_glow_circle(img, width // 3, height // 2, 800, COLORS["pink"], 0.12)
    img = add_glow_circle(img, 2 * width // 3, height // 3, 600, COLORS["purple"], 0.1)
    
    # Fewer, subtler sparkles
    img = add_sparkles(img, count=80, max_size=3)
    
    return img


def generate_dark_glam_wallpaper(width=3840, height=2160):
    """Dark Glam — deep dark with neon accents."""
    print("  Generating Dark Glam wallpaper...")
    img = create_gradient(width, height, (15, 5, 22), (5, 2, 8))
    
    # Neon glow lines (horizontal)
    draw = ImageDraw.Draw(img)
    for i in range(5):
        y_pos = int(height * (0.2 + i * 0.15))
        for x in range(width):
            dist = abs(x - width // 2) / (width // 2)
            alpha = int(30 * (1 - dist))
            if alpha > 0:
                base = img.getpixel((x, y_pos))
                r = min(255, base[0] + int(COLORS["pink"][0] * alpha / 255))
                g = min(255, base[1] + int(COLORS["pink"][1] * alpha / 255))
                b = min(255, base[2] + int(COLORS["pink"][2] * alpha / 255))
                draw.point((x, y_pos), fill=(r, g, b))
    
    # Neon glow spots
    img = add_glow_circle(img, width // 4, height // 3, 400, COLORS["pink"], 0.15)
    img = add_glow_circle(img, 3 * width // 4, 2 * height // 3, 350, COLORS["magenta"], 0.12)
    
    img = add_sparkles(img, count=50, max_size=2)
    
    return img


def generate_boot_background(width=1920, height=1080):
    """Boot screen background for GRUB/Plymouth/SDDM."""
    print("  Generating boot background...")
    img = create_gradient(width, height, (20, 8, 28), (8, 3, 12))
    img = add_glow_circle(img, width // 2, height // 2 - 60, 500, COLORS["pink"], 0.15)
    img = add_glow_circle(img, width // 2, height // 2 - 60, 300, COLORS["purple"], 0.1)
    img = add_sparkles(img, count=60, max_size=3)
    return img


def generate_logo(size=256):
    """Generate a simple star logo."""
    print("  Generating logo...")
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    cx, cy = size // 2, size // 2
    outer_r = size // 2 - 10
    inner_r = outer_r // 2.5
    points = 5
    
    # Draw a 5-pointed star
    star_points = []
    for i in range(points * 2):
        angle = math.radians(i * 360 / (points * 2) - 90)
        r = outer_r if i % 2 == 0 else inner_r
        x = cx + r * math.cos(angle)
        y = cy + r * math.sin(angle)
        star_points.append((x, y))
    
    # Glow behind star
    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    for r in range(outer_r + 20, 0, -1):
        alpha = int(60 * (1 - r / (outer_r + 20)) ** 2)
        glow_draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 20, 147, alpha))
    img = Image.alpha_composite(img, glow)
    
    draw = ImageDraw.Draw(img)
    draw.polygon(star_points, fill=(255, 20, 147, 240))
    
    return img


def generate_progress_bar(width=400, height=6):
    """Generate progress bar assets for Plymouth."""
    # Background
    bg = Image.new("RGBA", (width, height), (26, 10, 30, 200))
    
    # Foreground (gradient pink to purple)
    fg = Image.new("RGBA", (width, height))
    draw = ImageDraw.Draw(fg)
    for x in range(width):
        t = x / width
        r = int(255 + (156 - 255) * t)
        g = int(20 + (39 - 20) * t)
        b = int(147 + (176 - 147) * t)
        draw.line([(x, 0), (x, height - 1)], fill=(r, g, b, 240))
    
    return bg, fg


# ═══════════════════════════════════════════════════════════════════
# Main generation
# ═══════════════════════════════════════════════════════════════════

def main():
    print("✨ HML Reimagined — Asset Generator")
    print("=" * 50)
    
    # Ensure output directories exist
    for d in OUTPUT.values():
        d.mkdir(parents=True, exist_ok=True)
    
    # ── Wallpapers ────────────────────────────────────────────────
    print("\n📸 Generating wallpapers...")
    
    classic = generate_classic_wallpaper()
    classic.save(OUTPUT["wallpapers_classic"] / "hml-classic-4k.png", "PNG")
    classic.resize((1920, 1080), Image.LANCZOS).save(
        OUTPUT["wallpapers_classic"] / "hml-classic-1080p.png", "PNG")
    
    modern = generate_modern_wallpaper()
    modern.save(OUTPUT["wallpapers_modern"] / "hml-modern-4k.png", "PNG")
    modern.resize((1920, 1080), Image.LANCZOS).save(
        OUTPUT["wallpapers_modern"] / "hml-modern-1080p.png", "PNG")
    
    dark = generate_dark_glam_wallpaper()
    dark.save(OUTPUT["wallpapers_dark"] / "hml-dark-glam-4k.png", "PNG")
    dark.resize((1920, 1080), Image.LANCZOS).save(
        OUTPUT["wallpapers_dark"] / "hml-dark-glam-1080p.png", "PNG")
    
    # ── Boot backgrounds ──────────────────────────────────────────
    print("\n🖥️ Generating boot backgrounds...")
    boot_bg = generate_boot_background()
    boot_bg.save(OUTPUT["grub"] / "background.png", "PNG")
    boot_bg.save(OUTPUT["plymouth"] / "background.png", "PNG")
    boot_bg.save(OUTPUT["sddm"] / "background.png", "PNG")
    boot_bg.save(OUTPUT["calamares"] / "wallpaper.png", "PNG")
    
    # ── Logo ──────────────────────────────────────────────────────
    print("\n⭐ Generating logo...")
    logo = generate_logo(256)
    logo.save(OUTPUT["branding"] / "hml-logo-256.png", "PNG")
    logo.save(OUTPUT["plymouth"] / "logo.png", "PNG")
    logo.save(OUTPUT["calamares"] / "logo.png", "PNG")
    logo.save(OUTPUT["calamares"] / "icon.png", "PNG")
    
    logo_small = logo.resize((64, 64), Image.LANCZOS)
    logo_small.save(OUTPUT["branding"] / "hml-logo-64.png", "PNG")
    
    # ── Plymouth progress bar ─────────────────────────────────────
    print("\n📊 Generating progress bar assets...")
    pb_bg, pb_fg = generate_progress_bar()
    pb_bg.save(OUTPUT["plymouth"] / "progress_bg.png", "PNG")
    pb_fg.save(OUTPUT["plymouth"] / "progress_fg.png", "PNG")
    
    # ── Plymouth title text ───────────────────────────────────────
    print("\n📝 Generating title text...")
    title = Image.new("RGBA", (500, 60), (0, 0, 0, 0))
    title_draw = ImageDraw.Draw(title)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 28)
    except (IOError, OSError):
        font = ImageFont.load_default()
    bbox = title_draw.textbbox((0, 0), "HML Reimagined", font=font)
    tw = bbox[2] - bbox[0]
    title_draw.text(((500 - tw) // 2, 10), "HML Reimagined", 
                    fill=(255, 20, 147, 240), font=font)
    title.save(OUTPUT["plymouth"] / "title.png", "PNG")
    
    # ── Plymouth glow effect ──────────────────────────────────────
    glow = Image.new("RGBA", (400, 400), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    for r in range(200, 0, -1):
        alpha = int(40 * (1 - r / 200) ** 2)
        glow_draw.ellipse([200 - r, 200 - r, 200 + r, 200 + r],
                         fill=(255, 20, 147, alpha))
    glow.save(OUTPUT["plymouth"] / "glow.png", "PNG")
    
    # ── Calamares banner ──────────────────────────────────────────
    print("\n🎨 Generating installer banner...")
    banner = Image.new("RGB", (600, 100), COLORS["surface"])
    banner = draw_text_centered(banner, 25, "✨ HML Reimagined ✨", 36, COLORS["pink"])
    banner.save(OUTPUT["calamares"] / "banner.png", "PNG")
    
    welcome = generate_boot_background(800, 600)
    welcome = draw_text_centered(welcome, 200, "✨ HML Reimagined ✨", 48, COLORS["pink"])
    welcome = draw_text_centered(welcome, 280, "Welcome, Superstar!", 24, COLORS["silver"])
    welcome.save(OUTPUT["calamares"] / "welcome.png", "PNG")
    
    print("\n" + "=" * 50)
    print("✨ All assets generated successfully!")
    print(f"   Wallpapers: {OUTPUT['wallpapers_classic']}")
    print(f"   Boot: {OUTPUT['grub']}")
    print(f"   Logos: {OUTPUT['branding']}")
    print(f"   Plymouth: {OUTPUT['plymouth']}")


if __name__ == "__main__":
    main()
