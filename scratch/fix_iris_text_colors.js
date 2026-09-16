const fs = require('fs');

const pathWidget = 'd:\\Projects\\link-office\\src\\components\\iris\\IrisWidget.tsx';
let contentWidget = fs.readFileSync(pathWidget, 'utf8');

// Replace unreadable light text colors with theme variables
contentWidget = contentWidget.replaceAll('#cbd5e1', 'var(--text-1)');
contentWidget = contentWidget.replaceAll('#94a3b8', 'var(--text-3)');
contentWidget = contentWidget.replaceAll('#64748b', 'var(--text-2)');
contentWidget = contentWidget.replaceAll('#111827', 'var(--text-1)'); // if there's any black text that shouldn't be hardcoded
contentWidget = contentWidget.replaceAll('rgba(255, 255, 255, 0.9)', 'var(--surface)'); 

fs.writeFileSync(pathWidget, contentWidget);
console.log("Fixed IrisWidget text legibility");
