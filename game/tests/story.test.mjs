import test from 'node:test';
import assert from 'node:assert/strict';
import { sceneFor, endingFor, journey, validSave, validateChoices } from '../dist/story.js';

test('all 729 complete paths have six choices, valid scenes and a reachable ending', () => {
  const endings = new Set();
  for (let seed = 0; seed < 729; seed++) {
    let n = seed; const choices = [];
    for (let step = 0; step < 6; step++) {
      const scene = sceneFor(choices);
      assert.equal(scene.options.length, 3);
      assert.ok(scene.title && scene.question && scene.paragraphs.length);
      for (const option of scene.options) assert.ok(option.title && option.hint && option.echo);
      choices.push(n % 3); n = Math.floor(n / 3);
    }
    const ending = endingFor(choices); endings.add(ending.id);
    assert.equal(journey(choices).length, 6);
    assert.ok(ending.work && ending.tradeoff && ending.learning);
    assert.ok(validSave({ version: 1, choices, phase: 'ending' }));
  }
  assert.deepEqual([...endings].sort(), ['director', 'parallel', 'together', 'writer']);
});
test('initial direction changes the actual third scene', () => {
  assert.equal(sceneFor([0, 0]).title, '비가 그치지 않는다');
  assert.equal(sceneFor([0, 1]).title, '한 문장을 두고');
  assert.equal(sceneFor([0, 2]).title, '비워둔 주말');
});
test('earlier negotiation experience changes the later offer outcome', () => {
  const agreement = sceneFor([0, 0, 1, 0]).options[2].echo;
  const noAgreement = sceneFor([0, 0, 0, 0]).options[2].echo;
  assert.match(agreement, /합의/); assert.match(noAgreement, /일정은 맞지/);
});
test('ending retains prior work, learning and cost rather than just the last decision', () => {
  const first = endingFor([0, 0, 0, 0, 0, 1]);
  const second = endingFor([2, 1, 2, 2, 1, 1]);
  assert.equal(first.id, second.id);
  assert.notEqual(first.work, second.work);
  assert.notEqual(first.learning, second.learning);
  assert.notEqual(first.tradeoff, second.tradeoff);
});
test('corrupt, incomplete and obsolete saves are rejected', () => {
  for (const value of [null, {}, { version: 2, choices: [], phase: 'scene' }, { version: 1, choices: [3], phase: 'echo' }, { version: 1, choices: [], phase: 'ending' }, { version: 1, choices: [], phase: 'echo' }, { version: 1, choices: [0, 0, 0, 0, 0, 0], phase: 'scene' }]) assert.ok(!validSave(value));
  for (const value of ['0', [NaN], [1.5], [-1], [0, 0, 0, 0, 0, 0, 0]]) assert.equal(validateChoices(value), false);
  assert.throws(() => endingFor([0, 0]));
  assert.throws(() => sceneFor([0, 0, 0, 0, 0, 0]));
});
test('save accepts a completed choice before the ending transition', () => {
  assert.ok(validSave({ version: 1, choices: [0, 0, 0, 0, 0, 0], phase: 'echo' }));
  assert.ok(validSave({ version: 1, choices: [], phase: 'scene' }));
});
