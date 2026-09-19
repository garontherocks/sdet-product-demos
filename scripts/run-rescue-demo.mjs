import { spawn } from 'node:child_process';
import { copyFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';

const repetitions = 5;
await mkdir('artifacts/rescue', { recursive: true });
await mkdir('artifacts/rescue/videos', { recursive: true });
await mkdir('evidence/rescue/screenshots', { recursive: true });

async function runSample(label, spec) {
  const runs = [];
  for (let run = 1; run <= repetitions; run += 1) {
    const report = `artifacts/rescue/${label}-${run}.json`;
    const started = performance.now();
    const exitCode = await execute(spec, run, report);
    await preserveVideo(label, run);
    const result = JSON.parse(await readFile(report, 'utf8'));
    runs.push({
      run,
      passed: exitCode === 0,
      durationMs: Math.round(performance.now() - started),
      reportedDurationMs: result.stats?.duration ?? 0,
    });
  }
  const passed = runs.filter((item) => item.passed).length;
  return {
    label,
    repetitions,
    passed,
    failed: repetitions - passed,
    passRate: Number((passed / repetitions).toFixed(2)),
    flaky: passed > 0 && passed < repetitions,
    runs,
  };
}

async function preserveVideo(label, run) {
  const entries = await readdir('artifacts/test-results', { recursive: true, withFileTypes: true });
  const video = entries.find((entry) => entry.isFile() && entry.name.endsWith('.webm'));
  if (!video) return;
  await copyFile(
    `${video.parentPath}/${video.name}`,
    `artifacts/rescue/videos/${label}-${run}.webm`,
  );
}

function execute(spec, run, report) {
  return new Promise((resolve, reject) => {
    const child = spawn('npx', ['playwright', 'test', spec, '--project=chromium'], {
      shell: false,
      stdio: 'inherit',
      env: {
        ...process.env,
        CI: '',
        DEMO_RUN_INDEX: String(run),
        PLAYWRIGHT_JSON_OUTPUT_NAME: report,
      },
    });
    child.once('error', reject);
    child.once('close', (code) => resolve(code ?? 1));
  });
}

const before = await runSample('before', 'tests/rescue/before.spec.ts');
const after = await runSample('after', 'tests/rescue/after.spec.ts');
const comparison = {
  schemaVersion: '1.0',
  generatedAt: new Date().toISOString(),
  product: 'Automation Rescue',
  syntheticDemo: true,
  before,
  after,
  delta: {
    passRatePoints: (after.passRate - before.passRate) * 100,
    failuresRemoved: before.failed - after.failed,
  },
  boundary: 'Controlled demonstration of measurement and remediation; not a customer benchmark.',
};
await writeFile('evidence/rescue/comparison.json', JSON.stringify(comparison, null, 2));
await writeFile(
  'evidence/rescue/COMPARISON.md',
  `# Automation Rescue — controlled before/after\n\n| Metric | Before | After | Change |\n| --- | ---: | ---: | ---: |\n| Pass rate | ${(before.passRate * 100).toFixed(0)}% | ${(after.passRate * 100).toFixed(0)}% | +${comparison.delta.passRatePoints} pp |\n| Failed runs | ${before.failed} | ${after.failed} | -${comparison.delta.failuresRemoved} |\n| Flaky | ${before.flaky ? 'yes' : 'no'} | ${after.flaky ? 'yes' : 'no'} | resolved |\n\n${comparison.boundary}\n`,
);
console.log(comparison);
