// SPDX-License-Identifier: MIT
import { SAVE_KEY, RECORDS_KEY, LABELS, sceneFor, journey, endingFor, validSave, validateChoices } from './story.js';

const main = document.querySelector('#main');
let save = null;
let records = [];
let storageAvailable = true;
let recordView = null;
let guessed = null;
let noticeTimer;
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function notify(message) {
  const node = document.querySelector('#notice');
  node.textContent = message; node.classList.add('visible');
  clearTimeout(noticeTimer); noticeTimer = setTimeout(() => node.classList.remove('visible'), 5500);
}
function loadStorage() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      try { const parsed = JSON.parse(raw); if (!validSave(parsed)) throw new Error('Invalid save'); save = parsed; }
      catch { notify('진행 기록을 읽지 못했어요. 새 이야기를 시작할 수 있습니다.'); }
    }
    const rawRecords = localStorage.getItem(RECORDS_KEY);
    if (rawRecords) {
      try {
        const parsed = JSON.parse(rawRecords);
        if (!Array.isArray(parsed)) throw new Error('Invalid records');
        records = parsed.filter(r => r && validateChoices(r.choices) && r.choices.length === 6 && typeof r.date === 'string' && Number.isFinite(Date.parse(r.date))).slice(-100);
        if (records.length !== parsed.length) notify('일부 기록을 읽지 못했어요. 확인 가능한 삶만 불러왔습니다.');
      } catch { notify('완성한 삶의 기록을 읽지 못했어요. 새 기록은 이 창에서 확인할 수 있습니다.'); }
    }
  } catch { storageAvailable = false; notify('브라우저 저장소를 사용할 수 없어, 이 창을 닫으면 진행 기록이 사라집니다.'); }
}
function persist() {
  try {
    if (save) localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    else localStorage.removeItem(SAVE_KEY);
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  } catch { storageAvailable = false; notify('저장 공간을 사용할 수 없어요. 이 창에서는 계속 플레이할 수 있습니다. 창을 닫으면 기록이 사라질 수 있어요.'); }
}
function archive() {
  if (!save || save.choices.length !== 6) return;
  const id = save.choices.join('');
  if (!records.some(r => r.choices.join('') === id)) {
    records.push({ choices: [...save.choices], date: new Date().toISOString() });
    records = records.slice(-100);
  }
}
function navigate(hash) { if (location.hash === hash) render(); else location.hash = hash; }
function start() {
  save = { version: 1, choices: [], phase: 'scene' }; recordView = null; guessed = null;
  persist(); navigate('#play');
}
function requestRestart() {
  if (!save || save.phase === 'ending') return start();
  document.querySelector('#restart-dialog').showModal();
}
document.querySelector('#restart-dialog').addEventListener('close', event => {
  if (event.target.returnValue === 'restart') start();
});
function art(kind = 'notebook', chapter = false) {
  const lines = {
    notebook: ['공책 한 권에서 시작된', '아직 이름 없는 이야기.'],
    screen: ['불이 켜진 다음에도,', '이야기는 끝나지 않았다.'],
    rain: ['계획에 없던 비가', '내리기 시작했다.'],
    city: ['생활과 꿈 사이에도', '당신의 자리는 있다.'],
    library: ['모르는 것이 있다는 건,', '다음 장면이 있다는 것.'],
    desk: ['누군가의 기대와', '나의 이야기가 만나는 곳.'],
    dawn: ['아직 쓰지 않은 날들이', '당신을 기다린다.']
  };
  const text = lines[kind] || lines.notebook;
  return `<div class="art-panel art-${escape(kind)}"><img src="./art.svg" alt="비 오는 창가, 펼쳐진 공책과 연필이 놓인 작은 책상" width="1000" height="1150"><div class="rain-lines" aria-hidden="true"></div><div class="frame-corners" aria-hidden="true"></div><div class="art-top"><span>${chapter ? 'THE UNWRITTEN SCENES' : 'LIFE, IF.'}</span><span class="edition">${chapter ? '당신의 장면' : '첫 번째 삶'}</span></div><div class="art-bottom"><small>어느 창작자의 이야기</small><p>${text[0]}<br>${text[1]}</p><span class="art-location">비가 그치기를 기다리는 사람</span></div></div>`;
}
function home() {
  const progress = save && save.phase !== 'ending';
  return `<div class="fade-in"><section class="home-intro"><div><span class="eyebrow">AN INTERACTIVE LIFE STORY</span><h1>나였다면, <em>어떤 삶을 살았을까.</em></h1></div><p>아직 이름을 알 수 없는 한 사람의 삶.<br>그다음 장면은, 당신이 선택합니다.</p></section>
  <section class="cover" aria-label="첫 번째 삶"><div>${art()}</div><div class="cover-copy"><div class="episode-label"><i></i> EPISODE 01 <span>·</span> 어느 창작자의 이야기</div><h2>비가 그치기를<br>기다리는 사람</h2><p class="description">그림 그리기를 좋아하던 아이.<br>함께 영화를 보던 작은 방.<br>그리고, 계획에 없던 비가 내리던 날.<br><br>이 사람은 누구였을까요?<br>당신이라면, 어떤 선택을 했을까요?</p><div class="meta-row"><span><span class="tiny-icon" aria-hidden="true">◷</span> 약 <b>5–10분</b></span><span><span class="tiny-icon" aria-hidden="true">⑂</span> <b>6번</b>의 선택</span><span><span class="tiny-icon" aria-hidden="true">▤</span> <b>4가지</b> 결말</span></div><button class="button primary wide" data-action="${progress ? 'continue' : 'start'}"><span>${progress ? '이어서 살아보기' : '이 삶에 들어가기'}</span><span class="arrow" aria-hidden="true">↗</span></button>${progress ? `<button class="text-button" data-action="restart">처음부터 다른 선택 해보기</button>` : ''}<p class="fine-print">공개된 경험에서 영감을 얻은 가상의 이야기입니다.<br>인물·대화·선택지와 그 결과에는 창작이 포함되어 있습니다.</p><span class="save-status">${storageAvailable ? '로그인 없이 시작 · 이 브라우저에 자동 저장' : '이 창에서 플레이 가능 · 브라우저 저장 불가'}</span></div></section>
  <section class="home-bottom" aria-label="플레이 안내"><div><span class="feature-symbol" aria-hidden="true">⌁</span><div><h3>선택은 다음 장면이 됩니다</h3><p>지나온 선택이 이후의 경험에 남습니다.</p></div></div><div><span class="feature-symbol" aria-hidden="true">◌</span><div><h3>누군가 떠오를지도 몰라요</h3><p>작은 단서를 따라, 한 사람의 삶을 상상해 보세요.</p></div></div><div><span class="feature-symbol" aria-hidden="true">↗</span><div><h3>다른 삶도 틀린 삶은 아닙니다</h3><p>유명해지는 것만이 이야기의 끝은 아니니까요.</p></div></div></section></div>`;
}
function progressMarkup(index) {
  return `<div class="progress" aria-label="총 6장 중 ${Math.min(index + 1, 6)}장">${LABELS.map((label, i) => `<div class="${i < index ? 'done' : i === index ? 'current' : ''}"><span></span><small>${String(i + 1).padStart(2, '0')} ${label}</small></div>`).join('')}</div>`;
}
function play() {
  if (!save) { save = { version: 1, choices: [], phase: 'scene' }; persist(); }
  if (save.phase === 'ending') return ending(save.choices, false);
  const echo = save.phase === 'echo';
  const index = save.choices.length - (echo ? 1 : 0);
  const scene = sceneFor(save.choices.slice(0, index));
  return `<div class="fade-in"><div class="play-heading"><button class="back-link" data-action="home">← 이야기 표지로</button><span class="chapter-count"><b>${String(index + 1).padStart(2, '0')}</b> / 06</span></div>${progressMarkup(index)}<div class="play-layout">${art(scene.art, true)}<section class="story-panel ${echo ? 'echo-panel' : ''}" aria-label="${echo ? '선택의 결과' : '이야기와 선택'}">${echo ? echoMarkup(scene, index) : sceneMarkup(scene, index)}</section></div></div>`;
}
function sceneMarkup(scene, index) {
  return `<span class="eyebrow">SCENE ${String(index + 1).padStart(2, '0')} <span aria-hidden="true">/</span> ${scene.period}</span><h1>${scene.title}</h1>${scene.memory ? `<aside class="memory"><span aria-hidden="true">↳ </span>${scene.memory}</aside>` : ''}<div class="story-paragraphs">${scene.paragraphs.map(p => `<p>${p}</p>`).join('')}</div><h2 class="question">${scene.question}</h2><div class="choices">${scene.options.map((o, i) => `<button class="choice" data-choice="${i}"><span class="choice-number" aria-hidden="true">${i + 1}</span><span><strong>${o.title}</strong><small>${o.hint}</small></span><span class="choice-arrow" aria-hidden="true">↗</span></button>`).join('')}</div><div class="keyboard-help">숫자 키 1 · 2 · 3으로도 선택할 수 있어요</div><div class="play-foot"><span>${scene.place}</span><span>${storageAvailable ? '이 브라우저에 자동 저장' : '이 창에서만 진행 중'}</span></div>`;
}
function echoMarkup(scene, index) {
  const selected = scene.options[save.choices[index]];
  return `<span class="eyebrow">A CHOICE BECOMES A SCENE</span><div class="echo-symbol" aria-hidden="true">⌁</div><h1>선택이 남긴 것</h1><p class="chosen">${selected.title}</p><p class="echo-text">${selected.echo}</p><button class="button primary wide" data-action="next"><span>${index === 5 ? '내가 살아온 삶 돌아보기' : '다음 장면으로'}</span><span class="arrow" aria-hidden="true">→</span></button><p class="fine-print">당신이 선택한 가상의 경로입니다.</p>`;
}
function timeline(choices) {
  return `<ol class="timeline">${journey(choices).map(item => `<li><span class="timeline-number">${String(item.chapter).padStart(2, '0')}</span><div><h3>${item.title}</h3><p class="timeline-choice">${item.choice}</p><p>${item.result}</p></div></li>`).join('')}</ol>`;
}
function ending(choices, archived) {
  const result = endingFor(choices);
  return `<section class="ending-shell fade-in"><button class="back-link" data-action="${archived ? 'records' : 'home'}">← ${archived ? '나의 기록으로' : '이야기 표지로'}</button><div class="ending-top"><span class="eyebrow">THE LIFE YOU HAVE WRITTEN</span><div class="ending-icon" aria-hidden="true">⑂</div><p class="episode-label" style="justify-content:center">서도윤으로 살아본 첫 번째 삶</p><h1>${result.title}</h1><p class="subtitle">${result.subtitle}</p><p class="ending-text">${result.text}</p><div class="ending-tags"><span class="tag">${result.word}</span><span class="tag">6개의 선택이 남긴 삶</span><span class="tag">${storageAvailable ? '이 브라우저에 기록됨' : '이 창에 기록됨'}</span></div></div><div class="ending-details"><div><small>당신이 완성한 것</small><p>${result.work}</p></div><div><small>당신에게 남은 배움</small><p>${result.learning}</p></div><div><small>그 과정에서 감수한 것</small><p>${result.tradeoff}</p></div><div><small>다른 길이 열린 순간</small><p>${journey(choices)[1].choice}</p></div></div><h2 class="section-title">당신의 선택이 만든 여섯 장면</h2>${timeline(choices)}<section class="guess-box" aria-labelledby="guess-title"><h2 id="guess-title">이 삶에서 누군가가 떠올랐나요?</h2><p id="guess-message">맞혀야 할 정답은 없어요. 떠오른 사람과 당신의 삶이 어떻게 달랐는지 생각해 보세요.</p><div class="guess-actions"><button data-guess="yes" aria-pressed="${guessed === 'yes'}">누군가 떠올랐어요</button><button data-guess="no" aria-pressed="${guessed === 'no'}">아직 모르겠어요</button></div></section><div class="ending-actions"><button class="button primary" data-action="restart">다른 선택으로 다시 살아보기 <span aria-hidden="true">↗</span></button><button class="button secondary" data-action="copy">이 삶의 기록 복사하기 ⧉</button><button class="button secondary" data-action="records">나의 기록 보기</button></div><p class="fine-print">이 결말은 창작입니다. 실존 인물의 미래를 예측하거나 실제 삶을 평가하지 않습니다.</p></section>`;
}
function recordPage() {
  if (recordView !== null && records[recordView]) return ending(records[recordView].choices, true);
  return `<section class="reading-page fade-in"><span class="eyebrow">YOUR UNWRITTEN LIVES</span><h1>당신이 살아본 삶</h1><p>같은 시작에서도, 다른 삶이 남습니다.<br>완성한 경로가 이 브라우저에 모여 있어요.</p>${records.length ? `<div class="record-list">${records.map((record, index) => ({ record, index })).reverse().map(({ record, index }) => { const result = endingFor(record.choices); return `<article class="record-card"><div><span class="record-date">${escape(new Date(record.date).toLocaleDateString('ko-KR'))} · EPISODE 01</span><h2>${result.title}</h2><p>${result.subtitle}</p></div><button class="button secondary" data-record="${index}">이 삶 돌아보기 ↗</button></article>`; }).join('')}</div><p class="fine-print">같은 선택으로 완성한 삶은 한 번만 기록됩니다. 최대 100개 경로를 보관합니다.</p>` : `<div class="empty-state"><span class="empty-icon" aria-hidden="true">◌</span><h2>아직 쓰이지 않은 이야기</h2><p>여섯 번의 선택을 마치면,<br>당신이 살아본 첫 번째 삶이 이곳에 남습니다.</p><button class="button primary" data-action="${save ? 'continue' : 'start'}">${save ? '이어서 살아보기' : '첫 번째 삶 시작하기'} ↗</button></div>`}<p class="fine-print">${storageAvailable ? '기록은 기기 간에 동기화되지 않습니다. 브라우저 데이터를 지우면 함께 삭제됩니다.' : '브라우저 저장소를 사용할 수 없습니다. 창을 닫기 전에 삶의 기록을 복사해 보관해 주세요.'}</p></section>`;
}
function about(credits = false) {
  if (credits) return `<section class="reading-page fade-in"><span class="eyebrow">CREDITS & LICENSES</span><h1>함께 쓰는 이야기</h1><div class="callout"><p>코드는 자유롭게 고치고, 이야기는 출처를 남겨 나눌 수 있습니다.</p></div><h2>소스 코드 · MIT</h2><p>게임 엔진, 화면 구성 코드, 스타일, 테스트 및 실행 도구는 MIT 라이선스입니다. 저작권 고지와 라이선스 전문을 유지해 주세요.</p><h2>오리지널 콘텐츠 · CC BY 4.0</h2><p>직접 쓴 가상 시나리오, 선택지, 결말, 직접 제작한 창가 일러스트와 아이콘은 <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">크리에이티브 커먼즈 저작자표시 4.0 국제</a>로 제공합니다. 저작자와 원본 링크, 라이선스를 표시하고 변경 여부를 밝혀 주세요.</p><p>표시 예: 「갈림」, jeiel85, https://github.com/jeiel85/l-if-e, CC BY 4.0. 수정한 경우 수정 사실을 덧붙여 주세요.</p><h2>참고 자료와 실존 인물</h2><p>인터뷰 원문·사진·영상 등 외부 자료는 이 프로젝트의 라이선스에 포함되지 않습니다. 실제 인물의 이름·초상·인격에 관한 권리를 허락한다는 뜻도 아닙니다. 게임의 이미지와 소리는 직접 제작했으며 외부 사진·음원·웹 폰트를 사용하지 않습니다.</p><p>기획과 구현: jeiel85 · 제작 보조: OpenAI Codex<br>라이선스 전문과 파일별 적용 범위: <a href="https://github.com/jeiel85/l-if-e" target="_blank" rel="noopener noreferrer">GitHub 저장소 ↗</a></p><p><a href="#about">이야기의 재료와 출처 보기 →</a></p></section>`;
  return `<section class="reading-page fade-in"><span class="eyebrow">BEHIND THE STORY</span><h1>사실의 조각에서,<br>다른 삶의 가능성으로.</h1><div class="callout"><p>서도윤은 가상의 인물입니다. 공개된 창작자의 경험을 소재로 삼았지만, 이 게임은 실제 전기나 실제 선택을 맞히는 퀴즈가 아닙니다.</p></div><h2>무엇을 참고했나요?</h2><p>어린 시절 그림으로 이야기를 만들었던 기억, 함께 영화를 보던 모임, 비가 내리던 작은 촬영 현장. 공개 인터뷰에서 확인한 경험을 이야기의 출발점으로 사용했습니다.</p><h2>무엇을 창작했나요?</h2><p>주인공의 가명, 주변 사람, 대화, 시간표, 제안, 갈등과 모든 선택지·결과를 새로 썼습니다. 서로 다른 선택이 어떤 경험으로 이어질지는 게임 안에서 설계한 것이며, 실존 인물이 실제로 마주했던 대안이나 일어났을 미래를 뜻하지 않습니다.</p><h2>왜 정답을 알려주지 않나요?</h2><p>누군가가 떠올라도, 그렇지 않아도 이야기는 완성됩니다. 누가 더 유명해졌는지보다 내가 무엇을 택했고 무엇을 감수했는지 돌아보는 경험을 만들고 싶었습니다.</p><details><summary>참고한 공개 자료 열기</summary><p>아래 원문에는 실명이 나옵니다. 누구인지 먼저 추측해 보고 싶다면 플레이를 마친 뒤 열어보세요.</p><ul><li><a href="https://www.bafta.org/media-centre/press-releases/screenwriters-lecture-series-2019-bong-joon-ho/" target="_blank" rel="noopener noreferrer">BAFTA · 2019 각본가 강연</a> — 어린 시절 그림과 이야기 만들기.</li><li><a href="https://www.filmlinc.org/daily/bong-joon-ho-on-family-and-class-in-parasite-collecting-films-and-memories-of-murder/" target="_blank" rel="noopener noreferrer">Film at Lincoln Center · 2019 대담</a> — 영화 모임과 배움의 경험.</li><li><a href="https://www.festival-cannes.com/en/2011/interview-with-bong-joon-ho/" target="_blank" rel="noopener noreferrer">칸 영화제 · 2011 인터뷰</a> — 비 내리던 단편 촬영의 기억.</li></ul><p>원문은 해당 저작권자의 자료입니다. 문장·사진·영상을 게임에 복제하지 않았습니다.</p></details><details><summary>진행 기록과 개인정보</summary><p>로그인이나 서버 저장 기능이 없습니다. 선택 기록은 이 브라우저의 로컬 저장소에 저장합니다. 이름 추측은 저장하거나 전송하지 않습니다. 외부 분석 도구를 넣지 않았습니다. 사이트 호스팅 제공자는 자체 운영 정책에 따라 접속 정보를 처리할 수 있습니다.</p></details><p><a href="#credits">저작자 표시와 라이선스 보기 →</a></p></section>`;
}
function render({ focus = false } = {}) {
  const page = location.hash || '#home';
  let markup;
  if (page === '#play') markup = play();
  else if (page === '#records') markup = recordPage();
  else if (page === '#about' || page === '#credits') markup = about(page === '#credits');
  else markup = home();
  main.innerHTML = markup;
  document.querySelectorAll('[data-nav]').forEach(link => {
    const current = link.dataset.nav === (page === '#records' ? 'records' : ['#about', '#credits'].includes(page) ? 'about' : 'home');
    if (current) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
  });
  document.querySelector('#record-count').textContent = String(records.length);
  const heading = main.querySelector('h1');
  document.title = `${heading ? heading.textContent : '선택으로 다시 쓰는 삶'} · 갈림`;
  if (focus) {
    window.scrollTo({ top: 0, behavior: 'instant' });
    main.focus({ preventScroll: true });
  }
}
function choose(index) {
  if (location.hash !== '#play' || !save || save.phase !== 'scene' || !Number.isInteger(index) || index < 0 || index > 2) return;
  save.choices.push(index); save.phase = 'echo'; persist(); render({ focus: true });
}
async function copyRecord() {
  const choices = location.hash === '#records' && recordView !== null ? records[recordView]?.choices : save?.choices;
  if (!choices || choices.length !== 6) return;
  const result = endingFor(choices);
  const text = `갈림 · ${result.title}\n${result.subtitle}\n\n${result.text}\n\n${journey(choices).map(j => `${j.chapter}. ${j.title}\n선택: ${j.choice}\n${j.result}`).join('\n\n')}\n\n이 경로는 가상의 이야기입니다.\n「갈림」 © 2026 jeiel85 · CC BY 4.0\nhttps://github.com/jeiel85/l-if-e\nhttps://creativecommons.org/licenses/by/4.0/\n`;
  try {
    await navigator.clipboard.writeText(text);
    notify('여섯 장면의 기록을 복사했어요. 원하는 곳에 붙여넣어 보관하세요.');
  } catch {
    const textarea = document.querySelector('#record-text');
    textarea.value = text;
    document.querySelector('#record-dialog').showModal();
    textarea.focus(); textarea.select();
  }
}
main.addEventListener('click', event => {
  const button = event.target.closest('button'); if (!button) return;
  if (button.hasAttribute('data-choice')) return choose(Number(button.dataset.choice));
  if (button.hasAttribute('data-record')) { recordView = Number(button.dataset.record); guessed = null; return render({ focus: true }); }
  if (button.hasAttribute('data-guess')) {
    guessed = button.dataset.guess;
    main.querySelectorAll('[data-guess]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.guess === guessed)));
    main.querySelector('#guess-message').textContent = guessed === 'yes' ? '떠오른 사람에게도 쓰이지 않은 장면이 있었겠죠. 이번에 당신이 살아본 길은 어땠나요?' : '이름을 몰라도 괜찮아요. 지금까지의 선택은 당신만의 이야기로 남았습니다.';
    return;
  }
  switch (button.dataset.action) {
    case 'start': start(); break;
    case 'continue': recordView = null; guessed = null; navigate('#play'); break;
    case 'restart': requestRestart(); break;
    case 'home': navigate('#home'); break;
    case 'records': recordView = null; guessed = null; navigate('#records'); break;
    case 'next':
      if (!save || save.phase !== 'echo') return;
      save.phase = save.choices.length === 6 ? 'ending' : 'scene';
      if (save.phase === 'ending') archive();
      persist(); render({ focus: true }); break;
    case 'copy': copyRecord(); break;
  }
});
document.querySelector('[data-nav="records"]').addEventListener('click', () => { recordView = null; guessed = null; if (location.hash === '#records') render(); });
document.addEventListener('keydown', event => {
  if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || document.querySelector('dialog[open]') || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
  if (/^[123]$/.test(event.key) && location.hash === '#play' && save?.phase === 'scene') { event.preventDefault(); choose(Number(event.key) - 1); }
});
let audioContext, audioNode, audioGain;
async function toggleSound() {
  const button = document.querySelector('#sound-button');
  if (audioContext?.state === 'running') { await audioContext.suspend(); button.setAttribute('aria-pressed', 'false'); button.setAttribute('aria-label', '빗소리 켜기'); button.querySelector('.sound-label').textContent = '빗소리 꺼짐'; return; }
  try {
    if (!audioContext) {
      audioContext = new AudioContext();
      const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 4, audioContext.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * .16;
      audioNode = audioContext.createBufferSource(); audioNode.buffer = buffer; audioNode.loop = true;
      const filter = audioContext.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 2400;
      audioGain = audioContext.createGain(); audioGain.gain.value = .35;
      audioNode.connect(filter); filter.connect(audioGain); audioGain.connect(audioContext.destination); audioNode.start();
    }
    await audioContext.resume();
    button.setAttribute('aria-pressed', 'true'); button.setAttribute('aria-label', '빗소리 끄기'); button.querySelector('.sound-label').textContent = '빗소리 켜짐';
  } catch (error) { console.warn('Ambient audio unavailable:', error.name); notify('이 브라우저에서는 빗소리를 재생할 수 없어요. 소리 없이도 플레이할 수 있습니다.'); }
}
document.querySelector('#sound-button').addEventListener('click', () => toggleSound().catch(error => { console.warn('Audio toggle failed:', error.name); notify('소리를 전환하지 못했어요. 다시 눌러 주세요.'); }));
window.addEventListener('hashchange', () => render({ focus: true }));
loadStorage();
if (save?.phase === 'ending') { archive(); persist(); }
render();
