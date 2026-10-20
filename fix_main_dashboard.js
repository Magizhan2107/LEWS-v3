const fs = require('fs');

function replaceAll(file, replacements) {
    let content = fs.readFileSync(file, 'utf8');
    for (const [r, s] of replacements) {
        content = content.replace(r, s);
    }
    fs.writeFileSync(file, content);
}

// 1. App.tsx
replaceAll('landslide_system/frontend/src/App.tsx', [
    [
        `font-['IBM_Plex_Mono',monospace]`, 
        `font-['Inter',sans-serif]`
    ]
]);

// 2. Header.tsx
replaceAll('landslide_system/frontend/src/components/Header.tsx', [
    [
        `<h1 className="text-xs font-bold tracking-widest uppercase text-zinc-100">LEWS <span className="text-[#526D82] font-normal">|</span> Landslide Early Warning System</h1>`,
        `<h1 className="text-xs font-bold tracking-widest uppercase text-zinc-100 font-['Sora',sans-serif]">LEWS <span className="text-[#526D82] font-normal">|</span> LANDSLIDE EARLY WARNING SYSTEM</h1>`
    ],
    [
        `font-mono`,
        `font-['IBM_Plex_Mono',monospace]`
    ],
    [
        `{status === 'Operational' ? 'SYS OP' : \`SYS \${status}\`}`,
        `{status === 'Operational' ? 'SYSTEM OPERATIONAL | LIVE DATA' : \`SYSTEM \${status}\`}`
    ]
]);

// 3. Sidebar.tsx
replaceAll('landslide_system/frontend/src/components/Sidebar.tsx', [
    // Width and color
    [/w-72 shrink-0 flex flex-col bg-\[\#314A5E\]/g, "w-1/5 shrink-0 flex flex-col bg-[#203447]"],
    [/bg-\[\#314A5E\]/g, "bg-[#203447]"], // Change level 3 to level 2 in the wrapper headers
    [/text-\[11px\] font-\['IBM_Plex_Mono',monospace\]/g, "text-[11px] font-['Inter',sans-serif]"],
    
    // Rewrite the location cards
    [
        `className={\`p-2 border-b border-[#526D82] cursor-pointer transition-colors flex flex-col gap-1.5
                  \${isSelected ? 'bg-[#172331] border-l-2 border-l-[#06b6d4]' : 'hover:bg-[#172331]/50 border-l-2 border-l-transparent'}
                \`}`,
        `className={\`p-3 m-2 rounded-xl border border-[#526D82]/30 cursor-pointer transition-colors flex flex-col gap-1.5
                  \${isSelected ? 'bg-[#172331] ring-2 ring-[#3B82A0]' : 'bg-[#263E52] hover:bg-[#314A5E]'}
                \`}`
    ],
    [
        `<div className="font-['IBM_Plex_Mono',monospace] font-bold text-[11px] text-[#F2F7FA] break-words pr-2 leading-tight flex-1">
                    {loc.name || loc.location_id || 'UNKNOWN_TGT'}
                  </div>`,
        `<div className="font-['Inter',sans-serif] font-bold text-[12px] text-[#F2F7FA] break-words pr-2 leading-tight flex-1">
                    {loc.name || loc.location_id || 'UNKNOWN_TGT'}
                  </div>
                  <div className="font-['IBM_Plex_Mono',monospace] text-xs text-[#BFD5E2] w-full mt-1">
                    {loc.latitude !== undefined ? \`\${Number(loc.latitude).toFixed(4)}, \${Number(loc.longitude).toFixed(4)}\` : ''}
                  </div>`
    ],
    // Change stale and alert badges
    [/rounded-xl font-bold uppercase tracking-widest/g, "rounded-lg font-bold uppercase tracking-widest font-['Inter',sans-serif]"]
]);

// 4. DetailsPanel.tsx
replaceAll('landslide_system/frontend/src/components/DetailsPanel.tsx', [
    [/w-80 shrink-0 flex flex-col bg-\[\#314A5E\]/g, "w-1/5 shrink-0 flex flex-col bg-[#203447]"],
    [/bg-\[\#314A5E\]/g, "bg-[#203447]"], // change base bg
    [/bg-\[\#172331\]/g, "bg-[#263E52]"], // change inner cards to mountain slate
    [/border-\[\#526D82\]/g, "border-[#526D82]/30"], // subtle borders
    [/rounded-xl/g, "rounded-2xl"], // rounded-2xl for cards
    
    // Remove mono from headers and set to Inter
    [/font-\['IBM_Plex_Mono',monospace\] font-bold text-zinc-200/g, "font-['Inter',sans-serif] font-bold text-[#F2F7FA]"],
    [/font-\['IBM_Plex_Mono',monospace\] font-bold text-\[\#BFD5E2\] uppercase/g, "font-['Inter',sans-serif] font-bold text-[#BFD5E2] uppercase"]
]);

// 5. RiskMap.tsx
replaceAll('landslide_system/frontend/src/components/RiskMap.tsx', [
    [
        `POLY`,
        `Risk Zones`
    ],
    [
        `PTS`,
        `Sensors`
    ],
    [
        `{/* Layers Toggle */}`,
        `{/* Layers Toggle */}
         <label className="flex items-center gap-1 cursor-pointer ml-2">
            <input type="checkbox" checked={true} readOnly />
            Terrain Contour
         </label>`
    ],
    [
        `{/* Top Map Controls */}`,
        `{/* Top Map Controls */}
      <div className="absolute top-0 left-0 w-full bg-[#172331]/90 backdrop-blur border-b border-[#526D82]/30 py-1.5 px-4 flex items-center justify-between z-20">
         <div className="text-[10px] font-['IBM_Plex_Mono',monospace] text-[#3B82A0] font-bold uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#3B82A0] shadow-[0_0_8px_rgba(59,130,160,0.8)] animate-pulse"></span>
            DATA STREAM ACTIVE | 24 SENSORS ONLINE
         </div>
         <div className="text-[10px] font-['IBM_Plex_Mono',monospace] text-[#BFD5E2] font-bold uppercase tracking-widest">
            LAST UPDATE {new Date().toLocaleTimeString('en-US', { hour12: false })}
         </div>
      </div>`
    ],
    [
        `className="absolute top-4 left-4 flex gap-2 z-10"`,
        `className="absolute top-10 left-4 flex gap-2 z-10"`
    ]
]);

console.log("Main dashboard replacements complete.");
