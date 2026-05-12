// ═══════════════════════════════════════════════════════════════════
// HML Reimagined — Splash Screen (KSplash)
// Shown during Plasma desktop loading
// ═══════════════════════════════════════════════════════════════════
import QtQuick 2.15

Rectangle {
    id: root
    width: Screen.width
    height: Screen.height
    color: "#0D0510"

    property int stage: 0

    onStageChanged: {
        if (stage === 1) {
            introAnim.running = true
        } else if (stage === 6) {
            fadeOutAnim.running = true
        }
    }

    // Gradient background
    Rectangle {
        anchors.fill: parent
        gradient: Gradient {
            GradientStop { position: 0.0; color: "#1A0A2E" }
            GradientStop { position: 1.0; color: "#0D0510" }
        }
    }

    // Sparkles
    Repeater {
        model: 25
        Rectangle {
            x: Math.random() * root.width
            y: Math.random() * root.height
            width: Math.random() * 2 + 1
            height: width
            radius: width / 2
            color: "white"
            opacity: 0

            SequentialAnimation on opacity {
                loops: Animation.Infinite
                PauseAnimation { duration: Math.random() * 4000 }
                NumberAnimation { to: Math.random() * 0.4 + 0.1; duration: 1000 }
                NumberAnimation { to: 0; duration: 1000 }
            }
        }
    }

    // Logo and text
    Column {
        id: centerContent
        anchors.centerIn: parent
        spacing: 16
        opacity: 0

        Text {
            anchors.horizontalCenter: parent.horizontalCenter
            text: "✨"
            font.pixelSize: 56
        }

        Text {
            anchors.horizontalCenter: parent.horizontalCenter
            text: "HML Reimagined"
            font.pixelSize: 32
            font.weight: Font.Bold
            font.family: "Inter"
            color: "#FF1493"
        }

        Text {
            anchors.horizontalCenter: parent.horizontalCenter
            text: "Loading your superstar desktop..."
            font.pixelSize: 14
            font.family: "Inter"
            color: "#8C7896"
        }

        // Progress dots
        Row {
            anchors.horizontalCenter: parent.horizontalCenter
            spacing: 8

            Repeater {
                model: 6
                Rectangle {
                    width: 8
                    height: 8
                    radius: 4
                    color: index < root.stage ? "#FF1493" : "#2D1540"
                    Behavior on color { ColorAnimation { duration: 300 } }
                }
            }
        }
    }

    // Intro animation
    NumberAnimation {
        id: introAnim
        target: centerContent
        property: "opacity"
        from: 0
        to: 1
        duration: 600
        easing.type: Easing.InOutQuad
    }

    // Fade out when desktop is ready
    NumberAnimation {
        id: fadeOutAnim
        target: root
        property: "opacity"
        from: 1
        to: 0
        duration: 400
        easing.type: Easing.InOutQuad
    }
}
