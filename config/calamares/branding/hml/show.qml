// ═══════════════════════════════════════════════════════════════════
// HML Reimagined — Calamares Installer Slideshow
// Fun, branded slideshow during installation
// ═══════════════════════════════════════════════════════════════════
import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15

Presentation {
    id: presentation
    
    Timer {
        interval: 8000
        running: true
        repeat: true
        onTriggered: presentation.goToNextSlide()
    }

    // ── Slide 1: Welcome ─────────────────────────────────────────
    Slide {
        Rectangle {
            anchors.fill: parent
            gradient: Gradient {
                GradientStop { position: 0.0; color: "#1A0A2E" }
                GradientStop { position: 1.0; color: "#0D0510" }
            }
            
            Column {
                anchors.centerIn: parent
                spacing: 20
                
                Text {
                    anchors.horizontalCenter: parent.horizontalCenter
                    text: "✨"
                    font.pixelSize: 64
                }
                
                Text {
                    anchors.horizontalCenter: parent.horizontalCenter
                    text: "Welcome to HML Reimagined!"
                    font.pixelSize: 32
                    font.bold: true
                    color: "#FF1493"
                }
                
                Text {
                    anchors.horizontalCenter: parent.horizontalCenter
                    text: "Sit back and relax while we set up\nyour fabulous new desktop."
                    font.pixelSize: 16
                    color: "#E0CCE6"
                    horizontalAlignment: Text.AlignHCenter
                    lineHeight: 1.5
                }
            }
        }
    }

    // ── Slide 2: What's Included ─────────────────────────────────
    Slide {
        Rectangle {
            anchors.fill: parent
            gradient: Gradient {
                GradientStop { position: 0.0; color: "#1A0A2E" }
                GradientStop { position: 1.0; color: "#0D0510" }
            }
            
            Column {
                anchors.centerIn: parent
                spacing: 16
                
                Text {
                    anchors.horizontalCenter: parent.horizontalCenter
                    text: "💎 Everything You Need"
                    font.pixelSize: 28
                    font.bold: true
                    color: "#FF1493"
                }
                
                Text {
                    anchors.horizontalCenter: parent.horizontalCenter
                    text: "• Firefox — browse in style\n• LibreOffice — get work done\n• VLC — play any media\n• GIMP & Krita — unleash creativity\n• Steam — game on\n• Flatpak — thousands more apps"
                    font.pixelSize: 15
                    color: "#E0CCE6"
                    lineHeight: 1.8
                }
            }
        }
    }

    // ── Slide 3: Customization ───────────────────────────────────
    Slide {
        Rectangle {
            anchors.fill: parent
            gradient: Gradient {
                GradientStop { position: 0.0; color: "#1A0A2E" }
                GradientStop { position: 1.0; color: "#0D0510" }
            }
            
            Column {
                anchors.centerIn: parent
                spacing: 16
                
                Text {
                    anchors.horizontalCenter: parent.horizontalCenter
                    text: "🎨 Make It Yours"
                    font.pixelSize: 28
                    font.bold: true
                    color: "#E040FB"
                }
                
                Text {
                    anchors.horizontalCenter: parent.horizontalCenter
                    text: "Use the HML Control Center to switch between:\n\n🌟 Classic HML — maximum nostalgia\n💎 Modern HML — polished daily driver\n🌙 Dark Glam — neon gamer aesthetic\n\nToggle sounds, effects, and wallpapers\nwith a single click!"
                    font.pixelSize: 15
                    color: "#E0CCE6"
                    horizontalAlignment: Text.AlignHCenter
                    lineHeight: 1.6
                }
            }
        }
    }

    // ── Slide 4: Modern & Secure ─────────────────────────────────
    Slide {
        Rectangle {
            anchors.fill: parent
            gradient: Gradient {
                GradientStop { position: 0.0; color: "#1A0A2E" }
                GradientStop { position: 1.0; color: "#0D0510" }
            }
            
            Column {
                anchors.centerIn: parent
                spacing: 16
                
                Text {
                    anchors.horizontalCenter: parent.horizontalCenter
                    text: "🔒 Modern & Secure"
                    font.pixelSize: 28
                    font.bold: true
                    color: "#9C27B0"
                }
                
                Text {
                    anchors.horizontalCenter: parent.horizontalCenter
                    text: "Built on Ubuntu 24.04 LTS\n\n• Full UEFI & Secure Boot support\n• PipeWire audio for perfect sound\n• Latest kernel for modern hardware\n• NVIDIA driver helper included\n• Wayland for smooth graphics\n• Automatic security updates"
                    font.pixelSize: 15
                    color: "#E0CCE6"
                    horizontalAlignment: Text.AlignHCenter
                    lineHeight: 1.6
                }
            }
        }
    }

    // ── Slide 5: Almost Done ─────────────────────────────────────
    Slide {
        Rectangle {
            anchors.fill: parent
            gradient: Gradient {
                GradientStop { position: 0.0; color: "#1A0A2E" }
                GradientStop { position: 1.0; color: "#0D0510" }
            }
            
            Column {
                anchors.centerIn: parent
                spacing: 20
                
                Text {
                    anchors.horizontalCenter: parent.horizontalCenter
                    text: "✨✨✨"
                    font.pixelSize: 48
                }
                
                Text {
                    anchors.horizontalCenter: parent.horizontalCenter
                    text: "You Got The Best of Both Worlds!"
                    font.pixelSize: 28
                    font.bold: true
                    color: "#FF1493"
                }
                
                Text {
                    anchors.horizontalCenter: parent.horizontalCenter
                    text: "Installation is almost complete.\nYour superstar desktop is nearly ready!"
                    font.pixelSize: 16
                    color: "#E0CCE6"
                    horizontalAlignment: Text.AlignHCenter
                    lineHeight: 1.5
                }
            }
        }
    }
}
