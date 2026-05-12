// ═══════════════════════════════════════════════════════════════════
// HML Reimagined — Shutdown/Logout Splash Screen
// Displayed during system shutdown or user logout
// ═══════════════════════════════════════════════════════════════════
import QtQuick 2.15

Rectangle {
    id: root
    width: Screen.width
    height: Screen.height
    color: "#0D0510"
    
    // Gradient overlay
    Rectangle {
        anchors.fill: parent
        gradient: Gradient {
            GradientStop { position: 0.0; color: "#1A0A2E" }
            GradientStop { position: 0.5; color: "#0D0510" }
            GradientStop { position: 1.0; color: "#080310" }
        }
    }

    // Sparkle particles
    Repeater {
        model: 20
        Rectangle {
            x: Math.random() * root.width
            y: Math.random() * root.height
            width: Math.random() * 3 + 1
            height: width
            radius: width / 2
            color: "white"
            opacity: 0

            SequentialAnimation on opacity {
                loops: Animation.Infinite
                PauseAnimation { duration: Math.random() * 3000 }
                NumberAnimation { to: Math.random() * 0.5 + 0.1; duration: 800; easing.type: Easing.InOutQuad }
                NumberAnimation { to: 0; duration: 800; easing.type: Easing.InOutQuad }
            }
        }
    }

    // Center content
    Column {
        anchors.centerIn: parent
        spacing: 24

        Text {
            anchors.horizontalCenter: parent.horizontalCenter
            text: "✨"
            font.pixelSize: 48
            opacity: fadeAnim.opacity
        }

        Text {
            id: goodbyeText
            anchors.horizontalCenter: parent.horizontalCenter
            text: "See you next time, superstar!"
            font.pixelSize: 24
            font.family: "Inter"
            font.weight: Font.Light
            color: "#E0CCE6"
            opacity: fadeAnim.opacity
        }

        // Loading spinner
        Rectangle {
            anchors.horizontalCenter: parent.horizontalCenter
            width: 32
            height: 32
            radius: 16
            color: "transparent"
            border.width: 3
            border.color: "#FF1493"
            opacity: 0.8

            Rectangle {
                width: 8
                height: 8
                radius: 4
                color: "#FF1493"
                anchors.top: parent.top
                anchors.horizontalCenter: parent.horizontalCenter
                anchors.topMargin: -1
            }

            RotationAnimation on rotation {
                from: 0
                to: 360
                duration: 1200
                loops: Animation.Infinite
                running: true
            }
        }
    }

    // Fade in animation
    NumberAnimation {
        id: fadeAnim
        target: root
        property: "opacity"
        from: 0
        to: 1
        duration: 500
        running: true
        easing.type: Easing.InOutQuad
    }
}
