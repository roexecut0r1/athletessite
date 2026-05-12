// ═══════════════════════════════════════════════════════════════════
// HML Reimagined — KDE Plasma Desktop Layout Script
// Configures the default panel, widgets, and desktop arrangement
// Placed in look-and-feel/hml.reimagined/contents/layouts/
// ═══════════════════════════════════════════════════════════════════

// Remove any existing panels/widgets
var allPanels = panels();
for (var i = 0; i < allPanels.length; i++) {
    allPanels[i].remove();
}

// ── Bottom panel (taskbar) ───────────────────────────────────────
var panel = new Panel("org.kde.panel");
panel.location = "bottom";
panel.height = 48;
panel.alignment = "center";
panel.hiding = "none";
panel.floating = true;

// App launcher (Kickoff)
var launcher = panel.addWidget("org.kde.plasma.kickoff");
launcher.currentConfigGroup = ["General"];
launcher.writeConfig("icon", "start-here-kde");
launcher.writeConfig("favoriteApps", [
    "org.kde.dolphin.desktop",
    "firefox.desktop",
    "org.kde.konsole.desktop",
    "org.kde.kate.desktop",
    "org.kde.discover.desktop",
    "systemsettings.desktop",
    "hml-control-center.desktop"
]);

// Pager (virtual desktops)
panel.addWidget("org.kde.plasma.pager");

// Task manager
var taskman = panel.addWidget("org.kde.plasma.icontasks");
taskman.currentConfigGroup = ["General"];
taskman.writeConfig("launchers", [
    "applications:org.kde.dolphin.desktop",
    "applications:firefox.desktop",
    "applications:org.kde.konsole.desktop",
    "applications:org.kde.kate.desktop"
]);
taskman.writeConfig("groupingStrategy", 1);
taskman.writeConfig("showOnlyCurrentDesktop", false);

// Spacer
panel.addWidget("org.kde.plasma.panelspacer");

// System tray
var systray = panel.addWidget("org.kde.plasma.systemtray");

// Digital clock
var clock = panel.addWidget("org.kde.plasma.digitalclock");
clock.currentConfigGroup = ["Appearance"];
clock.writeConfig("showDate", true);
clock.writeConfig("dateFormat", "shortDate");
clock.writeConfig("use24hFormat", 0);

// Show desktop button
panel.addWidget("org.kde.plasma.showdesktop");

// ── Desktop settings ─────────────────────────────────────────────
// Set wallpaper
var allDesktops = desktops();
for (var d = 0; d < allDesktops.length; d++) {
    allDesktops[d].wallpaperPlugin = "org.kde.image";
    allDesktops[d].currentConfigGroup = ["Wallpaper", "org.kde.image", "General"];
    allDesktops[d].writeConfig("Image", "/usr/share/wallpapers/HML-Reimagined/contents/images/modern/hml-modern-4k.png");
    allDesktops[d].writeConfig("FillMode", 1); // Scaled and cropped
}

// ── Configure 2 virtual desktops ─────────────────────────────────
workspace.desktops = 2;
workspace.desktopName(0, "✨ Desktop 1");
workspace.desktopName(1, "💎 Desktop 2");
