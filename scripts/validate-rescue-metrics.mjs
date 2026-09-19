import { readFile } from 'node:fs/promises';

const result = JSON.parse(await readFile('evidence/rescue/comparison.json', 'utf8'));
if (result.before.passRate !== 0.8)
  throw new Error(`Expected controlled before pass rate 0.8, received ${result.before.passRate}`);
if (result.after.passRate !== 1)
  throw new Error(`Expected rescued pass rate 1, received ${result.after.passRate}`);
if (!result.before.flaky || result.after.flaky)
  throw new Error('Expected flakiness to be resolved.');
console.log('Controlled rescue metrics validated.');
