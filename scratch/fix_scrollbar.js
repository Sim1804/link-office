const fs = require('fs');
const path = 'd:\\Projects\\link-office\\app\\globals.css';
let css = fs.readFileSync(path, 'utf8');

// Replace the violet scrollbar thumb with a neutral/primary color
css = css.replace('rgba(124,58,237,0.5)', 'var(--text-3)'); // Neutral grey scrollbar
css = css.replace('::-webkit-scrollbar-thumb:hover { background: var(--primary); }', '::-webkit-scrollbar-thumb:hover { background: var(--text-2); }');

// Add overflow-x hidden to body when iris is open to prevent horizontal scrollbar from appearing
if (!css.includes('overflow-x: hidden;')) {
    css = css.replace(
        'body.iris-open {\n  padding-right: 400px;\n}',
        'body.iris-open {\n  padding-right: 400px;\n  overflow-x: hidden;\n}'
    );
}

fs.writeFileSync(path, css);
console.log("Fixed violet scrollbar");
