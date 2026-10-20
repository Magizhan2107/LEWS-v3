const fs = require('fs');

function replaceAll(file, replacements) {
    let content = fs.readFileSync(file, 'utf8');
    for (const [r, s] of replacements) {
        content = content.replace(r, s);
    }
    fs.writeFileSync(file, content);
}

// 1. App.tsx - Layout and Colors
replaceAll('landslide_system/frontend/src/App.tsx', [
    [/border-\[\#526D82\]/g, "border-[#BFD5E2]/15"], // Updates border to new token
]);

// 2. Sidebar.tsx
replaceAll('landslide_system/frontend/src/components/Sidebar.tsx', [
    [/border-\[\#526D82\]\/30/g, "border-[#BFD5E2]/15"],
    [/border-\[\#526D82\]/g, "border-[#BFD5E2]/15"],
    [/rounded-xl/g, "rounded-xl"], // Ensure cards are rounded-xl
    // Fix typography to Inter
    [/font-\['IBM_Plex_Mono',monospace\]/g, "font-['Inter',sans-serif]"],
    // Put IBM Plex Mono back for the lat/lon explicitly
    [/className="font-\['Inter',sans-serif\] text-xs text-\[\#BFD5E2\] w-full mt-1"/g, 'className="font-[\'IBM_Plex_Mono\',monospace] text-xs text-[#BFD5E2] w-full mt-1"']
]);

// 3. DetailsPanel.tsx
replaceAll('landslide_system/frontend/src/components/DetailsPanel.tsx', [
    [/border-\[\#526D82\]\/30/g, "border-[#BFD5E2]/15"],
    [/border-\[\#526D82\]/g, "border-[#BFD5E2]/15"],
    [/rounded-2xl/g, "rounded-xl"], // Update radius
    // Ensure primary UI is Inter
    [/font-\['IBM_Plex_Mono',monospace\]/g, "font-['Inter',sans-serif]"],
    // Restore IBM Plex Mono for specific values
    [/<span className="font-medium text-\[\#F2F7FA\]">/g, '<span className="font-medium text-[#F2F7FA] font-[\'IBM_Plex_Mono\',monospace]">'],
    [/<span className="text-\[\#F2F7FA\]">/g, '<span className="text-[#F2F7FA] font-[\'IBM_Plex_Mono\',monospace]">']
]);

// 4. Header.tsx
replaceAll('landslide_system/frontend/src/components/Header.tsx', [
    [/font-\['Sora',sans-serif\]/g, "font-['Sora',sans-serif]"], // already Sora
    [/LEWS <span className="text-\[\#526D82\] font-normal">\|<\/span> LANDSLIDE EARLY WARNING SYSTEM/g, "〽 LEWS <span className=\"text-[#526D82] font-normal\">|</span> LANDSLIDE EARLY WARNING SYSTEM"]
]);

// 5. RiskMap.tsx
const riskMapOverlays = `
      {/* Topographic Overlay */}
      <div className="absolute inset-0 bg-[url('/images/contours.png')] opacity-10 pointer-events-none z-0" />
      
      {/* Top-Left Overlay Pill */}
      <div className="absolute top-4 left-4 z-20 bg-[#203447]/85 backdrop-blur-md rounded-lg px-3 py-1.5 border border-[#BFD5E2]/20 text-[10px] font-['Inter',sans-serif] font-bold text-[#F2F7FA] flex items-center gap-2 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-[#38A169] animate-pulse shadow-[0_0_8px_rgba(56,161,105,0.8)]"></span>
        LIVE MONITORING
      </div>

      {/* Bottom Overlay Strip */}
      <div className="absolute bottom-0 left-0 w-full bg-[#172331]/90 backdrop-blur-md border-t border-[#BFD5E2]/20 py-1.5 px-4 flex items-center justify-center z-20 text-[10px] font-['IBM_Plex_Mono',monospace] text-[#BFD5E2] font-bold uppercase tracking-widest gap-2">
        <span className="w-2 h-2 rounded-full bg-[#3B82A0] animate-pulse"></span>
        DATA STREAM ACTIVE | 24 SENSORS ONLINE | LAST UPDATE UTC {new Date().toLocaleTimeString('en-US', { hour12: false, timeZone: 'UTC' })}
      </div>
`;

replaceAll('landslide_system/frontend/src/components/RiskMap.tsx', [
    [/<div className="absolute top-0 left-0 w-full bg-\[\#172331\]\/90[\s\S]*?<\/div>\n      <\/div>/m, ""], // Remove previous top bar
    [/<div className="absolute top-10 left-4 flex gap-2 z-10">/g, `<div className="absolute top-14 left-4 flex flex-col gap-2 z-10">
        <div className="bg-[#203447] border border-[#BFD5E2]/20 rounded-xl p-2 flex flex-col gap-2 backdrop-blur shadow-lg">
          <div className="flex gap-2">`],
    [/<label className="flex items-center gap-1 cursor-pointer ml-2">/g, `</div><div className="flex flex-col gap-1.5 text-xs font-['Inter',sans-serif] text-[#F2F7FA] mt-2 pt-2 border-t border-[#BFD5E2]/15">
         <label className="flex items-center gap-2 cursor-pointer">`],
    [/<div className="bg-zinc-900\/90 backdrop-blur text-zinc-300 p-2 border border-zinc-700 text-xs font-mono font-semibold flex items-center gap-3">\s*<Layers className="w-3.5 h-3.5"\/>/g, ``],
    [/<label className="flex items-center gap-1 cursor-pointer">/g, `<label className="flex items-center gap-2 cursor-pointer">`],
    [/<\/label>\n         <\/div>\n      <\/div>/g, `</label></div></div></div>`],
    
    // Inject the new overlays
    [/<div className="relative w-full h-full" style={{ minHeight: 0 }}>/g, `<div className="relative w-full h-full" style={{ minHeight: 0 }}>${riskMapOverlays}`],

    // Update WebGL MapColors
    [/'LOW', '#10B981',/g, "'LOW', '#38A169',"],
    [/'MODERATE', '#F59E0B',/g, "'MODERATE', '#E6A23C',"],
    [/'HIGH', '#EF4444',/g, "'HIGH', '#D94B4B',"],
    [/'CRITICAL', '#7F1D1D',/g, "'CRITICAL', '#D94B4B',"]
]);

console.log("Map theme updates complete.");
