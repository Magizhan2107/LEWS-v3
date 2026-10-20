const fs = require('fs');
const path = require('path');

// 1. Update index.css
const cssContent = `@import "tailwindcss";

:root {
  --bg-canvas: #172331;        /* Level 1: Deep Himalayan Navy */
  --bg-panel: #203447;         /* Level 2: Panel Slate */
  --bg-card: #263E52;          /* Level 3: Mountain Card Slate */
  --bg-card-alt: #314A5E;      /* Secondary Card Surface */
  --border-ice: rgba(191, 213, 226, 0.12); /* Subtle 12% Ice Blue Border */
  --text-main: #F2F7FA;        /* Snow White */
  --text-muted: #526D82;       /* Atmospheric Blue */
  --text-highlight: #BFD5E2;   /* Ice Blue */
  --accent-cyan: #3B82A0;      /* Monitoring Cyan (Active / Interactive) */
  --status-safe: #38A169;      /* Safe Green (Low Risk) */
  --status-watch: #E6A23C;     /* Watch Amber (Moderate Risk) */
  --status-critical: #D94B4B;  /* Critical Red (High Risk) */
}

html, body, #root {
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: var(--bg-canvas) !important;
  color: var(--text-main);
  font-family: 'Inter', sans-serif;
}

/* Monospace font strict enforcement for telemetry */
.font-mono, .telemetry-data, .coordinate-text, .timestamp-text {
  font-family: 'IBM Plex Mono', monospace !important;
}

/* Custom Risk Pulse Keyframes */
@keyframes riskPulseRed {
  0% { box-shadow: 0 0 0 0 rgba(217, 75, 75, 0.7); }
  70% { box-shadow: 0 0 0 12px rgba(217, 75, 75, 0); }
  100% { box-shadow: 0 0 0 0 rgba(217, 75, 75, 0); }
}

@keyframes riskPulseAmber {
  0% { box-shadow: 0 0 0 0 rgba(230, 162, 60, 0.6); }
  70% { box-shadow: 0 0 0 8px rgba(230, 162, 60, 0); }
  100% { box-shadow: 0 0 0 0 rgba(230, 162, 60, 0); }
}

.pulse-critical {
  animation: riskPulseRed 2.5s infinite;
}

.pulse-watch {
  animation: riskPulseAmber 3s infinite;
}

/* MapLibre Container Tinting */
.maplibregl-canvas-container {
  background-color: var(--bg-canvas) !important;
}
.maplibregl-canvas {
  filter: brightness(0.65) contrast(1.25) grayscale(0.75) sepia(0.2) hue-rotate(175deg) !important;
}

/* Leaflet Container Tinting */
.leaflet-container {
  background-color: #172331 !important;
}

.leaflet-tile-pane {
  filter: brightness(0.65) contrast(1.25) grayscale(0.75) sepia(0.2) hue-rotate(175deg) !important;
}

.leaflet-popup-content-wrapper, .leaflet-popup-tip {
  background-color: #203447 !important;
  color: #F2F7FA !important;
  border: 1px solid rgba(191, 213, 226, 0.2) !important;
  border-radius: 12px !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5) !important;
}

.leaflet-popup-content {
  font-family: 'Inter', sans-serif !important;
  font-size: 13px !important;
}

.leaflet-control-zoom a {
  background-color: #203447 !important;
  color: #BFD5E2 !important;
  border-color: rgba(191, 213, 226, 0.2) !important;
}

.leaflet-control-zoom a:hover {
  background-color: #314A5E !important;
  color: #FFFFFF !important;
}
`;

fs.writeFileSync('landslide_system/frontend/src/index.css', cssContent);

function replaceAll(file, replacements) {
    let content = fs.readFileSync(file, 'utf8');
    for (const [r, s] of replacements) {
        content = content.replace(r, s);
    }
    fs.writeFileSync(file, content);
}

// 2. RiskMap.tsx updates
replaceAll('landslide_system/frontend/src/components/RiskMap.tsx', [
    [
        `{/* Topographic Overlay */}
      <div className="absolute inset-0 bg-[url('/images/contours.png')] opacity-10 pointer-events-none z-0" />`,
        `{/* Topographic Overlay */}
      <div className="pointer-events-none absolute inset-0 z-[400] opacity-12 bg-[radial-gradient(#BFD5E2_1px,transparent_1px)] [background-size:16px_16px] overflow-hidden" />`
    ],
    [
        `DATA STREAM ACTIVE | 24 SENSORS ONLINE | LAST UPDATE UTC {new Date().toLocaleTimeString('en-US', { hour12: false, timeZone: 'UTC' })}`,
        `DATA STREAM ACTIVE | 24 SENSORS ONLINE | MONITORED ZONES: 20 | UTC {new Date().toLocaleTimeString('en-US', { hour12: false, timeZone: 'UTC' })}`
    ]
]);

console.log("Index CSS and Map overlays updated!");
