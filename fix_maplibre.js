const fs = require('fs');

function replaceAll(file, replacements) {
    let content = fs.readFileSync(file, 'utf8');
    for (const [r, s] of replacements) {
        content = content.replace(r, s);
    }
    fs.writeFileSync(file, content);
}

// 1. Remove Diagnostic Marker in RiskMap.tsx
let riskMapContent = fs.readFileSync('landslide_system/frontend/src/components/RiskMap.tsx', 'utf8');

riskMapContent = riskMapContent.replace(/\/\/ HARDCODED TEST MARKER - PROVES MAPLIBRE RENDERING[\s\S]*?\.addTo\(map\);/, '');

// 2. Add the DOM markers ref and useEffect
const markersUseEffect = `
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;

    // Clear existing markers to prevent duplicates
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const dataToRender = mapData?.features || [];

    if (layersVisible.points && Array.isArray(dataToRender)) {
      dataToRender.forEach((feature: any) => {
        const target = feature.properties || {};
        const geom = feature.geometry || {};
        
        let lon, lat;
        if (geom.type === 'Point') {
           lon = geom.coordinates[0];
           lat = geom.coordinates[1];
        } else {
           lat = Number(target.lat ?? target.latitude);
           lon = Number(target.lon ?? target.lng ?? target.longitude);
        }

        if (isNaN(lat) || isNaN(lon) || lat === undefined || lon === undefined) return;

        const riskStr = String(
          target.risk_level || target.severity || target.class || target.status || ''
        ).toLowerCase();

        let color = '#38A169'; // Low / Safe Green
        let size = '14px';

        if (riskStr.includes('mod') || riskStr.includes('watch') || riskStr.includes('amber')) {
          color = '#E6A23C'; // Amber
          size = '18px';
        } else if (riskStr.includes('high') || riskStr.includes('crit') || riskStr.includes('red')) {
          color = '#D94B4B'; // Red
          size = '22px';
        }

        // Create a custom DOM element for the marker
        const el = document.createElement('div');
        el.style.width = size;
        el.style.height = size;
        el.style.backgroundColor = color;
        el.style.border = '2px solid #3B82A0';
        el.style.borderRadius = '50%';
        el.style.cursor = 'pointer';
        el.style.boxShadow = \`0 0 10px \${color}\`;

        // Attach click event for selection
        el.addEventListener('click', () => {
          if (onFeatureSelect) onFeatureSelect(target);
        });

        // Add to MapLibre
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([lon, lat]) // MapLibre uses [lng, lat]
          .addTo(map);

        markersRef.current.push(marker);
      });
    }
  }, [mapData, layersVisible.points, onFeatureSelect]);
`;

// Insert the markers UseEffect
if (!riskMapContent.includes("const markersRef")) {
   riskMapContent = riskMapContent.replace("const [opacity, setOpacity] = useState(0.6);", "const [opacity, setOpacity] = useState(0.6);\n" + markersUseEffect);
}

fs.writeFileSync('landslide_system/frontend/src/components/RiskMap.tsx', riskMapContent);


// 3. Add CSS for MapLibre inside index.css
let cssContent = fs.readFileSync('landslide_system/frontend/src/index.css', 'utf8');

const maplibreCss = `
/* Tint the MapLibre Base Canvas to Deep Himalayan Navy */
.maplibregl-map {
  background-color: #172331 !important;
}

.maplibregl-canvas {
  filter: brightness(0.65) contrast(1.25) grayscale(0.7) hue-rotate(175deg) !important;
  z-index: 200 !important;
}

/* Ensure MapLibre DOM markers sit ABOVE all background overlays */
.maplibregl-marker {
  z-index: 600 !important;
}

.maplibregl-popup {
  z-index: 700 !important;
}
`;

if (!cssContent.includes(".maplibregl-marker")) {
    cssContent += "\\n" + maplibreCss;
    fs.writeFileSync('landslide_system/frontend/src/index.css', cssContent);
}

console.log("MapLibre Fixes Applied.");
