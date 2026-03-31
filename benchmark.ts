import { performance } from 'perf_hooks';

// Simulate the old N+1 behavior vs the new batched behavior
async function mockOldQuery(userId: string) {
  // simulate DB latency
  await new Promise(resolve => setTimeout(resolve, 50));
  return [{ id: Math.random(), user_id: userId }];
}

async function mockNewQuery(userIds: string[]) {
  // simulate DB latency
  await new Promise(resolve => setTimeout(resolve, 50));
  return userIds.map(userId => ({ id: Math.random(), user_id: userId }));
}

async function runBenchmark() {
  console.log('Running benchmark for 10 users...');
  const userIds = Array.from({ length: 10 }, (_, i) => `user_${i}`);

  // Old behavior: N queries
  const startOld = performance.now();
  for (const id of userIds) {
    await mockOldQuery(id);
  }
  const endOld = performance.now();
  console.log(`Baseline (N+1 queries): ${(endOld - startOld).toFixed(2)} ms`);

  // New behavior: 1 batched query
  const startNew = performance.now();
  await mockNewQuery(userIds);
  const endNew = performance.now();
  console.log(`Optimized (1 batched query): ${(endNew - startNew).toFixed(2)} ms`);
  console.log(`Improvement: ${(((endOld - startOld) - (endNew - startNew)) / (endOld - startOld) * 100).toFixed(2)}% faster`);
}

runBenchmark();
