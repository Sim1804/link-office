const fs = require('fs');

const pathWidget = 'd:\\Projects\\link-office\\src\\components\\iris\\IrisWidget.tsx';
let contentWidget = fs.readFileSync(pathWidget, 'utf8');

// Replace indigo with primary (cyan) in IrisWidget
contentWidget = contentWidget.replaceAll('var(--indigo)', 'var(--primary)');
contentWidget = contentWidget.replaceAll('rgba(89, 101, 232,', 'rgba(0,169,157,');
contentWidget = contentWidget.replaceAll('background: "linear-gradient(135deg, var(--indigo) 0%, var(--primary) 100%)"', 'background: "var(--primary)"');

fs.writeFileSync(pathWidget, contentWidget);
console.log("Fixed Iris Widget colors");
