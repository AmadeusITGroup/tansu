import { writeFile } from 'fs/promises';
import {
  runTests,
  formatPerfResultStrings,
  formatPerfResult,
  perfResultHeaders,
} from 'js-reactivity-benchmark';
import { tansuFramework } from './adapter';

(async () => {
  console.log(formatPerfResultStrings(perfResultHeaders()));
  const results: { name: string; value: number; unit: string }[] = [];
  await runTests([{ framework: tansuFramework, testPullCounts: true }], (result) => {
    console.log(formatPerfResult(result));
    results.push({ name: result.test, value: result.time, unit: 'ms' });
  });
  await writeFile('js-reactivity-benchmarks.json', JSON.stringify(results, null, ' '));
})();
