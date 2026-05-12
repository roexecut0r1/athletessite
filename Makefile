#═══════════════════════════════════════════════════════════════════
# ✨ HML Reimagined Master Makefile
# Orchestrates the entire build pipeline for the Linux distribution.
# Usage:
#   make all        - Build everything (assets, packages, ISO)
#   make assets     - Generate all wallpapers, sounds, icons, cursors
#   make debs       - Build Debian packages
#   make iso        - Build the final bootable ISO
#   make clean      - Remove build artifacts
#   make test-vm    - Test the ISO in QEMU (UEFI mode)
#   make test-sddm  - Test the SDDM login screen
#═══════════════════════════════════════════════════════════════════

.PHONY: all check-deps assets sounds icons cursors debs iso clean test-vm test-sddm

ISO_NAME=HML-Reimagined-1.0-amd64.iso

all: check-deps assets debs iso

check-deps:
	@echo "✨ Checking dependencies..."
	@which python3 >/dev/null || (echo "Missing python3" && exit 1)
	@python3 -c "import PIL" >/dev/null 2>&1 || (echo "Missing Pillow (pip install Pillow)" && exit 1)
	@which sox >/dev/null || (echo "Missing sox (sudo apt install sox)" && exit 1)
	@which dpkg-deb >/dev/null || (echo "Missing dpkg-deb" && exit 1)
	@which xorriso >/dev/null || (echo "Missing xorriso" && exit 1)
	@which mksquashfs >/dev/null || (echo "Missing squashfs-tools" && exit 1)
	@echo "✨ All dependencies found!"

assets: cursors icons sounds
	@echo "✨ Generating visual assets (wallpapers, boot screens)..."
	@python3 build-scripts/generate-assets.py

sounds:
	@echo "✨ Generating sound theme..."
	@bash build-scripts/generate-sounds.sh

icons:
	@echo "✨ Generating icon SVGs..."
	@python3 build-scripts/generate-icons.py

cursors:
	@echo "✨ Generating cursors..."
	@python3 build-scripts/generate-cursors.py
	@bash themes/cursors/hml-cursors/build/build-cursors.sh || echo "Warning: xcursorgen failed. Install x11-apps to build cursors."

debs: assets
	@echo "✨ Building Debian packages..."
	@bash packaging/build-debs.sh

iso: debs
	@echo "✨ Building Bootable ISO..."
	@sudo bash build-scripts/build-iso.sh

clean:
	@echo "✨ Cleaning build artifacts..."
	@rm -rf output/
	@rm -rf themes/cursors/hml-cursors/build/
	@rm -rf themes/cursors/hml-cursors/cursors/
	@rm -rf chroot/
	@echo "✨ Clean complete."

test-vm:
	@echo "✨ Launching QEMU UEFI Test..."
	@sudo bash build-scripts/test-qemu.sh output/$(ISO_NAME)

test-sddm:
	@echo "✨ Testing SDDM theme..."
	@sddm-greeter --test-mode --theme config/sddm/hml-theme
