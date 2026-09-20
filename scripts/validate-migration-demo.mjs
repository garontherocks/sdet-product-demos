import { mkdir, readFile, writeFile } from 'node:fs/promises';

const manifest = JSON.parse(await readFile('demos/migration/manifest.json', 'utf8'));
const legacy = await readFile(
  'demos/migration/legacy-cypress/cypress/e2e/storefront.cy.js',
  'utf8',
);
const migrated = await readFile('tests/migration/migrated.spec.ts', 'utf8');
const report = JSON.parse(await readFile('artifacts/migration-results.json', 'utf8'));

const ids = manifest.scenarios.map((scenario) => scenario.id);
for (const id of ids) {
  if (!legacy.includes(id)) throw new Error(`${id} is missing from the legacy source.`);
  if (!migrated.includes(id)) throw new Error(`${id} is missing from the migrated source.`);
}

const specs = [];
function collect(suite) {
  for (const spec of suite.specs ?? []) specs.push(spec);
  for (const child of suite.suites ?? []) collect(child);
}
for (const suite of report.suites ?? []) collect(suite);
const passed = ids.filter((id) =>
  specs.some((spec) => spec.ok === true && spec.title?.includes(id)),
).length;
const direct = manifest.scenarios.filter((item) => item.disposition === 'direct').length;
const adapted = manifest.scenarios.filter((item) => item.disposition === 'adapt').length;
const summary = {
  schemaVersion: '1.0',
  generatedAt: new Date().toISOString(),
  product: 'Playwright Migration Toolkit',
  sourceFramework: manifest.sourceFramework,
  targetFramework: manifest.targetFramework,
  legacyScenarios: ids.length,
  mappedScenarios: ids.length,
  executedTargetScenarios: passed,
  coverageParity: Number((passed / ids.length).toFixed(2)),
  directMappings: direct,
  adaptedMappings: adapted,
  boundary: 'Sanitized deterministic demo; parity reflects the declared demo scenarios only.',
};
if (summary.coverageParity !== 1)
  throw new Error(`Expected complete demo parity, received ${summary.coverageParity}`);
await mkdir('evidence/migration', { recursive: true });
await Promise.all([
  writeFile('evidence/migration/summary.json', JSON.stringify(summary, null, 2)),
  writeFile(
    'evidence/migration/SUMMARY.md',
    `# Playwright migration demo summary\n\n| Legacy scenarios | Mapped | Executed target | Coverage parity | Direct | Adapted |\n| ---: | ---: | ---: | ---: | ---: | ---: |\n| ${summary.legacyScenarios} | ${summary.mappedScenarios} | ${summary.executedTargetScenarios} | ${(summary.coverageParity * 100).toFixed(0)}% | ${direct} | ${adapted} |\n\n${summary.boundary}\n`,
  ),
]);
console.log(summary);
