const fs = require('fs');
const lh = JSON.parse(fs.readFileSync('./lighthouse-after6.json', 'utf8'));

const lcpItem = lh.audits['largest-contentful-paint-element']?.details?.items?.[0];
console.log(JSON.stringify(lcpItem, null, 2));
