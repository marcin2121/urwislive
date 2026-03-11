const fs = require('fs');
const lh = JSON.parse(fs.readFileSync('./lighthouse-after6.json', 'utf8'));
const audits = Object.entries(lh.audits).filter(([k, v]) => v.displayValue).map(([k, v]) => `${k}: ${v.displayValue}`);
fs.writeFileSync('./lh-audits.txt', audits.join('\n'));
