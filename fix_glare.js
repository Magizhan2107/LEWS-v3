const fs = require('fs');

// 1. Update riskStyles.ts
let riskStylesContent = fs.readFileSync('landslide_system/frontend/src/utils/riskStyles.ts', 'utf8');

const newRiskStyles = `export interface RiskStyle {
  id: string;
  label: string;
  fillColor: string;
  outlineColor: string;
  markerColor: string;
  textColor: string;
  badgeBg: string;
}

export const getUnifiedRisk = (target: any): 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | 'UNKNOWN' => {
  if (!target) return 'UNKNOWN';
  const riskStr = String(
    target.dynamic_risk || 
    target.risk_level || 
    target.risk ||
    target.severity || 
    target.class || 
    target.properties?.dynamic_risk ||
    target.properties?.risk_level ||
    target.properties?.risk ||
    ''
  ).toUpperCase();

  if (!riskStr) return 'UNKNOWN';
  if (riskStr.includes('CRIT')) return 'CRITICAL';
  if (riskStr.includes('HIGH') || riskStr.includes('RED')) return 'HIGH';
  if (riskStr.includes('MOD') || riskStr.includes('AMBER') || riskStr.includes('WATCH')) return 'MODERATE';
  return 'LOW';
};

export const RISK_LEVELS: Record<string, RiskStyle> = {
  'LOW': {
    id: 'LOW',
    label: 'Low Risk',
    fillColor: '#38A169',
    outlineColor: '#3B82A0',
    markerColor: '#38A169',
    textColor: 'text-[#38A169]',
    badgeBg: 'bg-[#38A169]/10',
  },
  'MODERATE': {
    id: 'MODERATE',
    label: 'Moderate Risk',
    fillColor: '#E6A23C',
    outlineColor: '#E6A23C',
    markerColor: '#E6A23C',
    textColor: 'text-[#E6A23C]',
    badgeBg: 'bg-[#E6A23C]/10',
  },
  'HIGH': {
    id: 'HIGH',
    label: 'High Risk',
    fillColor: '#D94B4B',
    outlineColor: '#D94B4B',
    markerColor: '#D94B4B',
    textColor: 'text-[#D94B4B]',
    badgeBg: 'bg-[#D94B4B]/10',
  },
  'CRITICAL': {
    id: 'CRITICAL',
    label: 'Critical Risk',
    fillColor: '#D94B4B',
    outlineColor: '#D94B4B',
    markerColor: '#D94B4B',
    textColor: 'text-[#D94B4B]',
    badgeBg: 'bg-[#D94B4B]/10',
  },
  'UNKNOWN': {
    id: 'UNKNOWN',
    label: 'Unknown',
    fillColor: '#94a3b8',
    outlineColor: '#475569',
    markerColor: '#94a3b8',
    textColor: 'text-slate-400',
    badgeBg: 'bg-slate-800/50',
  }
};

export const getRiskStyle = (targetOrLevel: any): RiskStyle => {
  if (typeof targetOrLevel === 'string') {
     const unified = getUnifiedRisk({ risk_level: targetOrLevel });
     return RISK_LEVELS[unified];
  }
  const unified = getUnifiedRisk(targetOrLevel);
  return RISK_LEVELS[unified];
};

export const getMapPaintMatchExpression = (property: string, fallbackColor: string, styleKey: keyof RiskStyle): any => {
  return [
    'match',
    ['upcase', ['get', property]],
    'LOW', RISK_LEVELS['LOW'][styleKey],
    'MODERATE', RISK_LEVELS['MODERATE'][styleKey],
    'HIGH', RISK_LEVELS['HIGH'][styleKey],
    'CRITICAL', RISK_LEVELS['CRITICAL'][styleKey],
    fallbackColor
  ];
};
`;

fs.writeFileSync('landslide_system/frontend/src/utils/riskStyles.ts', newRiskStyles);


// 2. Update Sidebar.tsx to use getUnifiedRisk and getRiskStyle correctly
let sidebarContent = fs.readFileSync('landslide_system/frontend/src/components/Sidebar.tsx', 'utf8');

sidebarContent = sidebarContent.replace(/import \{ getRiskStyle \} from '\.\.\/utils\/riskStyles';/, "import { getRiskStyle, getUnifiedRisk } from '../utils/riskStyles';");

sidebarContent = sidebarContent.replace(/const locRiskStr = loc\.dynamic_risk \|\| loc\.risk_level \|\| loc\.risk \|\| loc\.properties\?\.dynamic_risk \|\| loc\.properties\?\.risk_level \|\| loc\.properties\?\.risk \|\| 'UNKNOWN';/g, 
  "const locRiskStr = getUnifiedRisk(loc);");

sidebarContent = sidebarContent.replace(/const riskStr = loc\.dynamic_risk \|\| loc\.risk_level \|\| loc\.risk \|\| loc\.properties\?\.dynamic_risk \|\| loc\.properties\?\.risk_level \|\| loc\.properties\?\.risk \|\| 'UNKNOWN';/g, 
  "const riskStr = getUnifiedRisk(loc);");

sidebarContent = sidebarContent.replace(/const style = getRiskStyle\(riskStr\);/g, 
  "const style = getRiskStyle(loc);");

fs.writeFileSync('landslide_system/frontend/src/components/Sidebar.tsx', sidebarContent);


// 3. Update RiskMap.tsx styling boundaries
let riskMapContent = fs.readFileSync('landslide_system/frontend/src/components/RiskMap.tsx', 'utf8');
const boundaryOverride = `
          if (map.getLayer('admin-0-boundary')) {
            map.setPaintProperty('admin-0-boundary', 'line-color', '#38BDF8');
            map.setPaintProperty('admin-0-boundary', 'line-width', 1.5);
            map.setPaintProperty('admin-0-boundary', 'line-opacity', 0.85);
          }
`;

if (!riskMapContent.includes("map.setPaintProperty('admin-0-boundary'")) {
    riskMapContent = riskMapContent.replace("map.addLayer({", boundaryOverride + "\n          map.addLayer({");
    fs.writeFileSync('landslide_system/frontend/src/components/RiskMap.tsx', riskMapContent);
}


// 4. Update index.css with Map Borders
let cssContent = fs.readFileSync('landslide_system/frontend/src/index.css', 'utf8');

const borderStyles = `
/* High-contrast container border for sunlight visibility */
.map-container-wrapper,
.leaflet-container,
.maplibregl-map {
  border: 1px solid #00F0FF !important;
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.25) !important;
}

/* High-contrast map control overlays and legend boxes */
.map-control-overlay,
.map-legend-box {
  border: 1px solid #38BDF8 !important;
  background-color: rgba(15, 23, 36, 0.92) !important;
  backdrop-filter: blur(6px);
}
`;

if (!cssContent.includes("border: 1px solid #00F0FF")) {
    cssContent += "\n" + borderStyles;
    
    // Also inject .map-legend-box into RiskMap.tsx legend
    let rm = fs.readFileSync('landslide_system/frontend/src/components/RiskMap.tsx', 'utf8');
    rm = rm.replace(/<div className="bg-zinc-900\/90 backdrop-blur-sm p-3 border border-zinc-700 text-xs font-mono w-44">/g, 
      '<div className="map-legend-box p-3 text-xs font-mono w-44">');
    fs.writeFileSync('landslide_system/frontend/src/components/RiskMap.tsx', rm);
    
    // Replace .maplibregl-canvas filter 
    cssContent = cssContent.replace(
      /filter: brightness\(0.65\) contrast\(1.25\) grayscale\(0.7\) hue-rotate\(175deg\) !important;/g,
      "filter: brightness(0.8) contrast(1.4) grayscale(0.5) hue-rotate(170deg) !important;"
    );

    fs.writeFileSync('landslide_system/frontend/src/index.css', cssContent);
}

console.log("Unified Risk Styles and Glare Fixes Applied.");
