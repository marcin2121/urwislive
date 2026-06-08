const performance = require('perf_hooks').performance;

async function mockQuery(delayMs) {
  return new Promise(resolve => setTimeout(resolve, delayMs));
}

async function sequential(pushes) {
  const start = performance.now();
  for (const push of pushes) {
    await mockQuery(50); // mock query subs
    await mockQuery(50); // mock update status
  }
  return performance.now() - start;
}

async function optimized(pushes) {
  const start = performance.now();
  await Promise.all(pushes.map(async (push) => {
    await mockQuery(50); // mock query subs
  }));
  // mock bulk update
  await mockQuery(50);
  return performance.now() - start;
}

async function run() {
  const pushes = new Array(10).fill({});
  const seqTime = await sequential(pushes);
  const optTime = await optimized(pushes);
  console.log(`Sequential time: ${seqTime.toFixed(2)} ms`);
  console.log(`Optimized time: ${optTime.toFixed(2)} ms`);
}

run();
