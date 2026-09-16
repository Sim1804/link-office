const fs = require('fs');
const path = 'd:\\Projects\\link-office\\app\\globals.css';
let css = fs.readFileSync(path, 'utf8');

// Replace the body.iris-open block forcefully
css = css.replace(/body\.iris-open\s*\{[\s\S]*?\}/, 'body.iris-open {\n  padding-right: 400px;\n  overflow-x: hidden;\n}');

// Also ensure html itself never scrolls horizontally globally 
if (!css.includes('html { overflow-x: hidden;')) {
    css = css.replace('html { scroll-behavior: smooth; }', 'html { scroll-behavior: smooth; overflow-x: hidden; }');
}

fs.writeFileSync(path, css);
console.log("Fixed overflow for real this time");
