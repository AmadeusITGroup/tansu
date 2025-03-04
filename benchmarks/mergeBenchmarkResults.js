import { readFileSync, writeFileSync } from 'fs';

const jsReactivityBenchmarks = JSON.parse(readFileSync('js-reactivity-benchmarks.json'));
const vitestBenchmarks = JSON.parse(readFileSync('vitest-benchmarks.json'));
writeFileSync(
  'benchmarks.json',
  JSON.stringify([...jsReactivityBenchmarks, ...vitestBenchmarks], null, 2)
);
