const fs = require('fs');

function fixFile(path, replacements) {
    let c = fs.readFileSync(path, 'utf8');
    for (const [r, sub] of replacements) {
        c = c.replace(r, sub);
    }
    fs.writeFileSync(path, c);
}

const detailsPanelReplacements = [
    [/bg-\[\#eef1f5\]/g, 'bg-[#16191e]'],
    [/border-slate-300/g, 'border-[#282d37]'],
    [/bg-white\/95 backdrop-blur-md/g, 'bg-[#16191e]'],
    [/text-slate-900/g, 'text-slate-100']
];
fixFile('landslide_system/frontend/src/components/DetailsPanel.tsx', detailsPanelReplacements);

const demoPageReplacements = [
    [/bg-\[\#eef1f5\]/g, 'bg-[#0b0d10]'],
    [/bg-white\/95 backdrop-blur-md\/50/g, 'bg-[#16191e]'],
    [/bg-white\/95 backdrop-blur-md/g, 'bg-[#16191e]'],
    [/border-slate-300/g, 'border-[#282d37]'],
    [/text-slate-900/g, 'text-slate-100'],
    [/bg-amber-50/g, 'bg-amber-950\/20'],
    [/bg-red-50/g, 'bg-red-950\/20'],
    [/text-slate-500/g, 'text-slate-400'],
    [/bg-\[\#101216\] hover:bg-slate-700/g, 'bg-[#16191e] hover:bg-[#282d37]'],
    [/bg-\[\#101216\]/g, 'bg-[#16191e]'],
    [/accent-blue-500/g, 'accent-[#06b6d4]'],
    [/ring-2 ring-cyan-500 bg-\[\#16191e\] text-slate-100/g, 'border-[#06b6d4] bg-[#06b6d4]/10 text-[#06b6d4] border']
];
fixFile('landslide_system/frontend/src/pages/DemoPage.tsx', demoPageReplacements);
