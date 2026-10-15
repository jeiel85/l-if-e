// Code: MIT. Original fictional events and descriptions: CC BY 4.0.
export const LIFE_KEY = 'galim.life.v1';
export const LIVES_KEY = 'galim.lives.v1';
export const STAT_INFO = {
  money: { label: '생활비', unit: '만원', max: 9999 },
  energy: { label: '활력', unit: '/100', max: 100 },
  craft: { label: '창작 경험', unit: '/100', max: 100 },
  bonds: { label: '관계', unit: '/100', max: 100 }
};
export const ACTIONS = {
  work: { title: '일하기', icon: '⌑', hint: '생활의 바탕을 만든다', effects: { money: 18, energy: -15, bonds: 1 }, text: '일을 마치고 돌아왔다. 작업할 시간은 줄었지만, 다음 주를 위한 생활비가 생겼다.' },
  study: { title: '배우기', icon: '▤', hint: '보고, 읽고, 익힌다', effects: { money: -6, energy: -10, craft: 10 }, text: '마음에 남은 장면을 여러 번 되짚었다. 막연했던 감각이 조금씩 자신만의 방법이 된다.' },
  create: { title: '만들기', icon: '✎', hint: '내 이야기를 한 장면씩', effects: { money: -7, energy: -15, craft: 7, drafts: 1 }, text: '공책의 장면 하나를 작업으로 옮겼다. 완성은 아직이지만, 이제 손으로 만질 수 있는 무언가가 있다.' },
  meet: { title: '만나기', icon: '◌', hint: '함께 만들 사람을 만난다', effects: { money: -5, energy: -8, bonds: 12 }, text: '누군가와 서로의 작업을 이야기했다. 혼자 생각할 때는 보이지 않던 다음 장면이 조금 보인다.' },
  rest: { title: '쉬어가기', icon: '☾', hint: '오래 이어갈 힘을 되찾는다', effects: { money: -3, energy: 30 }, text: '일정을 비우고 쉬었다. 아무것도 완성하지 않은 한 주도, 다음 작업을 가능하게 하는 시간이다.' }
};
const choice = (title, effects, text, extra = {}) => ({ title, effects, text, ...extra });
const workName = state => state.route === 'writing' ? '글' : '영상';
export const EVENTS = {
  notebook: { once: true, title: '공책 밖으로 나갈 이야기', why: '처음으로 직접 만드는 시간을 보냈습니다.', body: '작은 작업 하나가 생겼다. 혼자 조금 더 다듬을 수도, 아직 거친 채로 누군가에게 보여줄 수도 있다.', options: [choice('혼자 다듬어 나만의 방향을 찾는다', { craft: 7 }, '아직 서툴지만, 왜 이 장면을 만들었는지 조금 더 분명해졌다.'), choice('모임에 가져가 의견을 듣는다', { bonds: 9, craft: 3 }, '사람마다 다른 장면을 좋아했다. 당신의 이야기가 처음으로 대화의 재료가 됐다.'), choice('당장은 일과 작업을 함께 이어간다', { money: 8, energy: 4 }, '조금 느려지더라도 돌아올 수 있는 책상을 남겨두기로 했다.')] },
  direction: { once: true, title: '어떤 이야기꾼이 될까', why: '작업과 배움의 경험이 쌓였습니다.', body: '몇 번의 시도 뒤, 내가 오래 붙잡고 싶은 방식이 보이기 시작한다. 다음 작업은 어디에 더 가까울까?', options: [choice('장면을 찍는 사람이 되고 싶다', { craft: 5 }, '머릿속 장면을 화면으로 옮기는 일을 계속해보기로 했다.', { route: 'film' }), choice('문장으로 이야기를 건네고 싶다', { craft: 5 }, '이미지를 문장으로 옮겨보았다. 글의 호흡 안에서 다른 가능성이 열렸다.', { route: 'writing' }), choice('일과 창작을 나란히 이어가고 싶다', { money: 8, bonds: 4 }, '오래 이어갈 수 있는 속도를 먼저 찾기로 했다.', { route: 'balanced' })] },
  energy: { cooldown: 3, title: '책상 앞에서 눈이 감긴다', why: '활력이 18 이하로 내려갔습니다.', body: '다음 장면이 떠오르지 않는다. 해야 할 일은 있지만, 지금의 몸으로 같은 속도를 유지하기는 어렵다.', options: [choice('약속을 정리하고 충분히 쉰다', { energy: 35 }, '당장 진행하지 못한 일은 남았다. 대신 다시 시작할 힘을 되찾았다.'), choice('동료에게 일을 나눠 맡긴다', { energy: 25, bonds: -6 }, '혼자 끝내려던 일을 나눴다. 도움을 받았고, 다음에는 돌려주기로 했다.'), choice('회복을 위한 하루를 제대로 마련한다', { money: -8, energy: 50 }, '마음을 놓고 쉬는 시간을 마련했다. 늘 같은 속도로 살아야 하는 것은 아니었다.')] },
  money: { cooldown: 3, title: '생활비를 다시 계산한다', why: '남은 생활비가 10만원 이하입니다.', body: '작업을 계속하려면 이번 주의 생활부터 지켜야 한다. 이 고비를 어떻게 지나갈까?', options: [choice('필요한 사정을 설명하고 도움을 구한다', { money: 20, energy: 8, bonds: -3 }, '상황을 솔직하게 나눴다. 잠깐의 도움을 받고 다음 계획을 다시 세웠다.'), choice('작업을 줄이고 짧은 일을 맡는다', { money: 28, energy: -8 }, '이번에는 일할 시간을 먼저 확보했다. 작업은 잠시 느려졌지만 생활이 이어진다.'), choice('작업 도구를 빌려 쓰며 지출을 줄인다', { money: 14, bonds: -4 }, '가지고 있어야 한다고 생각했던 것을 빌려 쓰기 시작했다. 다음 작업의 규모도 줄였다.')] },
  production: { cooldown: 4, title: '한 편으로 묶을 때', why: '초고 3개와 창작 경험 28 이상을 쌓았습니다.', body: '흩어져 있던 장면들이 하나의 작업으로 이어질 수 있을 것 같다. 지금 가진 자원으로 어떤 형태를 만들까?', options: [choice('혼자 작은 작품을 끝까지 완성한다', { money: -10, energy: -16, craft: 7, drafts: -3, completed: 1 }, '규모를 줄여 직접 마무리했다. 서툰 곳까지 포함해 당신의 이름으로 완성한 한 편이다.'), choice('동료와 함께 더 큰 작업을 완성한다', { money: -5, energy: -10, bonds: 7, craft: 6, drafts: -3, completed: 1 }, '서로 할 수 있는 일을 나눴다. 혼자였다면 만들지 못했을 한 편에 여러 이름이 적혔다.', { require: { bonds: 30 } }), choice('이번에는 실험작으로 작게 완성한다', { energy: -5, craft: 4, drafts: -3, completed: 1 }, '비용이 들지 않는 방법으로 형식을 바꿨다. 다음 작업에 가져갈 실험이 한 편 남았다.')] },
  invitation: { cooldown: 4, title: '작품을 건넬 곳', why: '아직 소개하지 않은 완성작과 창작 경험 40 이상이 있습니다.', body: '이제 작업을 책상 밖으로 보내볼 수 있다. 어느 곳에서, 어떤 사람을 만나고 싶은가?', options: [choice('국제 작품전의 초청 기회를 잡는다', { money: -12, energy: -10, bonds: 6, craft: 3, shown: 1, invitations: 1 }, '당신의 작업이 국제 작품전에 초청됐다. 낯선 관객과 대화를 나누고 다음 작품을 떠올렸다.', { require: { craft: 55, bonds: 35 } }), choice('가까운 지역의 작은 발표회에서 만난다', { bonds: 10, craft: 5, shown: 1 }, '작은 공간에서 관객과 만났다. 돌아오는 길에는 작업을 계속할 이유가 하나 더 생겼다.'), choice('조금 더 다듬고 다음 기회를 준비한다', { energy: -5, craft: 7 }, '이번에는 서두르지 않았다. 어떤 부분을 바꾸고 누구에게 보여줄지 계획이 분명해졌다.')] },
  rain: { cooldown: 9, title: '계획에 없던 비', why: '직접 만드는 작업을 이어가다 예상 밖의 상황을 만났습니다.', body: '준비한 작업을 하려던 날, 비가 내린다. 창밖을 보던 사람들은 당신의 다음 말을 기다린다.', options: [choice('날씨에 맞춰 장면을 고쳐본다', { craft: 8, energy: -5 }, '지붕 아래에서 안전하게 방법을 바꿨다. 빗소리와 침묵이 작업의 일부가 됐다.'), choice('함께할 사람들과 일정을 다시 잡는다', { bonds: 9, energy: -3 }, '모두의 시간을 다시 물었다. 기다리는 동안 서로의 사정을 조금 더 알게 됐다.'), choice('오늘은 자료를 정리하고 준비를 더 한다', { craft: 4, energy: 6 }, '진행하지 못한 일을 정리하고 준비를 보완했다. 기다림도 작업의 일부로 남았다.')] },
  offer: { cooldown: 8, title: '처음 보는 이름의 연락', why: '다른 사람과의 관계가 25 이상으로 쌓였습니다.', body: '누군가 작은 작업을 맡기고 싶다고 한다. 반가운 제안이지만, 개인 작업에 쓸 시간을 나눠야 한다.', options: [choice('의뢰를 받아 생활의 여유를 만든다', { money: 24, energy: -12, craft: 3 }, '정해진 조건 안에서 한 작업을 마쳤다. 받은 작업비가 다음 개인 작업의 바탕이 됐다.'), choice('범위를 줄여 함께할 조건을 제안한다', { money: 12, bonds: 7, energy: -6 }, '서로 지킬 수 있는 범위를 찾았다. 크게 벌지는 못했지만 다음에도 연락할 사람이 생겼다.'), choice('지금은 내 작업을 먼저 한다', { craft: 6, drafts: 1, energy: -6 }, '이번 의뢰는 정중히 사양했다. 비워둔 시간에 개인 작업의 초고를 하나 더 남겼다.')] },
  mentor: { cooldown: 10, title: '모임이 끝난 뒤의 한마디', why: '창작 경험이 25 이상이 되었습니다.', body: '당신의 작업을 본 사람이 조심스럽게 의견을 건넨다. 좋은 말만 있는 것은 아니지만, 오래 생각할 질문이 있다.', options: [choice('의견을 듣고 한 번 더 고친다', { craft: 9, energy: -4 }, '설명하지 못했던 부분을 다시 썼다. 전부 받아들이지는 않아도 다른 시선을 배울 수 있었다.'), choice('내가 지키고 싶은 장면을 설명한다', { craft: 5, bonds: 5 }, '고집과 의도 사이의 차이를 이야기했다. 상대도 당신이 보고 있던 것을 조금 이해했다.'), choice('다른 사람의 작업도 함께 살펴본다', { bonds: 10, craft: 3 }, '당신의 작업만 보던 시간이 서로의 작업을 읽는 모임으로 이어졌다.')] },
  everyday: { cooldown: 5, title: '그냥 지나칠 뻔한 풍경', why: '일상을 보내다 작은 이야기의 실마리를 만났습니다.', body: '익숙한 길에서 눈길을 끄는 사람이 보인다. 특별한 사건은 아니지만, 오래 남을 장면일지도 모른다.', options: [choice('잠깐 멈추고 공책에 적어둔다', { craft: 5, drafts: 1 }, '길에서 본 작은 순간이 다음 작업의 한 장면이 됐다.'), choice('친구에게 오늘 본 이야기를 건넨다', { bonds: 7 }, '같은 장면에서 전혀 다른 이야기를 떠올렸다. 대화가 길어졌다.'), choice('오늘은 생활로 돌아간다', { energy: 8 }, '모든 순간을 작업으로 만들지 않아도 괜찮다. 오늘의 생활을 마저 살았다.')] }
};
const integer = n => Number.isInteger(n) && Number.isFinite(n);
const clone = value => structuredClone(value);
const clamp = (n, max) => Math.min(max, Math.max(0, n));
function rng(state) { let x = state.rng; x ^= x << 13; x ^= x >>> 17; x ^= x << 5; state.rng = x >>> 0 || 1; return state.rng; }
export function createLife(seed = 1, id = `life-${seed}`) {
  return { version: 1, id, week: 0, stats: { money: 70, energy: 85, craft: 10, bonds: 15 }, counts: { work: 0, study: 0, create: 0, meet: 0, rest: 0 }, work: { drafts: 0, completed: 0, shown: 0, invitations: 0 }, route: 'undecided', rng: seed >>> 0 || 1, pending: null, events: {}, lastEventWeek: -3, achieved: false, finished: false, keepsakes: { title: '', cuts: ['leave', 'pause', 'return'], found: [] }, log: [] };
}
export function actualEffects(state, effects) {
  return Object.fromEntries(Object.entries(effects).map(([key, amount]) => [key, Object.hasOwn(STAT_INFO, key) ? clamp(state.stats[key] + amount, STAT_INFO[key].max) - state.stats[key] : amount]));
}
export function requirements(state, item) {
  const reasons = [];
  for (const [key, amount] of Object.entries(item.effects || {})) {
    const current = Object.hasOwn(STAT_INFO, key) ? state.stats[key] : state.work[key];
    if (['money', 'energy', 'drafts'].includes(key) && amount < 0 && current + amount < 0) reasons.push(`${STAT_INFO[key]?.label || '초고'} ${-amount}${STAT_INFO[key]?.unit === '만원' ? '만원' : ''} 필요`);
  }
  for (const [key, minimum] of Object.entries(item.require || {})) if (state.stats[key] < minimum) reasons.push(`${STAT_INFO[key].label} ${minimum} 이상 필요`);
  return reasons;
}
function apply(state, effects) {
  const delta = actualEffects(state, effects);
  for (const [key, amount] of Object.entries(delta)) {
    if (Object.hasOwn(STAT_INFO, key)) state.stats[key] += amount;
    else state.work[key] += amount;
  }
  return delta;
}
function log(state, type, title, text, effects = {}) {
  state.log.push({ id: state.log.length + 1, week: state.week, type, title, text, effects });
}
export function goalReached(state) { return state.work.completed >= 3 && state.work.invitations >= 2 && state.stats.craft >= 65 && state.stats.bonds >= 40; }
function eligible(state, id) {
  const event = EVENTS[id], seen = state.events[id];
  return (!event.once || !seen) && (!seen || state.week - seen.last >= (event.cooldown || 0));
}
function selectEvent(state, action) {
  if (goalReached(state) && !state.achieved) return 'milestone';
  if (state.stats.energy <= 18 && eligible(state, 'energy')) return 'energy';
  if (state.stats.money <= 10 && eligible(state, 'money')) return 'money';
  if (state.counts.create >= 1 && eligible(state, 'notebook')) return 'notebook';
  if (state.week >= 3 && state.counts.create + state.counts.study >= 2 && eligible(state, 'direction')) return 'direction';
  if (state.week - state.lastEventWeek < 2) return null;
  if (state.work.drafts >= 3 && state.stats.craft >= 28 && eligible(state, 'production')) return 'production';
  if (state.work.completed > state.work.shown && state.stats.craft >= 40 && eligible(state, 'invitation')) return 'invitation';
  const candidates = [];
  if (action === 'create' && state.counts.create >= 2 && eligible(state, 'rain')) candidates.push('rain');
  if (state.stats.bonds >= 25 && eligible(state, 'offer')) candidates.push('offer');
  if (state.stats.craft >= 25 && eligible(state, 'mentor')) candidates.push('mentor');
  if (eligible(state, 'everyday')) candidates.push('everyday');
  if (!candidates.length || rng(state) % 3 === 0) return null;
  return candidates[rng(state) % candidates.length];
}
function queue(state, action) {
  let id = selectEvent(state, action);
  if (id && id !== 'milestone' && EVENTS[id].options.every(option => requirements(state, option).length)) id = state.stats.energy < 16 ? 'energy' : 'money';
  if (id) { state.pending = id; state.lastEventWeek = state.week; }
}
function ensurePlayable(state) {
  if (!state.finished && !state.pending && Object.values(ACTIONS).every(action => requirements(state, action).length)) {
    state.pending = state.stats.energy < 15 ? 'energy' : 'money'; state.lastEventWeek = state.week;
  }
}
export function takeAction(input, id) {
  const item = ACTIONS[id];
  if (!Object.hasOwn(ACTIONS, id)) throw new Error('알 수 없는 행동입니다.');
  if (input.finished) throw new Error('기록한 삶입니다. 새로운 삶을 시작해 주세요.');
  if (input.pending) throw new Error('기다리고 있는 사건의 선택을 먼저 해주세요.');
  const reasons = requirements(input, item);
  if (reasons.length) throw new Error(reasons.join(' · '));
  const state = clone(input);
  state.week++; state.counts[id]++;
  const delta = apply(state, item.effects);
  log(state, 'action', item.title, item.text, delta);
  queue(state, id);
  return state;
}
export function currentEvent(state) {
  if (state.pending === 'milestone') return {
    title: '당신의 이야기가 세계에 닿았습니다', why: '완성작 3편 · 국제 초청 2회 · 창작 경험 65 · 관계 40을 달성했습니다.',
    body: `직접 완성한 ${workName(state)} ${state.work.completed}편과 ${state.work.invitations}번의 국제 초청. ${state.week}주 동안 쌓아온 경험이 당신만의 삶이 되었습니다. 더 살아보시겠어요?`,
    options: [choice('이 삶을 계속 살아본다', {}, '목표 뒤에도 생활은 이어진다. 이미 만든 이름보다, 다음에 만들 이야기가 궁금하다.', { continue: true }), choice('여기까지의 삶을 기록한다', {}, '지금까지의 선택과 작업을 한 권의 기록으로 남겼다.', { finish: true })]
  };
  return state.pending && Object.hasOwn(EVENTS, state.pending) ? EVENTS[state.pending] : null;
}
export function resolveEvent(input, optionIndex) {
  const event = currentEvent(input);
  if (!event || !integer(optionIndex) || !event.options[optionIndex]) throw new Error('선택할 사건이 없습니다.');
  const option = event.options[optionIndex];
  const reasons = requirements(input, option);
  if (reasons.length) throw new Error(reasons.join(' · '));
  const state = clone(input), id = state.pending;
  const delta = apply(state, option.effects);
  if (option.route) state.route = option.route;
  if (id === 'milestone') state.achieved = true;
  if (option.finish) state.finished = true;
  state.events[id] = { last: state.week, count: (state.events[id]?.count || 0) + 1 };
  state.pending = null;
  log(state, id === 'milestone' ? 'milestone' : 'choice', option.title, option.text, delta);
  // A decision can expose an urgent need or the goal, but ordinary events wait for another week.
  if (!state.finished && !state.achieved && goalReached(state)) state.pending = 'milestone';
  ensurePlayable(state);
  return state;
}
export function recordLife(input) {
  if (input.finished || !input.achieved || input.pending) throw new Error('목표에 도달한 뒤, 기다리는 사건을 마무리하면 기록할 수 있어요.');
  const state = clone(input); state.finished = true;
  log(state, 'milestone', '여기까지의 삶을 기록한다', '목표에 도달한 뒤 이어온 생활과 작업도 함께 기록했다.');
  return state;
}
export function validLife(value) {
  if (!value || value.version !== 1 || typeof value.id !== 'string' || value.id.length > 100 || !integer(value.week) || value.week < 0 || !integer(value.rng) || value.rng < 1 || value.rng > 0xffffffff) return false;
  if (!value.stats || !Object.entries(STAT_INFO).every(([key, info]) => integer(value.stats[key]) && value.stats[key] >= 0 && value.stats[key] <= info.max)) return false;
  if (!value.work || !['drafts', 'completed', 'shown', 'invitations'].every(k => integer(value.work[k]) && value.work[k] >= 0) || value.work.shown > value.work.completed || value.work.invitations > value.work.shown) return false;
  if (!value.counts || !Object.keys(ACTIONS).every(k => integer(value.counts[k]) && value.counts[k] >= 0) || Object.values(value.counts).reduce((a, b) => a + b, 0) !== value.week) return false;
  if (!['undecided', 'film', 'writing', 'balanced'].includes(value.route) || typeof value.achieved !== 'boolean' || typeof value.finished !== 'boolean' || (value.finished && !value.achieved)) return false;
  if (value.pending !== null && (typeof value.pending !== 'string' || (value.pending !== 'milestone' && !Object.hasOwn(EVENTS, value.pending)))) return false;
  if ((value.pending === 'milestone' && value.achieved) || (value.finished && value.pending)) return false;
  if (!value.events || typeof value.events !== 'object' || Array.isArray(value.events) || !Object.entries(value.events).every(([id, v]) => (id === 'milestone' || Object.hasOwn(EVENTS, id)) && v && integer(v.last) && v.last >= 0 && v.last <= value.week && integer(v.count) && v.count > 0)) return false;
  if (!integer(value.lastEventWeek) || value.lastEventWeek > value.week || !Array.isArray(value.log)) return false;
  return value.log.every((entry, i) => entry && entry.id === i + 1 && integer(entry.week) && entry.week >= 0 && entry.week <= value.week && ['action', 'choice', 'milestone'].includes(entry.type) && typeof entry.title === 'string' && typeof entry.text === 'string' && entry.title.length <= 200 && entry.text.length <= 1000 && entry.effects && Object.entries(entry.effects).every(([key, n]) => (Object.hasOwn(STAT_INFO, key) || ['drafts', 'completed', 'shown', 'invitations'].includes(key)) && integer(n)));
}
