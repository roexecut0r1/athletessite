#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════════
✨ HML Control Center ✨
Theme manager and customization hub for HML Reimagined Linux
═══════════════════════════════════════════════════════════════════
"""

import sys
import os
import subprocess
import json
import shutil
from pathlib import Path

try:
    from PyQt6.QtWidgets import (
        QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
        QLabel, QPushButton, QTabWidget, QGroupBox, QSlider,
        QComboBox, QCheckBox, QFrame, QGridLayout, QMessageBox,
        QStackedWidget, QScrollArea, QSizePolicy
    )
    from PyQt6.QtCore import Qt, QSize, QPropertyAnimation, QEasingCurve
    from PyQt6.QtGui import QFont, QColor, QPalette, QIcon, QPixmap, QLinearGradient
except ImportError:
    print("PyQt6 is required. Install with: pip install PyQt6")
    sys.exit(1)

# ── Configuration paths ──────────────────────────────────────────
CONFIG_DIR = Path.home() / ".config" / "hml-reimagined"
CONFIG_FILE = CONFIG_DIR / "settings.json"
THEMES_DIR = Path("/usr/share/plasma/look-and-feel")
SOUNDS_DIR = Path("/usr/share/sounds/hml-reimagined")
WALLPAPERS_DIR = Path("/usr/share/wallpapers/HML-Reimagined/contents/images")

# ── Default settings ─────────────────────────────────────────────
DEFAULT_SETTINGS = {
    "mode": "modern",
    "sounds_enabled": True,
    "startup_sound": True,
    "shutdown_sound": True,
    "ui_sounds": True,
    "glow_effects": True,
    "performance_mode": False,
    "wallpaper_pack": "modern",
    "color_preset": "default",
    "rgb_effects": False
}

# ── Color palette ─────────────────────────────────────────────────
COLORS = {
    "pink": "#FF1493",
    "purple": "#9C27B0",
    "magenta": "#E040FB",
    "dark": "#0D0510",
    "darker": "#080310",
    "surface": "#1A0A1E",
    "surface_light": "#2D1540",
    "silver": "#E0CCE6",
    "text_dim": "#8C7896"
}

STYLESHEET = f"""
QMainWindow {{
    background-color: {COLORS['dark']};
}}
QWidget {{
    color: {COLORS['silver']};
    font-family: 'Inter', 'Segoe UI', sans-serif;
    font-size: 13px;
}}
QTabWidget::pane {{
    border: 1px solid rgba(156, 39, 176, 0.3);
    border-radius: 12px;
    background: {COLORS['surface']};
    padding: 8px;
}}
QTabBar::tab {{
    background: transparent;
    color: {COLORS['text_dim']};
    padding: 10px 20px;
    border-bottom: 2px solid transparent;
    font-weight: bold;
    min-width: 80px;
}}
QTabBar::tab:selected {{
    color: {COLORS['pink']};
    border-bottom: 2px solid {COLORS['pink']};
}}
QTabBar::tab:hover:!selected {{
    color: {COLORS['silver']};
    border-bottom: 2px solid rgba(156, 39, 176, 0.4);
}}
QPushButton {{
    background: {COLORS['surface_light']};
    color: {COLORS['silver']};
    border: 1px solid rgba(156, 39, 176, 0.3);
    border-radius: 8px;
    padding: 10px 24px;
    font-weight: bold;
    min-height: 20px;
}}
QPushButton:hover {{
    border-color: {COLORS['pink']};
    background: rgba(255, 20, 147, 0.1);
}}
QPushButton:pressed {{
    background: rgba(255, 20, 147, 0.2);
}}
QPushButton#accentBtn {{
    background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
        stop:0 {COLORS['pink']}, stop:1 {COLORS['purple']});
    color: white;
    border: none;
}}
QPushButton#accentBtn:hover {{
    background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
        stop:0 #FF3CAF, stop:1 #B040D0);
}}
QGroupBox {{
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(156, 39, 176, 0.2);
    border-radius: 12px;
    padding: 20px;
    padding-top: 35px;
    margin-top: 8px;
    font-weight: bold;
}}
QGroupBox::title {{
    color: {COLORS['pink']};
    subcontrol-origin: margin;
    padding: 4px 12px;
}}
QCheckBox::indicator {{
    width: 20px;
    height: 20px;
    border: 1px solid rgba(156, 39, 176, 0.4);
    border-radius: 4px;
    background: {COLORS['surface']};
}}
QCheckBox::indicator:checked {{
    background: {COLORS['pink']};
    border-color: {COLORS['pink']};
}}
QComboBox {{
    background: {COLORS['surface']};
    border: 1px solid rgba(156, 39, 176, 0.3);
    border-radius: 8px;
    padding: 8px 12px;
    min-height: 20px;
}}
QComboBox:hover {{
    border-color: {COLORS['pink']};
}}
QComboBox::drop-down {{
    border: none;
    padding-right: 8px;
}}
QSlider::groove:horizontal {{
    background: {COLORS['surface']};
    height: 6px;
    border-radius: 3px;
}}
QSlider::handle:horizontal {{
    background: {COLORS['pink']};
    width: 18px;
    height: 18px;
    border-radius: 9px;
    margin: -6px 0;
}}
QSlider::sub-page:horizontal {{
    background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
        stop:0 {COLORS['pink']}, stop:1 {COLORS['purple']});
    border-radius: 3px;
}}
QScrollArea {{
    border: none;
    background: transparent;
}}
QLabel#heading {{
    font-size: 18px;
    font-weight: bold;
    color: {COLORS['pink']};
}}
QLabel#subheading {{
    font-size: 13px;
    color: {COLORS['text_dim']};
}}
"""


class HMLControlCenter(QMainWindow):
    def __init__(self):
        super().__init__()
        self.settings = self.load_settings()
        self.init_ui()

    def load_settings(self):
        CONFIG_DIR.mkdir(parents=True, exist_ok=True)
        if CONFIG_FILE.exists():
            with open(CONFIG_FILE) as f:
                saved = json.load(f)
                return {**DEFAULT_SETTINGS, **saved}
        return DEFAULT_SETTINGS.copy()

    def save_settings(self):
        CONFIG_DIR.mkdir(parents=True, exist_ok=True)
        with open(CONFIG_FILE, 'w') as f:
            json.dump(self.settings, f, indent=2)

    def init_ui(self):
        self.setWindowTitle("✨ HML Control Center")
        self.setMinimumSize(750, 600)
        self.setStyleSheet(STYLESHEET)

        central = QWidget()
        self.setCentralWidget(central)
        layout = QVBoxLayout(central)
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(16)

        # Header
        header = QLabel("✨ HML Control Center")
        header.setObjectName("heading")
        header.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(header)

        subtitle = QLabel("Customize your HML Reimagined experience")
        subtitle.setObjectName("subheading")
        subtitle.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(subtitle)

        # Tab widget
        tabs = QTabWidget()
        tabs.addTab(self.create_modes_tab(), "🎭 Modes")
        tabs.addTab(self.create_sounds_tab(), "🔊 Sounds")
        tabs.addTab(self.create_wallpaper_tab(), "🖼 Wallpapers")
        tabs.addTab(self.create_effects_tab(), "✨ Effects")
        tabs.addTab(self.create_performance_tab(), "⚡ Performance")
        layout.addWidget(tabs)

        # Bottom buttons
        btn_layout = QHBoxLayout()
        btn_layout.setSpacing(12)

        restore_btn = QPushButton("🔄 Restore Defaults")
        restore_btn.clicked.connect(self.restore_defaults)
        btn_layout.addWidget(restore_btn)

        btn_layout.addStretch()

        apply_btn = QPushButton("✨ Apply Changes")
        apply_btn.setObjectName("accentBtn")
        apply_btn.clicked.connect(self.apply_changes)
        btn_layout.addWidget(apply_btn)

        layout.addLayout(btn_layout)

    def create_modes_tab(self):
        widget = QWidget()
        layout = QVBoxLayout(widget)
        layout.setSpacing(12)

        desc = QLabel("Choose your aesthetic mode. Each mode changes colors, sounds, effects, and wallpapers.")
        desc.setWordWrap(True)
        layout.addWidget(desc)

        modes = [
            ("classic", "🌟 Classic HML",
             "Maximum nostalgia — glitter everywhere, bright pink UI, loud sounds. The full 2009 experience."),
            ("modern", "💎 Modern HML",
             "Clean and polished with pink/purple accents. Perfect for daily use."),
            ("dark_glam", "🌙 Dark Glam",
             "Dark mode with neon pink/purple accents. RGB gamer aesthetic meets pop-star styling.")
        ]

        self.mode_buttons = {}
        for mode_id, title, description in modes:
            group = QGroupBox(title)
            group_layout = QVBoxLayout(group)

            desc_label = QLabel(description)
            desc_label.setWordWrap(True)
            group_layout.addWidget(desc_label)

            btn = QPushButton(f"Activate {title}")
            btn.setProperty("mode_id", mode_id)
            btn.clicked.connect(lambda checked, m=mode_id: self.set_mode(m))
            if self.settings["mode"] == mode_id:
                btn.setObjectName("accentBtn")
                btn.setStyleSheet(btn.styleSheet())
            group_layout.addWidget(btn)
            self.mode_buttons[mode_id] = btn

            layout.addWidget(group)

        layout.addStretch()
        return widget

    def create_sounds_tab(self):
        widget = QWidget()
        layout = QVBoxLayout(widget)
        layout.setSpacing(12)

        group = QGroupBox("🔊 Sound Settings")
        group_layout = QVBoxLayout(group)

        self.sounds_master = QCheckBox("Enable all system sounds")
        self.sounds_master.setChecked(self.settings["sounds_enabled"])
        self.sounds_master.stateChanged.connect(self.toggle_master_sound)
        group_layout.addWidget(self.sounds_master)

        self.sound_startup = QCheckBox("Startup sound")
        self.sound_startup.setChecked(self.settings["startup_sound"])
        group_layout.addWidget(self.sound_startup)

        self.sound_shutdown = QCheckBox("Shutdown sound")
        self.sound_shutdown.setChecked(self.settings["shutdown_sound"])
        group_layout.addWidget(self.sound_shutdown)

        self.sound_ui = QCheckBox("UI interaction sounds (clicks, notifications)")
        self.sound_ui.setChecked(self.settings["ui_sounds"])
        group_layout.addWidget(self.sound_ui)

        layout.addWidget(group)

        # Volume
        vol_group = QGroupBox("🎚 Volume")
        vol_layout = QVBoxLayout(vol_group)
        vol_label = QLabel("System sound volume")
        vol_layout.addWidget(vol_label)
        self.vol_slider = QSlider(Qt.Orientation.Horizontal)
        self.vol_slider.setRange(0, 100)
        self.vol_slider.setValue(75)
        vol_layout.addWidget(self.vol_slider)
        layout.addWidget(vol_group)

        # Test button
        test_btn = QPushButton("🔔 Test Notification Sound")
        test_btn.clicked.connect(self.test_sound)
        layout.addWidget(test_btn)

        layout.addStretch()
        return widget

    def create_wallpaper_tab(self):
        widget = QWidget()
        layout = QVBoxLayout(widget)
        layout.setSpacing(12)

        group = QGroupBox("🖼 Wallpaper Pack")
        group_layout = QVBoxLayout(group)

        self.wallpaper_combo = QComboBox()
        self.wallpaper_combo.addItems(["Classic HML", "Modern HML", "Dark Glam", "Minimal", "Custom"])
        pack_map = {"classic": 0, "modern": 1, "dark_glam": 2, "minimal": 3}
        self.wallpaper_combo.setCurrentIndex(pack_map.get(self.settings["wallpaper_pack"], 1))
        group_layout.addWidget(self.wallpaper_combo)

        layout.addWidget(group)

        color_group = QGroupBox("🎨 Color Presets")
        color_layout = QGridLayout(color_group)

        presets = [
            ("Default Pink", "#FF1493"),
            ("Royal Purple", "#7B1FA2"),
            ("Magenta Glow", "#E040FB"),
            ("Hot Coral", "#FF6B6B"),
            ("Lavender", "#CE93D8"),
            ("Neon Rose", "#FF3CAF"),
        ]

        for i, (name, color) in enumerate(presets):
            btn = QPushButton(name)
            btn.setStyleSheet(f"""
                QPushButton {{
                    background: {color};
                    color: white;
                    border: 2px solid transparent;
                    border-radius: 8px;
                    padding: 8px;
                    font-weight: bold;
                }}
                QPushButton:hover {{
                    border-color: white;
                }}
            """)
            btn.clicked.connect(lambda checked, c=color: self.set_color_preset(c))
            color_layout.addWidget(btn, i // 3, i % 3)

        layout.addWidget(color_group)
        layout.addStretch()
        return widget

    def create_effects_tab(self):
        widget = QWidget()
        layout = QVBoxLayout(widget)
        layout.setSpacing(12)

        group = QGroupBox("✨ Visual Effects")
        group_layout = QVBoxLayout(group)

        self.glow_check = QCheckBox("Enable glow/bloom effects on UI elements")
        self.glow_check.setChecked(self.settings["glow_effects"])
        group_layout.addWidget(self.glow_check)

        self.rgb_check = QCheckBox("RGB accent cycling (keyboard backlight integration)")
        self.rgb_check.setChecked(self.settings["rgb_effects"])
        group_layout.addWidget(self.rgb_check)

        self.wobbly_check = QCheckBox("Wobbly windows (fun but distracting)")
        self.wobbly_check.setChecked(False)
        group_layout.addWidget(self.wobbly_check)

        self.blur_check = QCheckBox("Window blur/transparency")
        self.blur_check.setChecked(True)
        group_layout.addWidget(self.blur_check)

        layout.addWidget(group)

        anim_group = QGroupBox("🎬 Animation Speed")
        anim_layout = QVBoxLayout(anim_group)
        anim_label = QLabel("Faster ←→ Slower")
        anim_layout.addWidget(anim_label)
        self.anim_slider = QSlider(Qt.Orientation.Horizontal)
        self.anim_slider.setRange(1, 10)
        self.anim_slider.setValue(3)
        anim_layout.addWidget(self.anim_slider)
        layout.addWidget(anim_group)

        layout.addStretch()
        return widget

    def create_performance_tab(self):
        widget = QWidget()
        layout = QVBoxLayout(widget)
        layout.setSpacing(12)

        group = QGroupBox("⚡ Performance Mode")
        group_layout = QVBoxLayout(group)

        desc = QLabel("Performance mode reduces visual effects and animations "
                      "for better performance on older hardware.")
        desc.setWordWrap(True)
        group_layout.addWidget(desc)

        self.perf_check = QCheckBox("Enable Performance Mode")
        self.perf_check.setChecked(self.settings["performance_mode"])
        group_layout.addWidget(self.perf_check)

        layout.addWidget(group)

        info_group = QGroupBox("📊 System Info")
        info_layout = QVBoxLayout(info_group)

        try:
            import platform
            info_layout.addWidget(QLabel(f"OS: HML Reimagined"))
            info_layout.addWidget(QLabel(f"Kernel: {platform.release()}"))
            info_layout.addWidget(QLabel(f"Architecture: {platform.machine()}"))
        except Exception:
            info_layout.addWidget(QLabel("System info unavailable"))

        layout.addWidget(info_group)
        layout.addStretch()
        return widget

    # ── Actions ───────────────────────────────────────────────────
    def set_mode(self, mode_id):
        self.settings["mode"] = mode_id
        # Update button states
        for mid, btn in self.mode_buttons.items():
            if mid == mode_id:
                btn.setObjectName("accentBtn")
            else:
                btn.setObjectName("")
            btn.setStyleSheet(btn.styleSheet())
        self.save_settings()

    def toggle_master_sound(self, state):
        enabled = state == 2  # Qt.CheckState.Checked
        self.sound_startup.setEnabled(enabled)
        self.sound_shutdown.setEnabled(enabled)
        self.sound_ui.setEnabled(enabled)

    def test_sound(self):
        try:
            subprocess.Popen(["paplay", "/usr/share/sounds/hml-reimagined/stereo/bell.oga"],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except FileNotFoundError:
            QMessageBox.information(self, "Sound Test",
                                 "Sound system not available. Install PipeWire/PulseAudio.")

    def set_color_preset(self, color):
        self.settings["color_preset"] = color
        self.save_settings()

    def apply_changes(self):
        self.settings["sounds_enabled"] = self.sounds_master.isChecked()
        self.settings["startup_sound"] = self.sound_startup.isChecked()
        self.settings["shutdown_sound"] = self.sound_shutdown.isChecked()
        self.settings["ui_sounds"] = self.sound_ui.isChecked()
        self.settings["glow_effects"] = self.glow_check.isChecked()
        self.settings["rgb_effects"] = self.rgb_check.isChecked()
        self.settings["performance_mode"] = self.perf_check.isChecked()
        self.settings["wallpaper_pack"] = ["classic", "modern", "dark_glam", "minimal", "custom"][
            self.wallpaper_combo.currentIndex()
        ]

        self.save_settings()
        self.apply_kde_settings()

        QMessageBox.information(self, "✨ Applied!",
                              "Your HML settings have been applied!\n"
                              "Some changes may require logging out and back in.")

    def apply_kde_settings(self):
        """Apply settings to KDE Plasma via kwriteconfig6 / plasma-apply commands."""
        mode = self.settings["mode"]

        # Apply wobbly windows
        wobbly = "true" if self.wobbly_check.isChecked() else "false"
        self._kde_cmd(f"kwriteconfig6 --file kwinrc --group Plugins --key wobblywindowsEnabled {wobbly}")

        # Apply blur
        blur = "true" if self.blur_check.isChecked() else "false"
        self._kde_cmd(f"kwriteconfig6 --file kwinrc --group Plugins --key blurEnabled {blur}")

        # Animation speed
        speed = self.anim_slider.value()
        factor = speed / 5.0
        self._kde_cmd(f"kwriteconfig6 --file kdeglobals --group KDE --key AnimationDurationFactor {factor}")

        # Performance mode tweaks
        if self.settings["performance_mode"]:
            self._kde_cmd("kwriteconfig6 --file kwinrc --group Compositing --key AnimationSpeed 0")
            self._kde_cmd("kwriteconfig6 --file kwinrc --group Plugins --key blurEnabled false")
            self._kde_cmd("kwriteconfig6 --file kwinrc --group Plugins --key contrastEnabled false")
        else:
            self._kde_cmd("kwriteconfig6 --file kwinrc --group Compositing --key AnimationSpeed 3")

        # Reconfigure KWin
        self._kde_cmd("qdbus6 org.kde.KWin /KWin reconfigure 2>/dev/null || true")

    def _kde_cmd(self, cmd):
        try:
            subprocess.run(cmd, shell=True, capture_output=True, timeout=5)
        except Exception:
            pass

    def restore_defaults(self):
        reply = QMessageBox.question(self, "Restore Defaults",
                                    "Reset all settings to defaults?",
                                    QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No)
        if reply == QMessageBox.StandardButton.Yes:
            self.settings = DEFAULT_SETTINGS.copy()
            self.save_settings()
            QMessageBox.information(self, "✨ Restored!",
                                  "Settings restored to defaults. Please restart the Control Center.")
            self.close()


def main():
    app = QApplication(sys.argv)
    app.setApplicationName("HML Control Center")
    app.setOrganizationName("HML Reimagined")

    window = HMLControlCenter()
    window.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
