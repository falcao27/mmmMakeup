const fs = require('fs');
const path = require('path');
const css = fs.readFileSync(path.join(__dirname, 'frontend', 'styles.css'), 'utf8');
let depth = 0, inComment = false, inString = null;
for (let i = 0; i < css.length; i++) {
    const c = css[i];
    if (inComment) {
        if (c === '*' && css[i + 1] === '/') { inComment = false; i++; }
        continue;
    }
    if (inString) {
        if (c === inString && css[i - 1] !== '\\') inString = null;
        continue;
    }
    if (c === '/' && css[i + 1] === '*') { inComment = true; i++; continue; }
    if (c === '"' || c === "'") { inString = c; continue; }
    if (c === '{') depth++;
    if (c === '}') depth--;
    if (depth < 0) { console.log('UNBALANCED at', i); process.exit(1); }
}
console.log('braces depth end:', depth);
console.log(depth === 0 ? 'CSS OK' : 'CSS UNBALANCED');
