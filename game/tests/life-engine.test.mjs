import test from 'node:test';
import assert from 'node:assert/strict';
import { ACTIONS, createLife, takeAction, currentEvent, resolveEvent, requirements, validLife, goalReached, recordLife } from '../dist/life-engine.js';

test('the same time spent on different activities changes resources and events', () => {
  const base = createLife(123);
  const worked = takeAction(base, 'work');
  const made = takeAction(base, 'create');
  assert.equal(base.week, 0); assert.equal(base.log.length, 0);
  assert.equal(worked.week, 1); assert.equal(made.week, 1);
  assert.ok(worked.stats.money > made.stats.money);
  assert.equal(worked.pending, null); assert.equal(made.pending, 'notebook');
  assert.equal(made.work.drafts, 1); assert.ok(validLife(made));
});
test('insufficient resources and unresolved decisions cannot be bypassed', () => {
  const state = createLife(8); state.stats.money = 0;
  assert.throws(() => takeAction(state, 'study'));
  const pending = takeAction(createLife(8), 'create');
  assert.throws(() => takeAction(pending, 'work'));
  assert.throws(() => resolveEvent(pending, 9));
  const production = createLife(8); production.pending = 'production'; production.work.drafts = 3;
  assert.ok(requirements(production, currentEvent(production).options[1]).length);
  assert.throws(() => resolveEvent(production, 1));
});
test('hundreds of weeks remain playable with bounded resources and a complete history', () => {
  for (let seed = 1; seed <= 16; seed++) {
    let state = createLife(seed), pick = seed;
    for (let step = 0; step < 350; step++) {
      pick = (Math.imul(pick, 1664525) + 1013904223) >>> 0;
      if (state.pending) {
        const options = currentEvent(state).options.map((option, i) => ({ option, i })).filter(({ option }) => !requirements(state, option).length && !option.finish);
        assert.ok(options.length, `${seed}/${step}: ${state.pending}`);
        state = resolveEvent(state, options[pick % options.length].i);
      } else {
        const actions = Object.entries(ACTIONS).filter(([, action]) => !requirements(state, action).length);
        assert.ok(actions.length, `${seed}/${step}: no affordable action`);
        state = takeAction(state, actions[pick % actions.length][0]);
      }
      assert.ok(validLife(state), `${seed}/${step}: invalid state`);
      assert.equal(state.log.length, step + 1);
    }
    assert.ok(state.week > 6); assert.equal(state.finished, false);
  }
});
test('the goal can be reached through play and continuing never asks the same question twice', () => {
  let state = createLife(87);
  for (let guard = 0; guard < 250 && state.pending !== 'milestone'; guard++) {
    if (state.pending) {
      const options = currentEvent(state).options;
      const preferred = state.pending === 'notebook' ? 1 : state.pending === 'production' ? 1 : 0;
      const index = !requirements(state, options[preferred]).length ? preferred : options.findIndex(o => !requirements(state, o).length);
      state = resolveEvent(state, index);
    } else {
      const id = state.stats.energy < 30 ? 'rest' : state.stats.money < 25 ? 'work' : state.stats.bonds < 40 ? 'meet' : state.stats.craft < 55 ? 'study' : state.work.drafts < 3 ? 'create' : 'rest';
      state = takeAction(state, id);
    }
  }
  assert.equal(state.pending, 'milestone'); assert.ok(goalReached(state));
  assert.ok(state.week > 6);
  const finished = resolveEvent(state, 1); assert.ok(finished.finished); assert.ok(validLife(finished));
  assert.throws(() => takeAction(finished, 'rest'));
  const continued = resolveEvent(state, 0); assert.ok(continued.achieved); assert.equal(continued.finished, false);
  const later = takeAction(continued, 'rest'); assert.notEqual(later.pending, 'milestone');
  if (!later.pending) assert.ok(recordLife(later).finished);
});
test('corrupt save data is rejected while a round trip preserves all decisions', () => {
  const state = takeAction(createLife(42), 'create');
  assert.deepEqual(JSON.parse(JSON.stringify(state)), state);
  for (const bad of [null, {}, { ...state, stats: { ...state.stats, energy: -1 } }, { ...state, pending: { toString: null } }, { ...state, events: 1 }, { ...state, log: [{ id: 1, type: 'bad' }] }, { ...state, work: { ...state.work, invitations: 100 } }]) assert.equal(validLife(bad), false);
});
