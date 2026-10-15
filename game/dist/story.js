// Original fictional narrative: CC BY 4.0. Engine functions: MIT.
export const SAVE_KEY = 'galim.save.v1';
export const RECORDS_KEY = 'galim.records.v1';
export const TITLES = ['공책의 빈칸', '상영이 끝난 뒤', '첫 번째 마감', '더 배울 것인가', '누군가 내 작업을 원한다', '앞으로의 일 년'];
export const LABELS = ['시작', '만남', '첫 작업', '배움', '기회', '갈림'];
const option = (title, hint, echo) => ({ title, hint, echo });
export function validateChoices(value, max = 6) {
  return Array.isArray(value) && value.length <= max && value.every(n => Number.isInteger(n) && n >= 0 && n <= 2);
}
export function routeOf(choices) { return ['film', 'writing', 'parallel'][choices[1]] || 'film'; }
export function sceneFor(choices) {
  if (!validateChoices(choices, 5)) throw new Error('Invalid story position');
  const step = choices.length;
  const route = routeOf(choices);
  const opening = [
    ['공책 한 권을 끝까지 채웠다. 삐뚤빼뚤한 그림도, 마지막 장의 마침표도 모두 당신의 것이다.', '책가방 안에는 아직 끝내지 못한 공책이 있다. 마지막 장면은 틈이 날 때마다 조금씩 자라고 있다.', '친구와 번갈아 그린 공책을 가져왔다. 예상하지 못한 결말이지만, 그래서 더 마음이 간다.'][choices[0]],
    ['비를 피해 실내로 옮겼던 그날, 당신은 제약 속에서도 한 장면을 완성했다.', '모두의 일정을 다시 맞추던 일이 떠오른다. 한 편을 만드는 데 필요한 것은 카메라만이 아니었다.', '빗소리가 담긴 첫 영상은 계획과 달랐다. 당신은 그 우연을 작품의 일부로 남겼다.'][choices[2]],
    ['원고의 거친 문장은 남아 있지만 당신의 시선은 선명하다.', '다시 쓴 원고에는 처음 읽는 사람을 배려한 흔적이 남아 있다.', '서로 다른 해석을 실은 글에는 혼자서는 떠올리지 못했을 질문이 생겼다.'][choices[2]],
    ['모임에 가지 못한 주말에도, 당신은 다음 장면을 메모해 두었다.', '일정을 조정한 덕분에 한 번 더 촬영할 수 있었다. 그 시간이 저절로 생긴 것은 아니었다.', '퇴근 뒤 혼자 만든 짧은 영상이 하나 생겼다. 작지만 끝까지 만든 당신의 작업이다.'][choices[2]],
  ];
  if (step === 0) return {
    title: TITLES[0], period: '아직, 무엇도 정해지지 않은 날', place: '작은 방, 늦은 오후', art: 'notebook',
    paragraphs: ['창밖으로 빛이 길게 들어온다. 공책 한쪽에 그린 사람이 다음 칸으로 걸어간다.', '이야기를 끝내려면 몇 장이 더 필요하다. 내일 제출할 과제도 아직 남았다. 시계를 한 번 보고, 다시 공책을 본다.'],
    question: '남은 시간을 어디에 쓸까?',
    options: [option('이야기를 끝까지 그린다', '지금 떠오른 장면을 놓치고 싶지 않다.', '마지막 칸까지 그렸다. 과제는 덜 끝났지만, 처음으로 하나의 이야기를 완성했다.'), option('과제를 마친 뒤 한 장만 그린다', '해야 할 일과 하고 싶은 일을 함께 가져간다.', '과제를 제출할 수 있게 됐다. 이야기는 한 장만 나아갔지만, 다음에도 돌아올 자리가 남았다.'), option('친구에게 다음 장면을 물어본다', '내가 생각하지 못한 이야기가 궁금하다.', '친구가 전혀 다른 결말을 말했다. 당신은 빈칸 하나를 내어주었다. 이야기에 두 사람의 흔적이 남았다.')]
  };
  if (step === 1) return {
    title: TITLES[1], period: '조금 더 넓어진 세계', place: '작은 상영실, 불이 켜진 뒤', art: 'screen', memory: opening[0],
    paragraphs: ['상영이 끝나도 아무도 바로 일어나지 않는다. 작은 방 안에서 결말을 두고 이야기가 오간다.', '“우리도 뭔가 만들어볼까?” 누군가 묻는다. 책가방 안의 공책이 문득 생각난다.'],
    question: '이 사람들과 무엇을 시작할까?',
    options: [option('짧은 영상을 함께 찍어본다', '머릿속 장면을 화면으로 옮겨보고 싶다.', '처음으로 촬영 약속이 잡혔다. 누군가는 카메라를, 누군가는 장소를 알아보기로 했다. 당신은 장면을 쓴다.'), option('영화를 보고 글을 써서 나눈다', '장면이 마음에 남은 이유를 말로 찾고 싶다.', '모임의 작은 글모음이 시작됐다. 당신의 첫 원고 제목 아래, 처음으로 이름이 들어간다.'), option('일을 하면서 작은 작업을 이어간다', '내 생활을 지키면서 오래 해보고 싶다.', '평일의 일정을 먼저 정했다. 주말 한 칸을 비워두고, 그 안에서 만들 수 있는 짧은 영상을 생각한다.')]
  };
  if (step === 2 && route === 'film') return {
    title: '비가 그치지 않는다', period: '첫 번째 작업', place: '촬영 현장, 비 내리는 아침', art: 'rain', memory: '함께 만들자고 말했던 사람들이 장비 옆에 모여 있다.',
    paragraphs: ['촬영하기로 한 날, 비가 내린다. 지붕 아래 모인 사람들은 말없이 하늘을 본다.', '원래 쓰려던 장면은 햇빛 아래에서 시작한다. 오늘 찍을 수 있는 시간은 줄어들고 있다.'],
    question: '계획에 없던 비 앞에서, 무엇을 바꿀까?',
    options: [option('실내에서 찍을 수 있는 장면으로 바꾼다', '장소를 바꾸고 오늘 가능한 만큼 완성한다.', '창가의 작은 방으로 장소를 옮겼다. 넓은 풍경 대신 얼굴이 화면을 채운다. 당신은 대사를 조금 덜어냈다.'), option('동료들과 다시 촬영할 날을 잡는다', '기다리는 만큼, 모두의 시간을 다시 묻는다.', '바로 정해지는 날짜는 없었다. 몇 번의 연락 끝에 새로운 날이 잡혔다. 당신은 기다리는 동안 준비를 더 했다.'), option('비에 맞춰 이야기를 고쳐 쓴다', '안전한 지붕 아래에서, 이 날씨를 장면에 담는다.', '장비를 보호하고 처마 아래에서 촬영했다. 빗소리 때문에 대사가 들리지 않아, 침묵이 긴 장면이 되었다.')]
  };
  if (step === 2 && route === 'writing') return {
    title: '한 문장을 두고', period: '첫 번째 작업', place: '모임방, 원고 마감 전날', art: 'notebook',
    paragraphs: ['함께 읽은 원고 위에 여러 색의 메모가 붙었다. 누군가는 마지막 문장이 좋다고 하고, 누군가는 무슨 뜻인지 모르겠다고 한다.', '누구의 말도 가볍게 들리지 않는다. 내일이면 이 글이 다른 사람에게 건네진다.'], question: '어떤 글을 남기고 싶을까?',
    options: [option('내 관점을 지키되, 문장을 더 다듬는다', '낯설더라도 내가 본 것을 남긴다.', '결론을 바꾸는 대신 문장을 오래 고쳤다. 모두가 동의하지는 않았지만, 당신이 무엇을 보았는지는 조금 선명해졌다.'), option('편집 의견을 반영해 다시 쓴다', '처음 읽는 사람에게 한 발 다가간다.', '처음의 문장을 지우기는 어려웠다. 새 원고를 읽은 동료가 고개를 끄덕인다. 당신은 글이 독자를 만나는 법을 배웠다.'), option('서로 다른 해석을 함께 싣는다', '하나의 답보다 여러 시선을 남긴다.', '글 뒤에 동료의 짧은 답글을 붙였다. 당신의 원고는 결론 대신 대화로 끝났다.')]
  };
  if (step === 2) return {
    title: '비워둔 주말', period: '첫 번째 작업', place: '퇴근길, 달력 앞에서', art: 'city',
    paragraphs: ['일이 늘었다. 비워두었던 주말에도 나와줄 수 있겠냐는 연락이 왔다.', '모임 사람들은 그날 작은 영상을 찍기로 했다. 당신이 맡기로 한 장면도 있다.'], question: '이번 주말을 어떻게 보낼까?',
    options: [option('일을 하고, 모임에는 미리 알린다', '지금 필요한 수입을 우선한다.', '맡은 자료를 미리 전달했다. 촬영에는 가지 못했다. 퇴근 후 동료들이 보내온 사진을 한참 들여다봤다.'), option('일정을 바꿀 수 있는지 협의한다', '약속한 시간을 지킬 방법을 먼저 찾는다.', '대신 맡을 수 있는 일을 제안했다. 일정이 조정되어 촬영에 참여했지만, 다음 주에는 더 긴 근무가 기다린다.'), option('함께하는 작업 대신 짧은 영상을 따로 만든다', '지금 내 시간 안에서 끝낼 수 있는 것을 한다.', '모임에는 사정을 전했다. 퇴근길 풍경을 담고 집에서 편집했다. 아주 짧은 영상 하나에 당신의 일주일이 남았다.')]
  };
  if (step === 3) return {
    title: TITLES[3], period: '다음 장면을 준비하는 시간', place: '도서관 창가, 이른 저녁', art: 'library', memory: opening[route === 'film' ? 1 : route === 'writing' ? 2 : 3],
    paragraphs: [route === 'writing' ? '작은 글모음을 한 권 더 만들고 나니, 표현하고 싶은 것과 할 수 있는 것 사이의 거리가 보인다.' : '완성한 영상을 다시 보니, 만들고 싶었던 장면과 실제 화면 사이의 거리가 보인다.', '집중해서 배울 수 있는 과정이 눈에 들어온다. 시간을 내야 한다. 지금의 일과 작업을 조정해야 한다.'],
    question: '다음에는 어떻게 배울까?',
    options: [option('집중해서 배우는 시간을 마련한다', '다른 일의 비중을 줄이고 기초부터 익힌다.', '일정을 줄이고 수업과 연습을 시작했다. 당장의 수입은 줄었다. 혼자였다면 놓쳤을 기본기를 만났다.'), option('현장에서 일하며 경험을 쌓는다', '다른 사람의 작업을 가까이에서 본다.', '다른 사람의 작업을 도왔다. 내 작업은 느려졌지만, 혼자서는 몰랐던 제작의 순서와 약속을 배웠다.'), option('지금의 생활 안에서 작은 작업을 반복한다', '매주 끝낼 수 있는 분량으로 배운다.', '시간표에 작은 칸을 만들었다. 매번 한 가지씩만 고치기로 했다. 금방 달라지지는 않았지만, 작업이 쌓이기 시작했다.')]
  };
  if (step === 4) {
    const medium = route === 'writing' ? '원고' : '영상';
    const experience = ['배우는 동안 새로 알게 된 사람이 당신의 작업을 보았다.', '함께 일했던 사람이 작은 의뢰를 전해왔다.', '꾸준히 올린 작업을 보고 누군가 연락해왔다.'][choices[3]];
    return { title: TITLES[4], period: '처음으로 도착한 제안', place: '익숙한 책상, 낯선 연락', art: 'desk', memory: experience,
      paragraphs: [`당신에게 ${medium} 작업을 맡기고 싶다는 연락이 왔다. 반가운 제안이다. 다만 상대가 원하는 방향은 당신이 생각했던 것과 조금 다르다.`, '맡으면 시간을 많이 써야 한다. 미뤄둔 개인 작업이 떠오른다. 조건을 다시 읽어본다.'], question: '어떤 조건으로 함께할까?',
      options: [option('의뢰의 방향에 맞춰 작업한다', '정해진 조건 안에서 잘 만드는 경험을 얻는다.', `요구사항을 정리하고 ${medium}를 완성했다. 작업비를 받았다. 개인 작업은 잠시 멈췄지만, 마감을 지킨 경험이 남았다.`), option('규모를 줄여 내 방향을 제안한다', '작더라도 내가 만들고 싶은 것을 남긴다.', '상대의 예산과 맞지 않아 의뢰는 이어지지 않았다. 대신 줄인 규모로 개인 작업을 완성했다. 수입은 없지만 다음에 보여줄 것이 생겼다.'), option('시간과 방향을 함께 협의한다', '서로 지킬 수 있는 조건을 찾아본다.', choices[2] === 1 || choices[3] === 1 ? '이전 작업에서 일정을 조율했던 경험이 도움이 됐다. 납기를 늘리고 범위를 줄이는 데 합의했다. 당신의 의견도 일부 남았다.' : '이야기를 나누었지만 일정은 맞지 않았다. 이번에는 함께하지 않기로 했다. 당신은 작업 범위와 필요한 시간을 더 분명히 알게 됐다.')]
    };
  }
  return {
    title: TITLES[5], period: '아직 끝나지 않은 이야기', place: '어느 아침, 새로운 달력', art: 'dawn',
    memory: ['의뢰를 마친 뒤, 다시 개인 작업의 공책을 펼쳤다.', '작게 완성한 개인 작업이 책상 위에 놓여 있다.', choices[2] === 1 || choices[3] === 1 ? '함께 정한 조건으로 마친 작업에 여러 사람의 이름이 나란히 적혔다.' : '성사되지 않은 제안의 메모를 접고, 다음 작업의 분량을 적었다.'][choices[4]],
    paragraphs: ['언젠가의 막연한 꿈은 이제 해본 일과 아직 해보지 못한 일로 나뉜다. 어떤 선택도 모든 것을 가져다주지는 않았다.', '새 달력의 첫 장을 펼친다. 앞으로의 일 년, 당신은 어디에 더 많은 자리를 내어주고 싶은가.'], question: '다음 일 년을 어떻게 살아볼까?',
    options: [option('내 이야기를 만드는 데 더 많은 시간을 쓴다', '지금까지의 경험으로 다음 작업을 시작한다.', '공책 첫 장에 다음 작업의 제목을 썼다. 무엇이 될지는 아직 모른다. 그래도 이번에는, 시작하는 방법을 알고 있다.'), option('일과 개인 작업을 함께 이어간다', '오래 돌아올 수 있는 자리를 지킨다.', '달력에는 일하는 날과 작업하는 날이 함께 적혔다. 조금씩, 오래. 당신이 고른 속도다.'), option('다른 사람과 함께 만드는 일을 택한다', '좋은 이야기가 세상에 나오는 과정을 돕는다.', '새 작업의 준비 목록을 함께 작성했다. 화면에 보이지 않아도, 이야기를 가능하게 하는 일이 있다.')]
  };
}
export function journey(choices) {
  if (!validateChoices(choices)) throw new Error('Invalid choices');
  return choices.map((choice, i) => {
    const scene = sceneFor(choices.slice(0, i));
    return { chapter: i + 1, title: scene.title, choice: scene.options[choice].title, result: scene.options[choice].echo };
  });
}
export function endingFor(choices) {
  if (!validateChoices(choices) || choices.length !== 6) throw new Error('Incomplete life');
  const route = routeOf(choices);
  const kind = choices[5] === 2 ? 'together' : choices[5] === 1 ? 'parallel' : route === 'writing' ? 'writer' : 'director';
  const endings = {
    director: { title: '작은 영화의 연출자', subtitle: '당신의 시선으로, 다음 장면을.', text: '커다란 이름이 되었다는 이야기는 아직 없다. 대신 당신이 끝까지 책임진 화면이 있다. 누구의 허락도 아닌, 당신의 선택으로 시작한 다음 영화가 기다린다.', word: '시선', color: 'sage' },
    writer: { title: '이야기를 쓰는 사람', subtitle: '화면 밖에서도, 이야기는 계속된다.', text: '장면을 바라보던 사람은 이제 문장을 쓴다. 당신의 글을 기다리는 사람이 생겼다. 머릿속의 세계를 타인에게 건네는 방법을, 당신은 이렇게 찾았다.', word: '문장', color: 'sage' },
    parallel: { title: '두 개의 일상', subtitle: '당신이 고른 속도로, 오래.', text: '일을 마친 뒤 돌아오는 책상 위에 작은 작업이 자란다. 한 가지 직업만으로 당신을 설명할 수는 없다. 생활을 지키며 이야기를 놓지 않는 것. 당신이 택한 삶이다.', word: '지속', color: 'clay' },
    together: { title: '함께 만드는 사람', subtitle: '이야기 뒤에는, 사람이 있다.', text: '당신은 사람과 장면 사이를 잇는다. 일정을 조율하고, 필요한 것을 찾고, 누군가의 생각을 함께 완성한다. 이 이야기에는 하나보다 많은 이름이 적힌다.', word: '연결', color: 'sage' }
  };
  return { id: kind, ...endings[kind], route, work: route === 'writing' ? '함께 나눈 글과 원고' : route === 'parallel' ? '일상 사이에서 완성한 짧은 영상' : '동료들과 완성한 첫 영상', learning: ['집중해서 배운 기본기', '현장에서 얻은 제작 경험', '반복하며 익힌 작업 습관'][choices[3]], tradeoff: ['개인 작업에 쓰지 못한 시간', '의뢰 수입 대신 남긴 개인 작업', choices[2] === 1 || choices[3] === 1 ? '협의를 위해 내어준 시간과 일부 방향' : '성사되지 않은 의뢰와 더 분명해진 작업 조건'][choices[4]] };
}
export function validSave(save) {
  return save && save.version === 1 && validateChoices(save.choices) && ['scene', 'echo', 'ending'].includes(save.phase) && (save.phase === 'scene' ? save.choices.length < 6 : save.phase === 'echo' ? save.choices.length > 0 : save.choices.length === 6);
}
