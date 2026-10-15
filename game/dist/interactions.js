// Engine utilities: MIT. Original clue and storyboard text: CC BY 4.0.
import { validateChoices, journey } from './story.js';

export const CLUES = {
  notebook: { label: '펼쳐진 공책', symbol: '▱', title: '마지막 칸은 비어 있다', text: '공책에는 같은 사람이 여러 번 그려져 있다. 걷다가, 멈췄다가, 다시 돌아본다. 잘 그리는 것보다 다음 칸이 궁금해서 그렸던 것 같다.', note: '다음 칸이 궁금해서, 이야기를 그렸다.' },
  window: { label: '비 오는 창문', symbol: '⋮', title: '익숙한 풍경도 장면이 된다', text: '유리창에 맺힌 빗방울 너머로 사람들이 지나간다. 같은 길인데도 누가 바라보느냐에 따라 다른 이야기가 된다. 조금 더 오래 바라본다.', note: '같은 풍경에도 서로 다른 이야기가 있다.' },
  cup: { label: '식어가는 찻잔', symbol: '⌑', title: '혼자가 아니었던 시간', text: '마시다 만 차가 식어 있다. 누군가와 이야기를 나누다 시간을 잊었던 걸까. 책상 한쪽에는 다른 사람의 글씨로 남긴 작은 메모가 있다.', note: '혼자 떠올린 이야기가, 만남 속에서 자란다.' }
};
export const CUTS = {
  leave: { title: '길을 나선다', caption: '익숙한 문 밖으로 한 걸음.', word: '시작', path: '<path d="M26 76V24h43v52M57 76V37h12m-5 18h1M18 77h64m-4-29 9 7-9 7m-9-7h18"/>' },
  pause: { title: '잠시 멈춘다', caption: '계획에 없던 비를 만난다.', word: '우연', path: '<path d="M21 53c0-26 58-26 58 0H21Zm29 0v24c0 10 14 10 14 0M28 21l-3 8m25-14-2 8m26-1-3 8M19 66l-3 8m65-8-3 8"/>' },
  return: { title: '다시 문을 연다', caption: '같은 곳을 새로운 눈으로.', word: '발견', path: '<path d="M25 78V25h48v53M25 25l33 9v54L25 78Zm22 33h1M64 48l21-13m-14 0h14v14"/>' }
};
export function keepsakesOf(value) {
  const v = value && typeof value === 'object' ? value : {};
  const ids = Object.keys(CUTS);
  return {
    title: typeof v.title === 'string' ? v.title.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 40) : '',
    cuts: Array.isArray(v.cuts) && v.cuts.length === 3 && new Set(v.cuts).size === 3 && v.cuts.every(id => typeof id === 'string' && Object.hasOwn(CUTS, id)) ? [...v.cuts] : ids,
    found: Array.isArray(v.found) ? [...new Set(v.found.filter(id => typeof id === 'string' && Object.hasOwn(CLUES, id)))].slice(0, 3) : []
  };
}
export function moveCut(cuts, index, delta) {
  if (![0, 1, 2].includes(index) || ![-1, 1].includes(delta)) throw new Error('Invalid cut move');
  const next = keepsakesOf({ cuts }).cuts;
  const to = index + delta;
  if (to >= 0 && to < 3) [next[index], next[to]] = [next[to], next[index]];
  return next;
}
export function forkLife(choices, chapter, keepsakes) {
  if (!validateChoices(choices) || choices.length !== 6 || !Number.isInteger(chapter) || chapter < 0 || chapter > 5) throw new Error('Invalid branch point');
  return { version: 1, phase: 'scene', choices: choices.slice(0, chapter), fromChoices: [...choices], keepsakes: keepsakesOf(keepsakes) };
}
export function differences(before, after) {
  if (!validateChoices(before) || before.length !== 6 || !validateChoices(after) || after.length !== 6) return [];
  const oldJourney = journey(before);
  return journey(after).flatMap((item, i) => item.choice !== oldJourney[i].choice || item.result !== oldJourney[i].result ? [{ chapter: i + 1, before: oldJourney[i], after: item }] : []);
}
