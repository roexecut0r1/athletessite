// ═══════════════════════════════════════════════════════════════════
// HML Reimagined — SDDM Login Screen Theme
// Glassmorphism login panel with pink/purple glow
// ═══════════════════════════════════════════════════════════════════
import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15
import SddmComponents 2.0

Rectangle {
    id: root
    width: Screen.width
    height: Screen.height

    // ── Theme Colors ─────────────────────────────────────────────
    readonly property color hmlPink: "#FF1493"
    readonly property color hmlPurple: "#9C27B0"
    readonly property color hmlMagenta: "#E040FB"
    readonly property color hmlDark: "#0D0510"
    readonly property color hmlSilver: "#E0CCE6"
    readonly property color hmlGlass: Qt.rgba(0.15, 0.05, 0.2, 0.65)

    TextConstants { id: textConstants }

    // ── Background ───────────────────────────────────────────────
    Image {
        id: backgroundImage
        anchors.fill: parent
        source: "background.png"
        fillMode: Image.PreserveAspectCrop
        smooth: true

        // Fallback gradient if no image
        Rectangle {
            anchors.fill: parent
            visible: backgroundImage.status !== Image.Ready
            gradient: Gradient {
                GradientStop { position: 0.0; color: "#1A0A2E" }
                GradientStop { position: 0.5; color: "#16082A" }
                GradientStop { position: 1.0; color: "#0D0510" }
            }
        }
    }

    // Overlay for depth
    Rectangle {
        anchors.fill: parent
        color: Qt.rgba(0, 0, 0, 0.2)
    }

    // ── Sparkle particles (decorative) ───────────────────────────
    Repeater {
        model: 30
        Rectangle {
            id: sparkle
            x: Math.random() * root.width
            y: Math.random() * root.height
            width: Math.random() * 3 + 1
            height: width
            radius: width / 2
            color: Qt.rgba(1, 1, 1, Math.random() * 0.5 + 0.1)
            opacity: 0

            SequentialAnimation on opacity {
                loops: Animation.Infinite
                PauseAnimation { duration: Math.random() * 5000 }
                NumberAnimation { to: Math.random() * 0.6 + 0.2; duration: 1000 + Math.random() * 2000; easing.type: Easing.InOutQuad }
                NumberAnimation { to: 0; duration: 1000 + Math.random() * 2000; easing.type: Easing.InOutQuad }
            }
        }
    }

    // ── Clock ────────────────────────────────────────────────────
    Column {
        anchors.top: parent.top
        anchors.topMargin: 60
        anchors.horizontalCenter: parent.horizontalCenter
        spacing: 4

        Text {
            id: timeLabel
            anchors.horizontalCenter: parent.horizontalCenter
            font.pixelSize: 72
            font.weight: Font.Light
            font.family: "Inter"
            color: root.hmlSilver
            
            Timer {
                interval: 1000
                running: true
                repeat: true
                triggeredOnStart: true
                onTriggered: {
                    var now = new Date();
                    timeLabel.text = Qt.formatTime(now, "hh:mm");
                    dateLabel.text = Qt.formatDate(now, "dddd, MMMM d, yyyy");
                }
            }
        }

        Text {
            id: dateLabel
            anchors.horizontalCenter: parent.horizontalCenter
            font.pixelSize: 18
            font.family: "Inter"
            color: Qt.rgba(root.hmlSilver.r, root.hmlSilver.g, root.hmlSilver.b, 0.7)
        }
    }

    // ── Login Panel ──────────────────────────────────────────────
    Rectangle {
        id: loginPanel
        anchors.centerIn: parent
        width: 380
        height: 420
        radius: 24
        color: root.hmlGlass
        border.width: 1
        border.color: Qt.rgba(root.hmlPurple.r, root.hmlPurple.g, root.hmlPurple.b, 0.3)

        // Glow effect
        Rectangle {
            anchors.fill: parent
            anchors.margins: -2
            radius: 26
            color: "transparent"
            border.width: 2
            border.color: Qt.rgba(root.hmlPink.r, root.hmlPink.g, root.hmlPink.b, 0.15)
            z: -1
        }

        Column {
            anchors.fill: parent
            anchors.margins: 40
            spacing: 20

            // Logo / Title
            Text {
                anchors.horizontalCenter: parent.horizontalCenter
                text: "✨"
                font.pixelSize: 40
            }

            Text {
                anchors.horizontalCenter: parent.horizontalCenter
                text: "HML Reimagined"
                font.pixelSize: 22
                font.weight: Font.Bold
                font.family: "Inter"
                color: root.hmlPink
            }

            // Spacer
            Item { width: 1; height: 10 }

            // Username field
            TextField {
                id: usernameField
                width: parent.width
                height: 44
                placeholderText: "Username"
                font.pixelSize: 14
                font.family: "Inter"
                color: root.hmlSilver
                
                background: Rectangle {
                    radius: 12
                    color: Qt.rgba(1, 1, 1, 0.06)
                    border.width: 1
                    border.color: usernameField.activeFocus ? 
                        root.hmlPink : Qt.rgba(root.hmlPurple.r, root.hmlPurple.g, root.hmlPurple.b, 0.3)
                    
                    Behavior on border.color {
                        ColorAnimation { duration: 200 }
                    }
                }

                Keys.onReturnPressed: passwordField.forceActiveFocus()
                Component.onCompleted: {
                    if (userModel.lastUser) {
                        text = userModel.lastUser;
                        passwordField.forceActiveFocus();
                    }
                }
            }

            // Password field
            TextField {
                id: passwordField
                width: parent.width
                height: 44
                placeholderText: "Password"
                echoMode: TextInput.Password
                font.pixelSize: 14
                font.family: "Inter"
                color: root.hmlSilver

                background: Rectangle {
                    radius: 12
                    color: Qt.rgba(1, 1, 1, 0.06)
                    border.width: 1
                    border.color: passwordField.activeFocus ? 
                        root.hmlPink : Qt.rgba(root.hmlPurple.r, root.hmlPurple.g, root.hmlPurple.b, 0.3)
                    
                    Behavior on border.color {
                        ColorAnimation { duration: 200 }
                    }
                }

                Keys.onReturnPressed: loginButton.clicked()
            }

            // Login button
            Button {
                id: loginButton
                width: parent.width
                height: 44
                text: "✨ Login"
                font.pixelSize: 15
                font.weight: Font.Bold
                font.family: "Inter"

                contentItem: Text {
                    text: loginButton.text
                    font: loginButton.font
                    color: "white"
                    horizontalAlignment: Text.AlignHCenter
                    verticalAlignment: Text.AlignVCenter
                }

                background: Rectangle {
                    radius: 12
                    gradient: Gradient {
                        orientation: Gradient.Horizontal
                        GradientStop { position: 0.0; color: root.hmlPink }
                        GradientStop { position: 1.0; color: root.hmlPurple }
                    }
                    opacity: loginButton.pressed ? 0.8 : (loginButton.hovered ? 0.95 : 1.0)
                    
                    Behavior on opacity {
                        NumberAnimation { duration: 100 }
                    }
                }

                onClicked: {
                    sddm.login(usernameField.text, passwordField.text, sessionList.currentIndex)
                }
            }

            // Error message
            Text {
                id: errorMessage
                anchors.horizontalCenter: parent.horizontalCenter
                font.pixelSize: 12
                font.family: "Inter"
                color: "#FF6B9D"
                visible: text !== ""
            }
        }
    }

    // ── Session selector ─────────────────────────────────────────
    ComboBox {
        id: sessionList
        anchors.bottom: parent.bottom
        anchors.bottomMargin: 30
        anchors.right: parent.right
        anchors.rightMargin: 30
        width: 180
        height: 36
        model: sessionModel
        currentIndex: sessionModel.lastIndex
        font.pixelSize: 12
        font.family: "Inter"
        
        background: Rectangle {
            radius: 8
            color: root.hmlGlass
            border.width: 1
            border.color: Qt.rgba(root.hmlPurple.r, root.hmlPurple.g, root.hmlPurple.b, 0.3)
        }

        contentItem: Text {
            text: sessionList.displayText
            color: root.hmlSilver
            font: sessionList.font
            leftPadding: 12
            verticalAlignment: Text.AlignVCenter
        }
    }

    // ── Power buttons ────────────────────────────────────────────
    Row {
        anchors.bottom: parent.bottom
        anchors.bottomMargin: 30
        anchors.left: parent.left
        anchors.leftMargin: 30
        spacing: 15

        // Shutdown
        Button {
            width: 36; height: 36
            contentItem: Text {
                text: "⏻"
                font.pixelSize: 18
                color: root.hmlSilver
                horizontalAlignment: Text.AlignHCenter
                verticalAlignment: Text.AlignVCenter
            }
            background: Rectangle {
                radius: 18
                color: parent.hovered ? Qt.rgba(root.hmlPink.r, root.hmlPink.g, root.hmlPink.b, 0.3) : "transparent"
            }
            onClicked: sddm.powerOff()
        }

        // Restart
        Button {
            width: 36; height: 36
            contentItem: Text {
                text: "↻"
                font.pixelSize: 20
                color: root.hmlSilver
                horizontalAlignment: Text.AlignHCenter
                verticalAlignment: Text.AlignVCenter
            }
            background: Rectangle {
                radius: 18
                color: parent.hovered ? Qt.rgba(root.hmlPink.r, root.hmlPink.g, root.hmlPink.b, 0.3) : "transparent"
            }
            onClicked: sddm.reboot()
        }

        // Suspend
        Button {
            width: 36; height: 36
            contentItem: Text {
                text: "⏾"
                font.pixelSize: 18
                color: root.hmlSilver
                horizontalAlignment: Text.AlignHCenter
                verticalAlignment: Text.AlignVCenter
            }
            background: Rectangle {
                radius: 18
                color: parent.hovered ? Qt.rgba(root.hmlPink.r, root.hmlPink.g, root.hmlPink.b, 0.3) : "transparent"
            }
            onClicked: sddm.suspend()
        }
    }

    // ── Connection handlers ──────────────────────────────────────
    Connections {
        target: sddm
        function onLoginSucceeded() {
            errorMessage.text = ""
        }
        function onLoginFailed() {
            errorMessage.text = "✨ Oops! Wrong password, superstar!"
            passwordField.text = ""
            passwordField.forceActiveFocus()
        }
    }
}
