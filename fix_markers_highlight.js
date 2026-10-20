const fs = require('fs');

const riskMapFile = 'landslide_system/frontend/src/components/RiskMap.tsx';
let riskMapContent = fs.readFileSync(riskMapFile, 'utf8');

// Replace the markersRef useEffect with the new highlighted one
const oldUseEffectRegex = /useEffect\(\(\) => \{\s*if \(\!mapInstance\.current\) return;\s*const map = mapInstance\.current;\s*\/\/ Clear existing markers to prevent duplicates[\s\S]*?markersRef\.current\.push\(marker\);\s*\}\);\s*\}\s*\}, \[mapData, layersVisible\.points, onFeatureSelect\]\);/;

const newUseEffect = `useEffect(() => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;

    // Clear existing markers to prevent duplicates
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const dataToRender = mapData?.features ? [...mapData.features] : [];

    // Ensure a searched/selected target is in the array so it gets a marker
    if (selectedLocationId && selectedLocationId.startsWith('coord-') && customView) {
       const exists = dataToRender.some((f: any) => f.properties?.location_id === selectedLocationId);
       if (!exists) {
           dataToRender.push({
               type: 'Feature',
               geometry: { type: 'Point', coordinates: customView.center },
               properties: {
                   location_id: selectedLocationId,
                   name: 'Searched Location',
                   risk_level: 'UNKNOWN'
               }
           });
       }
    }

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
          target.risk_level || target.severity || target.class || target.status || 'low'
        ).toLowerCase();

        let color = '#38A169'; // Low / Safe Green
        let baseSize = 14;

        if (riskStr.includes('mod') || riskStr.includes('watch') || riskStr.includes('amber')) {
          color = '#E6A23C'; // Amber
          baseSize = 18;
        } else if (riskStr.includes('high') || riskStr.includes('crit') || riskStr.includes('red')) {
          color = '#D94B4B'; // Red
          baseSize = 22;
        }

        // Check if this specific marker is the currently selected search target
        const isSelected = selectedLocationId && (
            target.id === selectedLocationId || 
            target.location_id === selectedLocationId
        );

        // Create a custom DOM element for the marker
        const el = document.createElement('div');
        const finalSize = isSelected ? baseSize + 8 : baseSize; // Enlarge selected marker
        
        el.style.width = \`\${finalSize}px\`;
        el.style.height = \`\${finalSize}px\`;
        el.style.backgroundColor = color;
        el.style.border = isSelected ? '3px solid #FFFFFF' : '2px solid #3B82A0';
        el.style.borderRadius = '50%';
        el.style.cursor = 'pointer';
        el.style.boxShadow = isSelected ? \`0 0 15px \${color}, 0 0 8px #FFF\` : \`0 0 10px \${color}\`;
        el.style.transition = 'all 0.3s ease';
        el.style.zIndex = isSelected ? '999' : '1'; // Force selected marker above all others

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
  }, [mapData, layersVisible.points, onFeatureSelect, selectedLocationId, customView]);`;

riskMapContent = riskMapContent.replace(oldUseEffectRegex, newUseEffect);

fs.writeFileSync(riskMapFile, riskMapContent);

// Also double check CSS rules are fully present in index.css
let cssContent = fs.readFileSync('landslide_system/frontend/src/index.css', 'utf8');
if (!cssContent.includes('.maplibregl-map')) {
    cssContent += `
/* Tint the MapLibre Base Canvas to Deep Himalayan Navy */
.maplibregl-map {
  background-color: #172331 !important;
}

.maplibregl-canvas {
  filter: brightness(0.65) contrast(1.25) grayscale(0.7) hue-rotate(175deg) !important;
  z-index: 200 !important;
}

.maplibregl-marker {
  z-index: 600 !important;
}

.maplibregl-popup {
  z-index: 700 !important;
}

.map-contour-overlay {
  z-index: 100 !important;
  pointer-events: none !important;
}
`;
    fs.writeFileSync('landslide_system/frontend/src/index.css', cssContent);
}

console.log("Marker styling and selection logic updated.");
