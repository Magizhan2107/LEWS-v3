const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('landslide_system/frontend/src');

const globalReplacements = [
    // Typography
    [/font-\['JetBrains_Mono',monospace\]/g, "font-['IBM_Plex_Mono',monospace]"],
    // Colors
    [/bg-\[\#0b0d10\]/gi, "bg-[#172331]"],
    [/bg-\[\#16191e\]/gi, "bg-[#314A5E]"],
    [/bg-\[\#101216\]/gi, "bg-[#314A5E]"],
    [/border-\[\#282d37\]/gi, "border-[#526D82]"],
    [/text-\[\#06b6d4\]/gi, "text-[#3B82A0]"],
    [/bg-\[\#06b6d4\]/gi, "bg-[#3B82A0]"],
    [/border-\[\#06b6d4\]/gi, "border-[#3B82A0]"],
    [/text-slate-100/g, "text-[#F2F7FA]"],
    [/text-slate-400/g, "text-[#BFD5E2]"],
    [/text-slate-500/g, "text-[#526D82]"],
    [/bg-black/g, "bg-[#172331]"],
    [/text-slate-900/g, "text-[#F2F7FA]"],
    [/text-zinc-600/g, "text-[#526D82]"],
    
    // Safety Risk Colors adjustments
    [/text-\[\#059669\]/gi, "text-[#38A169]"],
    [/text-emerald-400/gi, "text-[#38A169]"],
    [/text-emerald-500/gi, "text-[#38A169]"],
    [/bg-emerald-500/gi, "bg-[#38A169]"],
    [/text-\[\#d97706\]/gi, "text-[#E6A23C]"],
    [/text-amber-400/gi, "text-[#E6A23C]"],
    [/text-amber-500/gi, "text-[#E6A23C]"],
    [/bg-amber-500/gi, "bg-[#E6A23C]"],
    [/text-\[\#dc2626\]/gi, "text-[#D94B4B]"],
    [/text-\[\#f43f5e\]/gi, "text-[#D94B4B]"],
    [/text-red-400/gi, "text-[#D94B4B]"],
    [/text-red-500/gi, "text-[#D94B4B]"],
    [/bg-red-500/gi, "bg-[#D94B4B]"],
];

const specificDemoPageReplacements = [
    // DemoPage background styling
    [/from-\[\#0b0d10\]\/90 via-\[\#0b0d10\]\/70 to-\[\#0b0d10\]\/95/g, "from-[#172331]/80 via-[#172331]/60 to-[#172331]/90"],
    // Fix background opacity for mountains
    [/opacity-20/g, "opacity-40"],
    
    // Panel styling overrides for DemoPage
    [/bg-\[\#314A5E\]\/90 backdrop-blur-md border-\[\#526D82\]/g, "bg-[#172331]/85 backdrop-blur-md border border-[#526D82]/50 rounded-2xl shadow-xl"],
    [/bg-\[\#314A5E\]\/90 backdrop-blur-md border border-\[\#526D82\] p-6 rounded-none/g, "bg-[#172331]/85 backdrop-blur-md border border-[#526D82]/50 p-6 rounded-2xl shadow-xl"],
    [/bg-\[\#314A5E\]\/90 backdrop-blur-md border-r border-\[\#526D82\]/g, "bg-[#172331]/85 backdrop-blur-md border-r border-[#526D82]/50"],
    [/bg-\[\#314A5E\]\/90 backdrop-blur-md relative z-10/g, "bg-[#172331]/85 backdrop-blur-md border-b border-[#526D82]/50 relative z-10"],

    // Fonts for specific tags
    [/<h1 className="text-lg font-bold text-\[\#F2F7FA\] flex items-center gap-2">/g, "<h1 className=\"text-lg font-bold text-[#F2F7FA] font-['Sora',sans-serif] flex items-center gap-2\">"],
    
    // Button fixes (DemoPage presets)
    [/border-\[\#3B82A0\] bg-\[\#3B82A0\]\/10 text-\[\#3B82A0\] border/g, "border-2 border-[#3B82A0] bg-[#3B82A0]/20 text-[#FFFFFF] shadow-[0_0_12px_rgba(59,130,160,0.4)] rounded-lg font-['Inter',sans-serif]"],
    [/bg-\[\#314A5E\] hover:bg-\[\#526D82\] border border-\[\#526D82\] text-\[\#F2F7FA\]/g, "bg-[#314A5E] hover:bg-[#314A5E]/50 border border-[#526D82] text-[#BFD5E2] rounded-lg font-['Inter',sans-serif]"],

    // Sliders
    [/accent-\[\#06b6d4\]/gi, "accent-[#3B82A0]"]
];

const generalButtonOverrides = [
    [/rounded-none/g, "rounded-lg"],
    [/font-\['JetBrains_Mono',monospace\]/g, "font-['IBM_Plex_Mono',monospace]"] // just in case
];

for (const file of files) {
    let c = fs.readFileSync(file, 'utf8');
    
    // Global replace
    for (const [regex, replacement] of globalReplacements) {
        c = c.replace(regex, replacement);
    }
    
    // DemoPage specific
    if (file.includes('DemoPage.tsx')) {
        for (const [regex, replacement] of specificDemoPageReplacements) {
            c = c.replace(regex, replacement);
        }
    }
    
    // App & Components generic overrides
    if (!file.includes('DemoPage.tsx')) {
        c = c.replace(/rounded-none/g, "rounded-xl");
    }

    fs.writeFileSync(file, c);
}
console.log("Styling overrides complete.");
