const fs = require('fs');

// 1. Update index.css
let cssContent = fs.readFileSync('landslide_system/frontend/src/index.css', 'utf8');

cssContent = cssContent.replace(
  /background-color: #172331 !important;\s*\}/g,
  "background-color: #0f172a !important;\n}"
);

cssContent = cssContent.replace(
  /filter: brightness\(0.8\) contrast\(1.4\) grayscale\(0.5\) hue-rotate\(170deg\) !important;/g,
  "filter: brightness(1.15) contrast(1.4) grayscale(0.3) hue-rotate(175deg) !important;"
);
// Also catch the older one if it's there
cssContent = cssContent.replace(
  /filter: brightness\(0.65\) contrast\(1.25\) grayscale\(0.7\) hue-rotate\(175deg\) !important;/g,
  "filter: brightness(1.15) contrast(1.4) grayscale(0.3) hue-rotate(175deg) !important;"
);

fs.writeFileSync('landslide_system/frontend/src/index.css', cssContent);

// 2. Update RiskMap.tsx
let riskMapContent = fs.readFileSync('landslide_system/frontend/src/components/RiskMap.tsx', 'utf8');

const layerEnhancementCode = `
          // Force resize so MapLibre measures the container correctly after mount
          map.resize();

          // Enhance Text Labels & Basemap Features for Sunlight Visibility
          const layers = map.getStyle().layers;
          if (layers) {
            layers.forEach((layer) => {
              // 1. Make text labels pop with a dark, semi-transparent glow
              if (layer.type === 'symbol' && layer.layout?.['text-field']) {
                map.setPaintProperty(layer.id, 'text-color', '#E2E8F0'); // Bright slate
                map.setPaintProperty(layer.id, 'text-halo-color', 'rgba(15, 23, 42, 0.9)'); // Dark navy halo
                map.setPaintProperty(layer.id, 'text-halo-width', 1.5);
                map.setPaintProperty(layer.id, 'text-halo-blur', 1);
              }
              
              // 2. Lighten any existing water layers to a visible tactical cyan-blue
              if (layer.id.includes('water') || (layer.type === 'fill' && layer.id.includes('ocean'))) {
                map.setPaintProperty(layer.id, 'fill-color', '#1E293B');
              }

              // 3. Ensure roads are slightly visible (not pitch black)
              if (layer.type === 'line' && layer.id.includes('road')) {
                map.setPaintProperty(layer.id, 'line-color', '#334155');
                map.setPaintProperty(layer.id, 'line-opacity', 0.6);
              }
            });
          }
`;

riskMapContent = riskMapContent.replace(
  /\/\/ Force resize so MapLibre measures the container correctly after mount\s*map\.resize\(\);/,
  layerEnhancementCode
);

fs.writeFileSync('landslide_system/frontend/src/components/RiskMap.tsx', riskMapContent);

console.log("Sunlight tactical filters applied successfully.");
