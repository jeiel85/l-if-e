import test from 'node:test';
import assert from 'node:assert/strict';
import { keepsakesOf, moveCut, forkLife, differences } from '../dist/interactions.js';
import { validSave } from '../dist/story.js';

test('old saves and malformed optional content get safe, independent keepsakes', () => {
  const book = keepsakesOf({ title: 'a\u0000b'.repeat(30), cuts: ['leave', 'leave', 'unknown'], found: ['window', 'window', '__proto__', 1, 'cup'] });
  assert.equal(book.title.length, 40); assert.ok(!book.title.includes('\u0000'));
  assert.deepEqual(book.cuts, ['leave', 'pause', 'return']);
  assert.deepEqual(book.found, ['window', 'cup']);
  assert.deepEqual(keepsakesOf({ cuts: [{ toString: null }, 'pause', 'return'] }).cuts, ['leave', 'pause', 'return']);
  const first = keepsakesOf(); first.cuts.reverse(); first.found.push('cup');
  assert.deepEqual(keepsakesOf(), { title: '', cuts: ['leave', 'pause', 'return'], found: [] });
  assert.ok(validSave({ version: 1, phase: 'scene', choices: [0, 1] }));
});
test('cut moves preserve every shot and do not mutate the original', () => {
  const original = ['leave', 'pause', 'return'];
  assert.deepEqual(moveCut(original, 1, -1), ['pause', 'leave', 'return']);
  assert.deepEqual(moveCut(original, 0, -1), original);
  assert.deepEqual(original, ['leave', 'pause', 'return']);
  assert.throws(() => moveCut(original, -1, 1));
  assert.throws(() => moveCut(original, 1, 2));
});
test('branching at every point preserves only prior decisions and clones its source', () => {
  const choices = [0, 1, 2, 0, 1, 2];
  const book = { title: '비 오는 오후', cuts: ['return', 'leave', 'pause'], found: ['window'] };
  for (let chapter = 0; chapter < 6; chapter++) {
    const save = forkLife(choices, chapter, book);
    assert.ok(validSave(save)); assert.deepEqual(save.choices, choices.slice(0, chapter));
    assert.deepEqual(save.fromChoices, choices); assert.deepEqual(save.keepsakes, book);
    save.keepsakes.found.push('cup'); save.fromChoices[0] = 2;
    assert.deepEqual(book.found, ['window']); assert.equal(choices[0], 0);
  }
  for (const index of [-1, 6, 1.5]) assert.throws(() => forkLife(choices, index, book));
  assert.throws(() => forkLife([0], 0, book));
});
test('comparison shows downstream consequences even when later option numbers match', () => {
  const before = [0, 0, 0, 0, 0, 0];
  assert.deepEqual(differences(before, before), []);
  assert.deepEqual(differences(null, before), []);
  const after = [0, 1, 0, 0, 0, 0];
  const changes = differences(before, after);
  assert.ok(changes.some(item => item.chapter === 2));
  assert.ok(changes.some(item => item.chapter === 3));
  assert.equal(changes.some(item => item.chapter === 1), false);
  const consequence = differences([0, 0, 0, 0, 2, 0], [0, 0, 1, 0, 2, 0]);
  assert.ok(consequence.some(item => item.chapter === 5 && item.before.choice === item.after.choice && item.before.result !== item.after.result));
});
