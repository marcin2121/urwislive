const fs = require('fs');
const lh = JSON.parse(fs.readFileSync('./lighthouse-after7.json', 'utf8'));

console.log('--- SCORES ---');
console.log(`Performance: ${lh.categories.performance.score * 100}`);
console.log(`FCP: ${lh.audits['first-contentful-paint'].displayValue}`);
console.log(`LCP: ${lh.audits['largest-contentful-paint'].displayValue}`);
console.log(`TBT: ${lh.audits['total-blocking-time'].displayValue}`);

console.log('\n--- LCP ELEMENT ---');
const lcpItem = lh.audits['largest-contentful-paint-element']?.details?.items?.[0];
if(lcpItem) {
  console.log(`Node: ${lcpItem.node?.snippet}`);
  console.log(`Phase: Load Delay=${lcpItem.timeToFirstByte}, Render Delay=${lcpItem.renderDelay}`);
}

console.log('\n--- MAIN THREAD WORK ---');
const mtInfo = lh.audits['mainthread-work-breakdown']?.details?.items || [];
mtInfo.forEach(item => {
  console.log(`${item.groupLabel}: ${item.duration}ms`);
});
