import { askCrystalBall } from './lib/magic.ts';

async function main() {
    const start = performance.now();
    for (let i = 0; i < 5; i++) {
        await askCrystalBall('test');
    }
    const end = performance.now();
    console.log(`Execution time for 5 iterations: ${(end - start).toFixed(2)} ms`);
    console.log(`Average time per iteration: ${((end - start) / 5).toFixed(2)} ms`);
}

main();
