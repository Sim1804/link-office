const fs = require('fs');
const path = 'd:\\Projects\\link-office\\app\\globals.css';
let css = fs.readFileSync(path, 'utf8');

if (!css.includes('::-webkit-scrollbar:horizontal')) {
    css += '\n::-webkit-scrollbar:horizontal { display: none; height: 0; }\n';
}

fs.writeFileSync(path, css);
console.log("Hidden horizontal scrollbar completely");
