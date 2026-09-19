import { mkdir, readFile, writeFile } from 'node:fs/promises';

const report = JSON.parse(await readFile('artifacts/results.json', 'utf8'));
const specs = [];
function collect(suite) {
  for (const spec of suite.specs ?? []) specs.push(spec);
  for (const child of suite.suites ?? []) collect(child);
}
for (const suite of report.suites ?? []) collect(suite);
const tests = specs.flatMap((spec) => spec.tests ?? []);
const results = tests.flatMap((item) => item.results ?? []);
const passed = tests.filter((item) => item.status === 'expected').length;
const durationMs = results.reduce((total, result) => total + (result.duration ?? 0), 0);
const metrics = {
  schemaVersion: '1.0',
  generatedAt: new Date().toISOString(),
  product: 'Playwright Automation Bootstrap',
  tests: tests.length,
  passed,
  failed: tests.length - passed,
  passRate: tests.length ? Number((passed / tests.length).toFixed(4)) : 0,
  durationMs,
  browsers: ['chromium'],
  evidence: ['HTML report', 'JSON report', 'video per test', 'success screenshot'],
};
await mkdir('evidence/bootstrap', { recursive: true });
await Promise.all([
  writeFile('evidence/bootstrap/metrics.json', JSON.stringify(metrics, null, 2)),
  writeFile(
    'evidence/bootstrap/METRICS.md',
    `# Bootstrap demo metrics\n\n| Tests | Passed | Failed | Pass rate | Duration |\n| ---: | ---: | ---: | ---: | ---: |\n| ${metrics.tests} | ${metrics.passed} | ${metrics.failed} | ${(metrics.passRate * 100).toFixed(1)}% | ${metrics.durationMs} ms |\n\nEvidence is generated from the deterministic public demo, not from a customer system.\n`,
  ),
]);
console.log(metrics);
