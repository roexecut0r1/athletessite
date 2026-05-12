#!/usr/bin/env bash
#═══════════════════════════════════════════════════════════════════
# HML Reimagined — LibreOffice Template Installer
# Creates branded LibreOffice templates with HML colors
#═══════════════════════════════════════════════════════════════════
set -euo pipefail

PINK='\033[38;5;205m'
RESET='\033[0m'
log() { echo -e "${PINK}✨ $1${RESET}"; }

TEMPLATE_DIR="/usr/share/templates/hml-reimagined"
LO_TEMPLATE_DIR="/usr/lib/libreoffice/share/template/common"

log "Setting up LibreOffice HML templates..."

mkdir -p "${TEMPLATE_DIR}"

# ── LibreOffice registrymodifications for HML colors ──────────
# This sets the default document colors for new documents
SKEL_LO="${1:-/etc/skel}/.config/libreoffice/4/user"
mkdir -p "${SKEL_LO}"

cat > "${SKEL_LO}/registrymodifications.xcu" << 'LOCONFIG'
<?xml version="1.0" encoding="UTF-8"?>
<oor:items xmlns:oor="http://openoffice.org/2001/registry"
           xmlns:xs="http://www.w3.org/2001/XMLSchema"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">

  <!-- Application colors -->
  <item oor:path="/org.openoffice.Office.UI/ColorScheme/ColorSchemes">
    <node oor:name="HML Reimagined" oor:op="replace">
      <prop oor:name="DocColor"><value>1181470</value></prop>
      <prop oor:name="DocBoundaries"><value>5906694</value></prop>
      <prop oor:name="AppBackground"><value>853008</value></prop>
      <prop oor:name="ObjectBoundaries"><value>10223871</value></prop>
      <prop oor:name="TableBoundaries"><value>10223871</value></prop>
      <prop oor:name="FontColor"><value>14733542</value></prop>
      <prop oor:name="Links"><value>14712059</value></prop>
      <prop oor:name="LinksVisited"><value>10231472</value></prop>
      <prop oor:name="Spell"><value>16724787</value></prop>
      <prop oor:name="SmartTags"><value>14712059</value></prop>
      <prop oor:name="WriterTextGrid"><value>10223871</value></prop>
      <prop oor:name="WriterFieldShadings"><value>2691382</value></prop>
      <prop oor:name="WriterIdxShadings"><value>2691382</value></prop>
      <prop oor:name="WriterDirectCursor"><value>16724787</value></prop>
      <prop oor:name="WriterScriptIndicator"><value>16724787</value></prop>
      <prop oor:name="WriterSectionBoundaries"><value>10223871</value></prop>
      <prop oor:name="WriterPageBreaks"><value>5906694</value></prop>
      <prop oor:name="HTMLSGML"><value>16724787</value></prop>
      <prop oor:name="HTMLComment"><value>10223871</value></prop>
      <prop oor:name="HTMLKeyword"><value>14712059</value></prop>
      <prop oor:name="HTMLUnknown"><value>16724787</value></prop>
      <prop oor:name="CalcGrid"><value>2691382</value></prop>
      <prop oor:name="CalcPageBreak"><value>5906694</value></prop>
      <prop oor:name="CalcPageBreakManual"><value>16724787</value></prop>
      <prop oor:name="CalcPageBreakAutomatic"><value>10223871</value></prop>
      <prop oor:name="CalcDetective"><value>16724787</value></prop>
      <prop oor:name="CalcDetectiveError"><value>16724787</value></prop>
      <prop oor:name="CalcReference"><value>14712059</value></prop>
      <prop oor:name="CalcNotesBackground"><value>2691382</value></prop>
      <prop oor:name="DrawGrid"><value>5906694</value></prop>
    </node>
  </item>
  
  <!-- Use dark document background -->
  <item oor:path="/org.openoffice.Office.Common/Accessibility">
    <prop oor:name="IsAutomaticFontColor" oor:type="xs:boolean">
      <value>false</value>
    </prop>
  </item>

</oor:items>
LOCONFIG

log "LibreOffice HML color scheme installed"
log "Templates directory: ${TEMPLATE_DIR}"
echo ""
echo "Users will see HML colors in LibreOffice by default."
echo "Custom templates can be added to: ${TEMPLATE_DIR}"
