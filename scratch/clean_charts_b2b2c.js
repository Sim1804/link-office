const fs = require('fs');

const files = [
  'd:\\Projects\\link-office\\app\\dashboard\\b2b2c\\page.tsx',
  'd:\\Projects\\link-office\\app\\dashboard\\b2g\\page.tsx'
];

files.forEach(targetPath => {
  let content = fs.readFileSync(targetPath, 'utf8');

  // Chart specifics
  content = content.replaceAll('stroke="rgba(255,255,255,0.06)"', 'stroke="var(--border)"');
  content = content.replaceAll('fill: "#64748b"', 'fill: "var(--text-3)"');
  content = content.replaceAll('fill: "#94a3b8"', 'fill: "var(--text-2)"');
  content = content.replaceAll('cursor={{ fill: "rgba(255,255,255,0.02)" }}', 'cursor={{ fill: "var(--bg)" }}');
  content = content.replaceAll('contentStyle={{ background: "#111827",', 'contentStyle={{ background: "var(--surface)",');

  // Progress bars
  content = content.replaceAll('background: "rgba(255,255,255,0.1)"', 'background: "var(--bg)"');
  content = content.replaceAll('background: "rgba(255,255,255,0.05)"', 'background: "var(--bg)"');
  
  // Random transparent backgrounds
  content = content.replaceAll('background: "rgba(16,185,129,0.15)"', 'background: "rgba(0,169,157,0.1)"');
  content = content.replaceAll('boxShadow: "0 0 24px rgba(16,185,129,0.2)"', 'boxShadow: "var(--shadow-glow-cyan)"');
  content = content.replaceAll('color="#34d399"', 'color="var(--primary)"');
  content = content.replaceAll('rgba(16,185,129,0.1)', 'rgba(0,169,157,0.1)');
  content = content.replaceAll('rgba(16,185,129,0.2)', 'rgba(0,169,157,0.2)');

  content = content.replaceAll('rgba(124,58,237,0.05)', 'rgba(89,101,232,0.05)');
  content = content.replaceAll('rgba(124,58,237,0.15)', 'rgba(89,101,232,0.15)');
  content = content.replaceAll('color="#a78bfa"', 'color="#5965E8"');
  content = content.replaceAll('rgba(124,58,237,0.1)', 'rgba(89,101,232,0.1)');
  content = content.replaceAll('rgba(124,58,237,0.2)', 'rgba(89,101,232,0.2)');

  fs.writeFileSync(targetPath, content);
  console.log(`Cleaned charts and colors in ${targetPath}`);
});
