// Code: MIT. Original UI/narrative text: CC BY 4.0.
import { LIFE_KEY, LIVES_KEY, STAT_INFO, ACTIONS, createLife, takeAction, currentEvent, resolveEvent, requirements, actualEffects, recordLife, validLife } from './life-engine.js';
import { CLUES, CUTS, keepsakesOf, moveCut } from './interactions.js';

const main = document.querySelector('#main');
const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let life = null, lives = [], storageOK = true, historyFilter = 'all', viewedRecord = null, noticeTimer, previewTimer;
const routeName = value => ({ undecided: '아직 이름 붙이지 않은 가능성', film: '영화로 이야기를 만드는 사람', writing: '문장으로 이야기를 건네는 사람', balanced: '일과 창작을 함께 이어가는 사람' }[value]);
const workLabel = key => ({ drafts: '초고', completed: '완성작', shown: '소개한 작품', invitations: '국제 초청' }[key]);
function notify(text) { const node = document.querySelector('#notice'); node.textContent = text; node.classList.add('visible'); clearTimeout(noticeTimer); noticeTimer = setTimeout(() => node.classList.remove('visible'), 5000); }
function load() {
  try {
    const raw = localStorage.getItem(LIFE_KEY);
    if (raw) {
      try { const value = JSON.parse(raw); if (!validLife(value)) throw Error('Invalid life'); life = { ...value, keepsakes: keepsakesOf(value.keepsakes) }; }
      catch { notify('진행 기록을 읽지 못했어요. 보관된 삶과 이전 버전 기록은 그대로 두고 새로 시작할 수 있습니다.'); }
    }
    const rawLives = localStorage.getItem(LIVES_KEY);
    if (rawLives) {
      try { const values = JSON.parse(rawLives); if (!Array.isArray(values)) throw Error('Invalid records'); lives = values.filter(r => r && validLife(r.state) && r.state.finished && typeof r.date === 'string' && Number.isFinite(Date.parse(r.date))).slice(-20).map(r => ({ ...r, state: { ...r.state, keepsakes: keepsakesOf(r.state.keepsakes) } })); if (lives.length !== values.length) notify('일부 기록을 읽지 못해 확인 가능한 삶만 불러왔습니다.'); }
      catch { notify('완성한 삶의 기록을 읽지 못했어요. 현재 진행은 계속할 수 있습니다.'); }
    }
  } catch { storageOK = false; notify('브라우저 저장소를 사용할 수 없어 이 창에서만 진행할 수 있어요.'); }
}
function persist() {
  try { if (life) localStorage.setItem(LIFE_KEY, JSON.stringify(life)); localStorage.setItem(LIVES_KEY, JSON.stringify(lives)); }
  catch { storageOK = false; notify('기록을 저장하지 못했어요. 이 창에서 계속할 수 있지만 창을 닫으면 새 진행이 사라질 수 있습니다.'); }
}
function archive() {
  if (!life?.finished) return;
  const key = `${life.id}:${life.week}:${life.log.length}`;
  if (!lives.some(r => r.key === key)) { lives.push({ key, date: new Date().toISOString(), state: structuredClone(life) }); lives = lives.slice(-20); }
}
function go(hash) { if (location.hash === hash) render(); else location.hash = hash; }
function start() {
  const seed = crypto.getRandomValues(new Uint32Array(1))[0];
  life = createLife(seed, crypto.randomUUID()); historyFilter = 'all'; viewedRecord = null;
  persist(); go('#play');
}
function requestStart() {
  if (!life || life.finished) return start();
  const dialog = document.querySelector('#restart-dialog'); dialog.returnValue = 'cancel'; dialog.showModal();
}
document.querySelector('#restart-dialog').addEventListener('close', event => { if (event.target.returnValue === 'restart') start(); });

function deltaMarkup(effects, compact = false) {
  const entries = Object.entries(effects).filter(([, value]) => value !== 0);
  if (!entries.length) return '<span class="delta-neutral">수치 변화 없음</span>';
  return entries.map(([key, value]) => `<span class="stat-delta ${value > 0 ? 'positive' : 'negative'}">${STAT_INFO[key]?.label || workLabel(key)} ${value > 0 ? '+' : '−'}${Math.abs(value)}${!compact && key === 'money' ? '만원' : ''}</span>`).join('');
}
function roomMarkup() {
  return `<section class="life-room" id="life-room" aria-label="당신의 생활 공간"><img src="./art.svg" alt="비 오는 창가의 책상, 펼친 공책과 찻잔" width="1000" height="1150"><div class="room-shade"></div><div class="room-caption"><span class="eyebrow">THE LIFE YOU ARE LIVING</span><h1 id="room-title">아직 쓰이지 않은 날들</h1><p id="room-description"></p><span id="room-project" hidden></span></div>${Object.entries(CLUES).map(([id, clue]) => `<button class="hotspot hotspot-${id}" data-clue="${id}" aria-label="${clue.label} 살펴보기"><span class="hotspot-dot" aria-hidden="true">+</span><span class="hotspot-label">${clue.label}</span></button>`).join('')}<div class="room-footer"><span id="room-fragments">기억 조각 0/3</span><button class="button secondary" data-action="notebook">내 공책 열기 ↗</button></div></section>`;
}
function boardMarkup() {
  return `<div class="life-dashboard"><div class="life-heading"><div><span class="eyebrow">어느 창작자의 삶 · 서도윤</span><span id="life-season"></span></div><div><button class="text-button" data-action="history">나의 선택 ↓</button><button class="text-button" data-action="new-life">새로운 삶</button></div></div><div class="life-stats" aria-label="현재의 생활 수치">${Object.entries(STAT_INFO).map(([key, info]) => `<div class="life-stat" data-stat="${key}"><div><span>${info.label}</span><span class="stat-flash"></span></div><strong>0<small>${info.unit}</small></strong><div class="stat-track"><span></span></div></div>`).join('')}</div><p class="stats-note">수치는 이 가상 세계의 게임 규칙입니다. 실존 인물의 실제 능력이나 재산을 뜻하지 않습니다.</p><div class="life-stage">${roomMarkup()}<aside class="life-controls"><div class="life-section-heading"><span class="eyebrow">YOUR NEXT WEEK</span><span id="elapsed-weeks"></span></div><h2 id="life-next-heading">다음 한 주를 어떻게 보낼까?</h2><p class="life-action-intro">한 번의 행동으로 한 주가 흐릅니다.<br>삶의 상태에 따라 새로운 사건이 찾아옵니다.</p><div id="pending-callout" hidden></div><div class="life-actions">${Object.entries(ACTIONS).map(([id, action], i) => `<button class="life-action" data-activity="${id}"><span class="activity-icon" aria-hidden="true">${action.icon}</span><span><strong>${action.title}</strong><small>${action.hint}</small><span class="action-deltas"></span><span class="action-reason"></span></span><kbd>${i + 1}</kbd></button>`).join('')}</div><div class="life-goal"><span class="eyebrow">A LIFE TO REACH</span><h3>나만의 작품으로 세계 무대에</h3><p>이 삶에 도착하면, 계속 살아볼지 묻습니다.</p><ul id="goal-progress"></ul></div><p class="life-rule-note">생활비 변화에는 한 주의 지출이 포함됩니다.<br>선택 횟수와 플레이 기한은 정해져 있지 않습니다.</p></aside></div><section class="live-history" aria-labelledby="history-heading"><div class="history-heading"><div><span class="eyebrow">THE PATH YOU HAVE TAKEN</span><h2 id="history-heading">나의 선택과 발자취 <span id="history-count">0</span></h2></div><div class="history-tools"><button data-filter="all" aria-pressed="true">모두</button><button data-filter="choices" aria-pressed="false">선택만</button><button data-action="back-to-life">생활 공간으로 ↑</button></div></div><p id="history-empty">첫 한 주를 살아보세요. 당신의 행동과 선택이 시간 순서대로 이곳에 남습니다.</p><div role="log" aria-label="선택과 행동의 기록" aria-live="polite" aria-relevant="additions"><ol id="life-history" class="life-history"></ol></div><p class="life-save-label" id="life-save-label"></p></section></div>`;
}
function appendHistory(container, entries, state = life) {
  for (const entry of entries.slice(container.children.length)) {
    const item = document.createElement('li'); item.dataset.type = entry.type;
    item.innerHTML = `<span class="history-marker" aria-hidden="true">${entry.type === 'action' ? '·' : entry.type === 'milestone' ? '✧' : '⑂'}</span><article><div class="history-meta"><span>${entry.week}주째</span><span>${entry.type === 'action' ? '한 주의 행동' : entry.type === 'milestone' ? '이룬 삶' : '나의 선택'}</span></div><h3>${esc(entry.title)}</h3><p>${esc(entry.text)}</p><div class="history-deltas">${deltaMarkup(entry.effects)}</div></article>`;
    container.append(item);
  }
  if (state === life) applyHistoryFilter();
}
function applyHistoryFilter() {
  const nodes = main.querySelectorAll('#life-history>li'); let visible = 0;
  nodes.forEach(node => { node.hidden = historyFilter === 'choices' && node.dataset.type === 'action'; if (!node.hidden) visible++; });
  const empty = document.querySelector('#history-empty');
  if (empty) { empty.hidden = visible > 0; empty.textContent = life?.log.length ? '아직 결정이 필요한 사건을 만나지 않았습니다. 한 주의 행동은 ‘모두’에서 볼 수 있어요.' : '첫 한 주를 살아보세요. 당신의 행동과 선택이 시간 순서대로 이곳에 남습니다.'; }
  main.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === historyFilter)));
}
function refreshBoard(previous = null, openEvent = false) {
  if (!life || !document.querySelector('#life-room')) return;
  document.querySelector('#life-season').textContent = `${Math.floor(life.week / 52) + 1}년차 · ${['봄', '여름', '가을', '겨울'][Math.floor((life.week % 52) / 13)]}`;
  document.querySelector('#elapsed-weeks').textContent = `살아온 ${life.week}주`;
  for (const [key, info] of Object.entries(STAT_INFO)) {
    const node = document.querySelector(`[data-stat="${key}"]`);
    node.querySelector('strong').innerHTML = `${life.stats[key]}<small>${info.unit}</small>`;
    node.querySelector('.stat-track>span').style.width = `${Math.min(100, life.stats[key] / (key === 'money' ? 150 : 100) * 100)}%`;
    const diff = previous ? life.stats[key] - previous.stats[key] : 0;
    node.querySelector('.stat-flash').textContent = diff ? `${diff > 0 ? '+' : '−'}${Math.abs(diff)}` : '';
  }
  document.querySelector('#room-title').textContent = life.finished ? '당신이 써 내려온 삶' : life.achieved ? '목표 뒤에도, 삶은 계속된다' : routeName(life.route);
  const latest = life.log.at(-1);
  document.querySelector('#room-description').textContent = latest ? latest.text : '작은 공책, 아직 모르는 사람들, 해보고 싶은 이야기. 오늘부터 어느 쪽으로 걸어갈지는 당신이 정합니다.';
  document.querySelector('#room-project').hidden = !life.keepsakes.title;
  document.querySelector('#room-project').textContent = `작업 노트 《${life.keepsakes.title}》`;
  for (const button of main.querySelectorAll('[data-clue]')) {
    const found = life.keepsakes.found.includes(button.dataset.clue);
    button.classList.toggle('found', found); button.disabled = life.finished;
    button.querySelector('.hotspot-dot').textContent = found ? '✓' : '+';
    button.setAttribute('aria-label', `${CLUES[button.dataset.clue].label} 살펴보기${found ? ' (발견함)' : ''}`);
  }
  document.querySelector('#room-fragments').textContent = `기억 조각 ${life.keepsakes.found.length}/3`;
  const pending = document.querySelector('#pending-callout');
  pending.hidden = !life.pending && !life.finished && !life.achieved;
  if (life.pending) pending.innerHTML = `<span>결정이 필요한 순간</span><strong>${esc(currentEvent(life).title)}</strong><button class="button primary wide" data-action="pending">기다리는 사건 열기 ↗</button>`;
  else if (life.finished) pending.innerHTML = `<span>이 삶을 기록했습니다</span><strong>${life.week}주 · 완성작 ${life.work.completed}편 · 국제 초청 ${life.work.invitations}회</strong><button class="button primary wide" data-action="records">나의 삶의 기록 보기 ↗</button>`;
  else if (life.achieved) pending.innerHTML = '<span>목표에 도달한 뒤의 삶</span><p>새로운 작업과 만남을 더 이어갈 수 있습니다.</p><button class="button secondary wide" data-action="record-now">여기까지의 삶 기록하기</button>';
  else pending.innerHTML = '';
  main.querySelectorAll('[data-activity]').forEach(button => {
    const action = ACTIONS[button.dataset.activity], reasons = requirements(life, action);
    button.disabled = !!life.pending || life.finished || reasons.length > 0;
    button.querySelector('.action-deltas').innerHTML = deltaMarkup(actualEffects(life, action.effects), true);
    button.querySelector('.action-reason').textContent = reasons.join(' · ');
  });
  document.querySelector('#goal-progress').innerHTML = [[life.work.completed, 3, '완성작', '편'], [life.work.invitations, 2, '국제 초청', '회'], [life.stats.craft, 65, '창작 경험', ''], [life.stats.bonds, 40, '관계', '']].map(([now, goal, label, unit]) => `<li class="${now >= goal ? 'reached' : ''}"><span>${now >= goal ? '✓' : '○'} ${label}</span><b>${now} / ${goal}${unit}</b></li>`).join('');
  appendHistory(document.querySelector('#life-history'), life.log);
  document.querySelector('#history-count').textContent = String(life.log.filter(item => item.type !== 'action').length);
  document.querySelector('#life-save-label').textContent = storageOK ? '행동·선택·공책은 이 브라우저에 자동 저장됩니다.' : '브라우저 저장소를 사용할 수 없어 현재 창에서만 진행 중입니다.';
  document.querySelector('#record-count').textContent = String(lives.length);
  if (openEvent && life.pending) showEvent();
}
function showEvent() {
  const event = life && currentEvent(life); if (!event) return;
  document.querySelector('#event-body').innerHTML = `<span class="eyebrow">${life.pending === 'milestone' ? 'A LIFE YOU HAVE ACHIEVED' : 'A MOMENT TO DECIDE'} · ${life.week}주째</span><h2 id="event-title">${esc(event.title)}</h2><p class="event-trigger">${esc(event.why)}</p><p class="event-prose">${esc(event.body)}</p><div class="event-options">${event.options.map((option, i) => { const reasons = requirements(life, option); return `<button data-event-choice="${i}" ${reasons.length ? 'disabled' : ''}><span class="choice-number" aria-hidden="true">${i + 1}</span><span><strong>${esc(option.title)}</strong><span class="event-effects">${deltaMarkup(actualEffects(life, option.effects))}</span>${reasons.length ? `<small class="event-requirement">${esc(reasons.join(' · '))}</small>` : ''}</span><span aria-hidden="true">↗</span></button>`; }).join('')}</div><p class="fine-print">이 사건과 수치 변화는 게임을 위해 각색한 가상의 경험입니다.</p>`;
  const dialog = document.querySelector('#event-dialog'); if (!dialog.open) dialog.showModal();
}
document.querySelector('#event-dialog').addEventListener('click', event => {
  const button = event.target.closest('[data-event-choice]'); if (!button || button.disabled) return;
  try {
    const previous = life; life = resolveEvent(life, Number(button.dataset.eventChoice));
    document.querySelector('#event-dialog').close(); archive(); persist(); refreshBoard(previous, !!life.pending);
    if (!life.pending) main.querySelector('[data-activity]:not(:disabled)')?.focus({ preventScroll: true });
  } catch (error) { notify(error.message); }
});

function homeMarkup() {
  return `<div class="fade-in"><section class="home-intro"><div><span class="eyebrow">A LIFE THAT RESPONDS TO YOU</span><h1>선택을 넘어, <em>한 사람의 삶으로.</em></h1></div><p>계획에 없는 사건도, 그다음의 결정도.<br>삶은 정해진 횟수로 끝나지 않습니다.</p></section><section class="cover life-cover"><div class="art-panel"><img src="./art.svg" alt="창가의 책상과 아직 비어 있는 공책" width="1000" height="1150"><div class="art-top"><span>LIFE, IF.</span><span class="edition">어느 창작자의 삶</span></div><div class="art-bottom"><small>정해지지 않은 다음 장면</small><p>한 주를 살아내면,<br>다른 이야기가 시작된다.</p></div></div><div class="cover-copy"><span class="episode-label">EPISODE 01 · 서도윤의 이야기</span><h2>비가 그치기를<br>기다리는 사람</h2><p class="description">일하고, 배우고, 만들고, 만납니다.<br>생활비와 활력, 경험과 관계가 변하고<br>당신의 일상 속에서 사건이 찾아옵니다.<br><br>나만의 작품이 세계에 닿는 날,<br>이 삶을 더 살아갈지 당신에게 묻습니다.</p><div class="meta-row"><span>변화하는 4가지 수치</span><span>계속 쌓이는 선택의 기록</span></div><button class="button primary wide" data-action="${life ? 'continue' : 'start'}">${life ? '내 삶으로 돌아가기' : '이 삶에 들어가기'} <span aria-hidden="true">↗</span></button><p class="fine-print">공개된 경험에서 영감을 얻은 가상의 이야기입니다.<br>인물·사건·수치·결과는 게임을 위해 창작했습니다.</p><span class="save-status">로그인 없이 · 이 브라우저에 자동 저장</span></div></section><section class="home-bottom"><div><span class="feature-symbol">⌁</span><div><h3>생활 공간은 그대로</h3><p>결정이 필요한 순간에 사건 창이 열립니다.</p></div></div><div><span class="feature-symbol">⑂</span><div><h3>행동이 기회를 만듭니다</h3><p>자원과 경험에 따라 다른 사건을 만납니다.</p></div></div><div><span class="feature-symbol">▤</span><div><h3>나의 선택은 지워지지 않습니다</h3><p>행동·결정·변화를 아래에서 돌아봅니다.</p></div></div></section></div>`;
}
function recordsMarkup() {
  if (viewedRecord !== null && lives[viewedRecord]) {
    const state = lives[viewedRecord].state;
    return `<section class="reading-page life-record"><button class="back-link" data-action="records">← 나의 기록으로</button><span class="eyebrow">A LIFE YOU HAVE ACHIEVED</span><h1>${routeName(state.route)}</h1><p>${state.week}주 동안 완성한 ${state.work.completed}편의 작업과 ${state.work.invitations}번의 국제 초청.</p>${state.keepsakes?.title ? `<h2>《${esc(state.keepsakes.title)}》</h2>` : ''}<div class="record-stat-line">${Object.entries(STAT_INFO).map(([key, info]) => `<span>${info.label} <b>${state.stats[key]}${info.unit === '만원' ? '만원' : ''}</b></span>`).join('')}</div><h2>지나온 선택과 발자취</h2><ol class="life-history" id="record-history"></ol><button class="button primary" data-action="copy-record">이 삶의 기록 복사하기</button></section>`;
  }
  return `<section class="reading-page"><span class="eyebrow">THE LIVES YOU HAVE LIVED</span><h1>당신이 남긴 삶</h1><p>목표에 도달한 뒤 기록하기로 한 삶을 보관합니다.<br>진행 중인 삶은 생활 공간에서 계속 이어갈 수 있어요.</p><div class="record-list">${lives.map((record, index) => `<article class="record-card"><div><span class="record-date">${esc(new Date(record.date).toLocaleDateString('ko-KR'))} · ${record.state.week}주</span><h2>${routeName(record.state.route)}</h2><p>완성작 ${record.state.work.completed}편 · 국제 초청 ${record.state.work.invitations}회</p></div><button class="button secondary" data-life-record="${index}">이 삶 돌아보기 ↗</button></article>`).reverse().join('') || '<div class="empty-state"><h2>아직 쓰고 있는 삶</h2><p>완성한 삶은 이곳에, 진행 중인 선택은 생활 공간 아래에 남습니다.</p><button class="button primary" data-action="continue">생활 공간으로 가기 ↗</button></div>'}</div><p class="fine-print">가장 최근에 기록한 삶 20개를 이 브라우저에 보관합니다.</p><h2>이전 방식으로 살아본 삶</h2><p>v0.1–0.2의 진행과 기록은 별도로 보존했습니다.</p><a class="button secondary" href="./legacy.html#records">이전 버전의 기록과 플레이 열기 ↗</a></section>`;
}
function aboutMarkup() {
  return `<section class="reading-page"><span class="eyebrow">THE RULES OF THIS FICTIONAL LIFE</span><h1>선택이 모여, 삶이 됩니다.</h1><div class="callout"><p>한 번의 행동은 한 주입니다. 수치와 작업 경험에 따라 사건이 생기며, 정해진 여섯 번의 선택으로 끝나지 않습니다.</p></div><h2>내가 바꿀 수 있는 것</h2><p>생활비는 작업과 배움을 위한 자원이고, 활력은 생활을 이어갈 힘입니다. 배우고 만들면 창작 경험이, 사람을 만나면 관계가 자랍니다. 비용과 변화는 행동·선택 전에 표시합니다. 부족한 자원이나 경험이 있으면 해당 선택이 잠깐 닫힙니다.</p><h2>사건은 언제 찾아오나요?</h2><p>처음 만든 작업, 모인 초고, 사람들과의 관계, 줄어든 생활비와 활력이 서로 다른 사건을 만듭니다. 일상의 사건은 저장된 난수 상태와 현재 조건으로 선정하고, 작업 완성·국제 초청·목표 달성은 화면에 표시된 조건으로 결정합니다. 초청은 실제 확률을 예측한 것이 아니라 이 게임의 성취 규칙입니다.</p><h2>목표에 도달하면</h2><p>완성작 3편, 국제 초청 2회, 창작 경험 65 이상, 관계 40 이상을 이루면 지금까지의 삶을 보여주고 계속 살지 한 번 묻습니다. 계속하기를 택해도 이후에 원하는 때 기록할 수 있습니다.</p><h2>사실과 창작</h2><p>서도윤은 가상의 인물입니다. 공개된 창작자의 경험에서 소재를 얻었지만, 인물의 대화·행동·사건·수치와 결과는 창작했습니다. 능력·재산·건강을 실존 인물의 실제 수치로 표시하지 않습니다.</p><details><summary>참고 자료 열기 · 원문에는 실명이 나옵니다</summary><ul><li><a href="https://www.bafta.org/media-centre/press-releases/screenwriters-lecture-series-2019-bong-joon-ho/" target="_blank" rel="noopener noreferrer">BAFTA · 창작자의 경험에 관한 강연</a></li><li><a href="https://www.filmlinc.org/daily/bong-joon-ho-on-family-and-class-in-parasite-collecting-films-and-memories-of-murder/" target="_blank" rel="noopener noreferrer">Film at Lincoln Center · 공개 대담</a></li><li><a href="https://www.festival-cannes.com/en/2011/interview-with-bong-joon-ho/" target="_blank" rel="noopener noreferrer">칸 영화제 · 비 내리던 촬영의 기억</a></li></ul></details><h2>라이선스와 저장</h2><p>코드는 MIT, 직접 만든 시나리오·일러스트·문구는 <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>입니다. 외부 인터뷰·사진·영상이나 실존 인물에 관한 권리를 포함하지 않습니다.</p><p>콘텐츠 표시: 「갈림」, jeiel85, https://github.com/jeiel85/l-if-e, CC BY 4.0. 수정 시 변경 사실을 밝혀 주세요.</p><p>행동·선택·수치·공책·기록은 현재 브라우저에 저장하며 기기 간 동기화하지 않습니다. 분석 SDK·서버 계정·외부 AI 호출은 없습니다. 브라우저 데이터를 지우면 기록도 삭제됩니다. 호스팅 서비스의 자체 접속 로그 정책은 별도로 적용됩니다.</p></section>`;
}
function render() {
  const page = location.hash || '#home';
  if (page === '#play') { if (!life) return start(); main.innerHTML = boardMarkup(); refreshBoard(); }
  else if (page === '#records') { main.innerHTML = recordsMarkup(); if (viewedRecord !== null && lives[viewedRecord]) appendHistory(document.querySelector('#record-history'), lives[viewedRecord].state.log, lives[viewedRecord].state); }
  else if (page === '#about' || page === '#credits') main.innerHTML = aboutMarkup();
  else main.innerHTML = homeMarkup();
  document.querySelector('#record-count').textContent = String(lives.length);
  document.querySelectorAll('[data-nav]').forEach(link => { const active = link.dataset.nav === (page === '#records' ? 'records' : ['#about', '#credits'].includes(page) ? 'about' : 'home'); if (active) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current'); });
  document.title = `${page === '#play' ? '지금 살아가는 삶' : page === '#records' ? '나의 삶의 기록' : '선택으로 다시 쓰는 삶'} · 갈림`;
}
function scrollTo(selector) { const node = main.querySelector(selector); if (!node) return; node.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' }); node.setAttribute('tabindex', '-1'); node.focus({ preventScroll: true }); }
main.addEventListener('click', event => {
  const button = event.target.closest('button'); if (!button || button.disabled) return;
  if (button.dataset.activity) {
    try { const previous = life; life = takeAction(life, button.dataset.activity); persist(); refreshBoard(previous, true); }
    catch (error) { notify(error.message); }
    return;
  }
  if (button.dataset.clue) return openClue(button.dataset.clue);
  if (button.dataset.filter) { historyFilter = button.dataset.filter; applyHistoryFilter(); return; }
  if (button.dataset.lifeRecord !== undefined) { viewedRecord = Number(button.dataset.lifeRecord); render(); window.scrollTo({ top: 0 }); return; }
  switch (button.dataset.action) {
    case 'start': start(); break;
    case 'new-life': requestStart(); break;
    case 'continue': if (!life) start(); else go('#play'); break;
    case 'pending': showEvent(); break;
    case 'history': scrollTo('#history-heading'); break;
    case 'back-to-life': scrollTo('#life-room'); break;
    case 'notebook': openNotebook(); break;
    case 'records': viewedRecord = null; go('#records'); break;
    case 'record-now':
      try { life = recordLife(life); archive(); persist(); refreshBoard(); } catch (error) { notify(error.message); } break;
    case 'copy-record': copyRecord(lives[viewedRecord]?.state); break;
  }
});
document.querySelector('[data-nav="records"]').addEventListener('click', () => { viewedRecord = null; if (location.hash === '#records') render(); });
document.addEventListener('keydown', event => {
  if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || document.querySelector('dialog[open]') || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
  if (/^[1-5]$/.test(event.key) && location.hash === '#play') { const button = main.querySelectorAll('[data-activity]')[Number(event.key) - 1]; if (button && !button.disabled) { event.preventDefault(); button.click(); } }
});
function sketch(id) { return `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${CUTS[id].path}</svg>`; }
function openClue(id) {
  if (!life || life.finished || !Object.hasOwn(CLUES, id)) return;
  if (!life.keepsakes.found.includes(id)) { life.keepsakes.found.push(id); persist(); refreshBoard(); }
  const clue = CLUES[id];
  document.querySelector('#explore-body').innerHTML = `<span class="eyebrow">A FRAGMENT OF THIS LIFE</span><h2 id="explore-title">${clue.title}</h2><p class="clue-prose">${clue.text}</p><p class="clue-saved">✓ 공책에 남긴 기억 조각 · ${life.keepsakes.found.length}/3</p><button class="button primary" data-book="open">공책 펼쳐보기 ↗</button><p class="fine-print">이 물건과 설명은 게임을 위해 창작했습니다.</p>`;
  document.querySelector('#explore-dialog').showModal();
}
function cutMarkup() {
  return life.keepsakes.cuts.map((id, i) => `<li class="cut-card" tabindex="-1" data-cut="${id}"><span class="cut-number">0${i + 1}</span>${sketch(id)}<strong>${CUTS[id].title}</strong><div class="cut-controls"><button data-cut-move="${i}" data-dir="-1" aria-label="${CUTS[id].title}, 앞으로 옮기기" ${i === 0 || life.finished ? 'disabled' : ''}>←</button><button data-cut-move="${i}" data-dir="1" aria-label="${CUTS[id].title}, 뒤로 옮기기" ${i === 2 || life.finished ? 'disabled' : ''}>→</button></div></li>`).join('');
}
function openNotebook() {
  if (!life) return; clearTimeout(previewTimer);
  document.querySelector('#explore-body').innerHTML = `<span class="eyebrow">YOUR OWN STORY</span><h2 id="explore-title">내 공책의 첫 이야기</h2><p class="notebook-intro">세 장면의 순서를 바꾸고, 당신만의 제목을 붙여보세요.</p><label class="notebook-label" for="book-title">작품 제목 <small>40자까지 · 자동 저장</small></label><input id="book-title" class="book-title-input" maxlength="40" value="${esc(life.keepsakes.title)}" placeholder="어떤 제목을 붙여볼까요?" ${life.finished ? 'readonly' : ''}><ol class="cut-list">${cutMarkup()}</ol><div class="cut-preview"><div class="preview-screen" aria-live="polite"><span class="preview-hint">당신의 순서로 이야기를 상영해 보세요.</span></div><div class="preview-footer"><span class="preview-project">${esc(life.keepsakes.title || '이름 없는 이야기')}</span><button data-book="preview">이야기 재생 ▷</button></div></div><section class="notebook-fragments"><h3>기억 조각 ${life.keepsakes.found.length}/3</h3>${life.keepsakes.found.map(id => `<blockquote><p>${CLUES[id].note}</p></blockquote>`).join('') || '<p>생활 공간의 물건을 살펴보면 기억 조각이 모입니다.</p>'}</section>`;
  const dialog = document.querySelector('#explore-dialog'); if (!dialog.open) dialog.showModal();
}
document.querySelector('#explore-dialog').addEventListener('input', event => { if (event.target.id === 'book-title' && life && !life.finished) { life.keepsakes.title = keepsakesOf({ title: event.target.value }).title; document.querySelector('.preview-project').textContent = life.keepsakes.title || '이름 없는 이야기'; persist(); } });
function stopPreview() { clearTimeout(previewTimer); const button = document.querySelector('[data-book="preview"]'); if (button) { button.disabled = false; button.textContent = '이야기 재생 ▷'; } }
document.querySelector('#explore-dialog').addEventListener('close', () => { stopPreview(); refreshBoard(); });
document.querySelector('#explore-dialog').addEventListener('click', event => {
  const button = event.target.closest('button'); if (!button || button.disabled || !life) return;
  if (button.dataset.book === 'open') return openNotebook();
  if (button.dataset.cutMove !== undefined && !life.finished) { stopPreview(); const index = Number(button.dataset.cutMove), id = life.keepsakes.cuts[index]; life.keepsakes.cuts = moveCut(life.keepsakes.cuts, index, Number(button.dataset.dir)); persist(); document.querySelector('.cut-list').innerHTML = cutMarkup(); document.querySelector(`[data-cut="${id}"]`).focus(); }
  if (button.dataset.book === 'preview') {
    stopPreview(); button.disabled = true; button.textContent = '상영 중…'; const cuts = [...life.keepsakes.cuts];
    const frame = i => { if (!document.querySelector('#explore-dialog').open) return; const id = cuts[i]; document.querySelector('.preview-screen').innerHTML = `<div class="preview-frame">${sketch(id)}<small>${i + 1}/3</small><strong>${CUTS[id].title}</strong><p>${CUTS[id].caption}</p></div>`; previewTimer = setTimeout(() => i < 2 ? frame(i + 1) : stopPreview(), 1200); }; frame(0);
  }
});
async function copyRecord(state) {
  if (!state) return;
  const text = `갈림 · ${routeName(state.route)}\n살아온 ${state.week}주 · 완성작 ${state.work.completed}편 · 국제 초청 ${state.work.invitations}회\n공책: ${state.keepsakes?.title || '이름 없는 이야기'}\n\n${state.log.map(item => `${item.week}주 · ${item.title}\n${item.text}\n${Object.entries(item.effects).map(([key, n]) => `${STAT_INFO[key]?.label || workLabel(key)} ${n > 0 ? '+' : ''}${n}`).join(' · ')}`).join('\n\n')}\n\n가상의 인물과 수치로 각색한 이야기입니다.\n「갈림」 © 2026 jeiel85 · CC BY 4.0\nhttps://github.com/jeiel85/l-if-e\nhttps://creativecommons.org/licenses/by/4.0/`;
  try { await navigator.clipboard.writeText(text); notify('삶의 기록을 복사했어요.'); }
  catch { document.querySelector('#record-text').value = text; document.querySelector('#record-dialog').showModal(); document.querySelector('#record-text').select(); }
}
let audio;
document.querySelector('#sound-button').addEventListener('click', async () => {
  const button = document.querySelector('#sound-button');
  try {
    if (!audio) { audio = new AudioContext(); const buffer = audio.createBuffer(1, audio.sampleRate * 4, audio.sampleRate); const data = buffer.getChannelData(0); for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * .05; const source = audio.createBufferSource(); source.buffer = buffer; source.loop = true; const filter = audio.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 2400; source.connect(filter); filter.connect(audio.destination); source.start(); await audio.resume(); }
    else if (audio.state === 'running') await audio.suspend(); else await audio.resume();
    const on = audio.state === 'running'; button.setAttribute('aria-pressed', String(on)); button.setAttribute('aria-label', on ? '빗소리 끄기' : '빗소리 켜기'); button.querySelector('.sound-label').textContent = on ? '빗소리 켜짐' : '빗소리 꺼짐';
  } catch (error) { console.warn('Ambient audio unavailable:', error.name); notify('소리를 재생할 수 없어요. 소리 없이도 플레이할 수 있습니다.'); }
});
window.addEventListener('hashchange', () => { for (const dialog of document.querySelectorAll('dialog[open]')) dialog.close(); render(); });
load(); if (life?.finished) { archive(); persist(); } render();
