const fs = require('fs');
const path = 'd:\\Projects\\link-office\\app\\globals.css';
let css = fs.readFileSync(path, 'utf8');

css = css.replace(
    'body.iris-open {\n  padding-right: 400px;\n  overflow-x: hidden;\n}',
    'body.iris-open {\n  padding-right: 400px;\n  overflow: hidden;\n}'
);

fs.writeFileSync(path, css);
console.log("Changed to overflow: hidden");
