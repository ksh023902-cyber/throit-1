import type { AppData, DiaryPage, PageElement, PenKind, Stroke } from '../types';

/**
 * 피드에 처음 보이는 다른 사람들의 예시 필렛.
 * 진짜 손으로 꾸민 다이어리처럼 손글씨, 사진 인화, 캐릭터 스티커, 라벨, 테이프가 겹쳐 있어요.
 * 페이지마다 만든 사람이 다르게 느껴지도록 구성과 색을 따로 잡았어요:
 * 여행 사진 스프레드, 별 테이프 하루 타임라인, 검정 펜 하나의 불렛저널, 굵은 마커 글씨 위 큰 그림,
 * 검은 종이와 흰 젤펜의 영화 기록, 보라 잉크 필사 노트, 스티커 가득한 카페 기록.
 * 그림과 사진은 public/images/seeds 에 있어요.
 */
const BASE = import.meta.env?.BASE_URL ?? '/';
const img = (name: string) => `${BASE}images/seeds/${name.includes('.') ? name : `${name}.svg`}`;
const base = { diaryId: 'community', createdAt: '2026-11-20T09:00:00Z', publishedAt: '2026-11-20T09:00:00Z' };

type TextOpts = { font?: string; color?: string; scale?: number; rotation?: number };
const text = (id: string, x: number, y: number, width: number, value: string, o: TextOpts = {}): PageElement =>
  ({ id, kind: 'text', x, y, width, rotation: o.rotation ?? 0, text: value, ...(o.font ? { font: o.font } : {}), ...(o.color ? { color: o.color } : {}), ...(o.scale ? { scale: o.scale } : {}) });
const sticker = (id: string, x: number, y: number, width: number, rotation: number, name: string, note?: string): PageElement =>
  ({ id, kind: 'sticker', x, y, width, rotation, assetId: img(name), ...(note ? { attachment: { kind: 'text', text: note } } : {}) });

// ── 손으로 그은 듯한 펜 자국을 만드는 도우미 (좌표는 종이 기준 %) ──
type Pt = [number, number];
const r2 = (n: number) => +n.toFixed(2);
const ink = (id: string, pen: PenKind, color: string, size: number, points: Pt[], widths?: number[]): Stroke =>
  ({ id, pen, color, size, points: points.map(([x, y]) => [r2(x), r2(y)] as Pt), ...(widths ? { widths } : {}) });
/** 손으로 그린 듯 살짝 겹쳐 도는 타원 */
const loop = (cx: number, cy: number, rx: number, ry: number, turns = 1.12): Pt[] =>
  Array.from({ length: Math.round(28 * turns) + 1 }, (_, i) => { const a = -2.4 + i / 28 * Math.PI * 2; const k = 1 + i / 300; return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]; });
/** 손으로 그은 네모 (모서리가 살짝 삐져나와요) */
const box = (x1: number, y1: number, x2: number, y2: number): Pt[] => [[x1 + 0.6, y1 - 0.2], [x2 + 0.8, y1 + 0.1], [x2, y2 + 0.3], [x1 - 0.3, y2], [x1 - 0.1, y1 - 0.7]];
/** 작은 별 낙서 */
const starDoodle = (cx: number, cy: number, r: number): Pt[] =>
  Array.from({ length: 11 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5; const k = i % 2 ? 0.45 : 1; return [cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k * 0.75]; });

const timeline: [string, number, 'L' | 'R', string, string][] = [
  ['6:00', 16, 'R', '아침', '알람 세 번 끄고\n겨우 기상. 토스트!'],
  ['9:30', 27, 'L', '도서관', '통계 3단원 풀이.\n생각보다 빨리 끝!'],
  ['13:00', 38, 'R', '점심', '학식 돈가스 +\n친구랑 오답 수다'],
  ['15:00', 49, 'L', '영단어', 'Day 11–15 끝.\n10분 엎드려 잠…'],
  ['17:30', 60, 'R', '운동', '30분 운동은…\n내일의 나에게.'],
  ['20:00', 71, 'L', '정리', '집중 4h 30m.\n리포트는 내일로.'],
];

export const seedPages: DiaryPage[] = [
  // 1. 영화 — 검은 종이에 흰 젤펜. 폴라로이드 한 장, 찢은 영화표, 금색 별 낙서
  { ...base, id: 'seed-movie', authorId: 'midnight.reel', theme: 'white', backgroundAssetId: img('paper-black'),
    title: '엔딩 크레딧이 끝날 때까지',
    body: '「등대지기의 여름」 심야 상영.\n마지막 장면, 등대 불이 꺼질 때 객석 전체가 숨을 참았다.\n대사보다 침묵이 더 길었던 영화. 엔딩곡까지 완벽해서 N회차 관람 확정.',
    tags: ['영화', '리뷰', '밤', 'OST'],
    elements: [
      text('m1', 8, 4.5, 56, '11.24 심야 영화', { font: 'gaegu', color: '#f4f1ea', scale: 1.15, rotation: -2 }),
      { id: 'm2', kind: 'photo', x: 7, y: 14, width: 46, rotation: -4, text: '엔딩 크레딧까지 앉아 있었다', assetId: img('photo-cinema.jpg') },
      sticker('m3', 61, 5, 31, 8, 'ticket-stub', '「등대지기의 여름」 ★4.5\n\n좋았던 것\n· 파도 소리만 들리는 3분짜리 롱테이크\n· 등대 불빛이 꺼지는 순간의 정적\n· 주인공이 끝내 편지를 부치지 않는 선택\n\n아쉬웠던 것\n· 중반부가 조금 느리다. 그런데 그 느림까지 이 영화 같았다.'),
      text('m4', 59, 44, 38, '「등대지기의 여름」\n\n마지막 장면,\n등대 불이 꺼질 때\n다 같이\n숨을 참았다.', { font: 'gaegu', color: '#f4f1ea', scale: 0.78 }),
      text('m5', 9, 66, 50, '★ 4.5 / 5', { font: 'gaegu', color: '#e9c46a', scale: 1.05, rotation: -3 }),
      text('m6', 8, 75, 86, '대사보다 침묵이 길었던 영화.\n엔딩곡까지 완벽해서\nN회차 관람 확정!', { font: 'gaegu', color: '#f4f1ea', scale: 0.86 }),
      sticker('m7', 84, 70, 9, 12, 'star-gold'),
    ],
    strokes: [
      ink('m-s1', 'ballpoint', '#e9c46a', 0.5, starDoodle(56, 69, 2.2)),
      ink('m-s2', 'ballpoint', '#f4f1ea', 0.4, starDoodle(90, 92, 1.8)),
      ink('m-u', 'ballpoint', '#f4f1ea', 0.45, [[9, 72.6], [24, 72.2], [38, 72.7]]),
    ] },

  // 2. 카페 — 분홍 종이에 사진 두 장과 캐릭터 스티커를 잔뜩. 말풍선, 이모티콘 라벨
  { ...base, id: 'seed-cafe', authorId: 'latte.note', theme: 'cream', backgroundAssetId: img('paper-pink'),
    title: '비 오는 날, 작은 오븐에서',
    body: '연남동 골목 끝 초록 문 카페 ‘작은 오븐’.\n빗소리 들으면서 바닐라 라떼 한 모금, 얼그레이 스콘 한 입.\n다음엔 바스크 치즈케이크를 먹어봐야지.',
    tags: ['카페', '디저트', '주말', '일상'],
    elements: [
      sticker('c1', 7, 7, 52, -3, 'photo-latte.jpg'),
      sticker('c2', 24, 4.5, 18, -6, 'tape-clear'),
      sticker('c3', 53, 31, 40, 6, 'photo-cake.jpg', '오늘의 주문\n바닐라 라떼 (얼음 적게) 5,800\n딸기 생크림 케이크 6,500\n\n사장님이 라떼 위에 하트를 그려주셨다.'),
      sticker('c4', 64, 6, 23, 7, 'bear'),
      sticker('c5', 5, 52, 11, -12, 'strawberry'),
      sticker('c6', 47, 3, 7, 0, 'star-gold'),
      sticker('c7', 9, 62, 46, -2, 'label-white'),
      text('c8', 13, 63.4, 40, '카페 ‘작은 오븐’', { font: 'pen', color: '#6b3f2a', scale: 0.78, rotation: -2 }),
      text('c9', 9, 71, 52, '비 오는 날엔 역시\n바닐라 라떼.\n딸기 케이크도\n최고였어!', { font: 'pen', color: '#6b3f2a', scale: 0.82 }),
      sticker('c10', 60, 71, 33, 3, 'bubble'),
      text('c11', 64.5, 73.4, 26, '또 올게요!', { font: 'pen', color: '#1a1a1a', scale: 0.72, rotation: 3 }),
      sticker('c12', 60, 88, 30, -3, 'label-white'),
      text('c13', 63.5, 89, 26, '( ´ ▽ ` )♡', { font: 'gothic', color: '#c86b84', scale: 0.5, rotation: -3 }),
    ],
    strokes: [
      ink('c-h', 'ballpoint', '#e8798f', 0.5, [[93, 26], [90.5, 23.6], [90.6, 22], [92, 21.6], [93, 22.8], [94, 21.6], [95.4, 22], [95.5, 23.6], [93, 26]]),
    ] },

  // 3. 개인 고민 — 점선 모눈 위 검정 펜 하나. KEY 기호로 머릿속을 정리한 불렛저널
  { ...base, id: 'seed-worry', authorId: 'grey.cloud', theme: 'white', backgroundAssetId: img('dotgrid-lines'),
    title: '요즘 나, 잘 하고 있는 걸까',
    body: '나만 느린 것 같은 기분, 미뤄둔 일과 미뤄둔 연락.\n생각이 많아서 잠이 안 오는 밤이었다.\n그래도 오늘, 산책 20분은 했으니까. 그거면 충분하다고 적어둔다.',
    tags: ['고민', '마음', '기록', '밤'],
    elements: [
      text('w1', 13, 7.5, 24, 'KEY', { font: 'pen', color: '#111111', scale: 1.1 }),
      text('w2', 13, 17, 40, '□ 할 일\n○ 약속\n△ 걸리는 마음\n■ 해냈다', { font: 'pen', color: '#111111', scale: 0.86 }),
      text('w3', 52, 17, 42, '→ 미뤄둠\n♡ 좋았던 것\n＊ 떠오른 생각\n☆ 중요', { font: 'pen', color: '#111111', scale: 0.86 }),
      text('w4', 13, 42, 80, '11월 넷째 주, 머릿속', { font: 'pen', color: '#111111', scale: 1.02 }),
      text('w5', 13, 51, 82, '△ 나만 느린 것 같은 기분\n→ 미뤄둔 연락, 이번 주엔 꼭\n□ 이력서 한 줄이라도 고치기\n■ 산책 20분\n♡ 비 오는 날 따뜻한 국수\n＊ 비교는 남의 하이라이트와\n    내 비하인드를 대는 일\n☆ 그래도, 충분해.', { font: 'pen', color: '#111111', scale: 0.84 }),
    ],
    strokes: [
      ink('w-box', 'ballpoint', '#111111', 0.45, box(11.5, 7.6, 27.5, 14.2)),
      ink('w-ul', 'ballpoint', '#111111', 0.4, [[13, 48.4], [40, 48.1], [66, 48.5]]),
    ] },

  // 4. 여행 — 사진 인화 두 장, 빨간 라벨 날짜, 캐릭터 스티커와 말풍선, 빽빽한 손글씨
  { ...base, id: 'seed-travel', authorId: 'paper.trip', theme: 'white', backgroundAssetId: img('paper-white'),
    title: '파도 소리로 일어난 아침',
    body: '제주 둘째 날. 숙소 창문을 열자마자 바다가 있었다.\n해안도로 자전거, 귤밭 옆 카페, 그리고 노을.\n아무 계획 없는 오후가 제일 좋았다.',
    tags: ['여행', '바다', '제주', '기록'],
    elements: [
      sticker('t1', 5, 3.5, 30, -3, 'label-red'),
      text('t2', 12, 4.9, 20, 'Day 2', { font: 'pen', color: '#1a1a1a', scale: 1, rotation: -3 }),
      sticker('t3', 5, 11.5, 40, -1, 'label-red'),
      text('t4', 10.5, 13, 32, '11월 22일 (土)', { font: 'pen', color: '#1a1a1a', scale: 0.86, rotation: -1 }),
      sticker('t5', 30, 2.5, 13, 72, 'tape-clear'),
      sticker('t6', 5, 23, 46, -1, 'photo-beach.jpg', '숙소 창문을 열자마자 찍은 사진.\n아직 아무도 없는 바다는\n세상에서 제일 조용한 소리를 냈다.'),
      sticker('t7', 51, 3, 15, 4, 'girl'),
      text('t8', 68, 4, 28, '#OOTD', { font: 'pen', color: '#1a1a1a', scale: 0.78 }),
      sticker('t9', 88, 11, 8, 10, 'bow'),
      sticker('t10', 46, 15, 6, 0, 'star-navy'),
      text('t11', 55, 21, 42, '어제 산 노란\n원피스를 바로\n개시했다. 새 옷\n입은 날은 기분이\n너무 좋아!', { font: 'pen', color: '#1a1a1a', scale: 0.8 }),
      sticker('t12', 56, 44.5, 28, -2, 'label-white'),
      text('t13', 58.5, 45.4, 25, '( ´ ▽ ` )♡', { font: 'gothic', color: '#1a1a1a', scale: 0.46, rotation: -2 }),
      sticker('t14', 50, 52, 44, 3, 'photo-forest.jpg', '곶자왈 숲길.\n천 년 된 나무 사이로 빛이 쏟아졌다.\n휴대폰은 주머니에 넣어두고 한참 걸었다.'),
      sticker('t15', 62, 55, 29, -4, 'bubble'),
      text('t16', 66.5, 57.3, 22, '정말 예쁘다!', { font: 'pen', color: '#1a1a1a', scale: 0.66, rotation: -4 }),
      sticker('t17', 84, 42, 13, 8, 'ghost'),
      sticker('t18', 2, 62, 8, -8, 'star-blue'),
      text('t19', 6, 69, 42, '해안도로 자전거 타고\n귤밭 옆 카페까지.\n저녁엔 곶자왈 숲.\n아무 계획 없는\n오후가 제일\n좋았다!', { font: 'pen', color: '#1a1a1a', scale: 0.8 }),
    ],
    strokes: [] },

  // 5. 소설 — 연보라 줄노트에 보라 잉크로 필사. 레이스 테이프, 압화, 형광펜 한 줄
  { ...base, id: 'seed-novel', authorId: 'ink.and.page', theme: 'cream', backgroundAssetId: img('lined-lilac'),
    title: '밑줄 긋고 싶은 문장들',
    body: '『겨울 정원의 편지』 완독. 286쪽.\n“기다림은 멈춰 서 있는 게 아니라, 아주 천천히 걸어가는 일이었다.”\n다 읽고 나서 창밖을 한참 봤다. 편지 쓰고 싶은 사람이 생겼다.',
    tags: ['책', '소설', '문장수집', '기록'],
    elements: [
      sticker('n1', 30, 1.5, 42, -2, 'tape-lace'),
      text('n2', 8, 8, 86, '필사 노트 #12 · 『겨울 정원의 편지』', { font: 'pen', color: '#5b4a8a', scale: 0.86 }),
      text('n3', 10, 16, 82, '기다림은 멈춰 서 있는 게\n아니라, 아주 천천히\n걸어가는 일이었다.\n\n편지를 쓰지 못한 날에도\n할머니는 정원에 물을 주었다.\n꽃은 대답 대신 피어났다.', { font: 'gamja', color: '#3c2f6b', scale: 0.94 }),
      text('n4', 62, 47, 32, '— p.142', { font: 'pen', color: '#9a63c4', scale: 0.86 }),
      sticker('n5', 70, 54, 21, 12, 'pressed-flower', '책 사이에 끼워 말린 제비꽃.\n이 책을 처음 펼친 날 산책길에서 주웠다.\n\n다음에 다시 읽을 때도 여기서 만나자.'),
      text('n6', 10, 57, 58, '다 읽고 나서\n창밖을 한참 봤다.\n편지 쓰고 싶은\n사람이 생겼다.', { font: 'hi-melody', color: '#6b5a9a', scale: 0.92, rotation: -1 }),
      text('n7', 10, 81, 84, '읽은 날 11.10 – 11.23\n별점 ★★★★★ 인생책', { font: 'pen', color: '#3c2f6b', scale: 0.8 }),
      sticker('n8', 84, 84, 8, -10, 'star-gold'),
    ],
    strokes: [
      ink('n-hl', 'highlighter', '#c9b2ec', 3, [[9.5, 17.6], [66, 17.4]]),
      ink('n-hl2', 'highlighter', '#c9b2ec', 3, [[9.5, 22.2], [48, 22]]),
    ] },

  // 6. 음악 — 굵은 검정 마커로 빽빽하게 쓴 글 위에 분홍 크레용 사람이 춤추듯 겹친 그림
  { ...base, id: 'seed-music', authorId: 'side.b.tape', theme: 'white', backgroundAssetId: img('paper-sketch'),
    title: '새벽 2시의 플레이리스트',
    body: '잠이 안 와서 만든 새벽 플레이리스트.\n창밖의 비, 막차의 온도, 잠 못 드는 우리, 새벽 세 시, 다시 봄.\n가사 한 줄이 오늘의 나를 대신 말해줄 때가 있다. 좋아하는 영화 OST도 한 곡 넣었다.',
    tags: ['음악', '플레이리스트', 'OST', '밤'],
    elements: [
      text('u1', 5, 4, 92, '새벽 두 시, 잠이 안 와서 노래를 튼다. 이어폰 한쪽은 너에게. When the music plays, the night gets a little softer. 가사 한 줄이 나를 대신 말해줄 때, 오늘도 lucky NIGHT', { font: 'east-sea', color: '#151515', scale: 1.8 }),
      sticker('u2', 9, 27, 86, -6, 'pink-figure', '새벽 2시의 플레이리스트\n\n01 창밖의 비\n02 막차의 온도\n03 잠 못 드는 우리\n04 새벽 세 시 (OST)\n05 다시, 봄\n\n마지막 곡이 끝날 즈음엔 창밖이 조금씩 밝아온다.'),
    ],
    strokes: [] },

  // 7. 공부 — 남색 별 테이프 타임라인에 하늘색 시간 라벨, 색색의 큰 날짜, 빽빽한 펜 메모
  { ...base, id: 'seed-study', authorId: 'mint.planner', theme: 'mint', backgroundAssetId: img('paper-cream'),
    title: '기말고사 D-14 플랜',
    body: '기말고사까지 2주. 통계 3단원 문제풀이, 영어 단어 Day 11–15 끝.\n전공 리포트 초안과 오답노트는 내일로.\n오늘의 집중 시간 4시간 30분. 졸릴 땐 10분만 엎드려 자기.',
    tags: ['공부', '시험', '계획', '기록'],
    elements: [
      text('d0', 5, 4, 56, 'D-14 · 기말 준비하는 날', { font: 'pen', color: '#1a1a1a', scale: 0.78 }),
      sticker('d1', 73, 0.5, 23, 4, 'cat-bike'),
      sticker('d-tape', 39.5, 0, 16, 1, 'star-tape'),
      ...timeline.flatMap(([time, y, side], i) => [
        sticker(`d-l${i}`, 37, y - 3.4, 22, side === 'L' ? -3 : 3, 'label-blue'),
        text(`d-t${i}`, 41, y - 2.7, 18, time, { font: 'pen', color: '#1e3a6e', scale: 0.95, rotation: side === 'L' ? -3 : 3 }),
      ]),
      ...timeline.flatMap(([, y, side, head, note], i) => {
        const x = side === 'L' ? 5 : 63;
        return [text(`d-h${i}`, x + 1.5, y - 4.4, 30, head, { font: 'pen', color: '#1a1a1a', scale: 0.74 }), text(`d-n${i}`, x, y + 0.4, 34, note, { font: 'pen', color: '#2a2a2a', scale: 0.62 })];
      }),
      ...[['1', '#22325e'], ['1', '#c8453d'], ['.', '#1a1a1a'], ['2', '#2f8f8a'], ['5', '#c8453d']]
        .map(([ch, color], i) => text(`d-date${i}`, 4 + [0, 6.5, 13, 16.5, 24][i], 80, 10, ch, { font: 'jua', color, scale: 2.1, rotation: [-6, 4, 0, -3, 6][i] })),
      sticker('d2', 62, 86, 7, 12, 'star-gold'),
      text('d3', 66, 84, 30, '내일도\n화이팅!', { font: 'pen', color: '#1a1a1a', scale: 0.74, rotation: -3 }),
    ],
    strokes: [
      ...timeline.map(([, y, side, head], i) => { const cx = (side === 'L' ? 5 : 63) + 1.5 + head.length * 2.1; return ink(`d-c${i}`, 'ballpoint', '#1a1a1a', 0.35, loop(cx, y - 2.6, head.length * 2.5 + 3, 2.6)); }),
    ] },
];

const isSeed = (p: DiaryPage) => p.diaryId === 'community';

/** 예전에 저장된 기기에도 지금의 예시 필렛이 보이도록, 예시만 새것으로 바꿔요. 내 필렛과 보관은 그대로예요. */
export function withCurrentSeeds(data: AppData): AppData {
  const ids = new Set(seedPages.map(p => p.id));
  return {
    ...data,
    published: [...data.published.filter(p => !isSeed(p)), ...structuredClone(seedPages)],
    savedIds: data.savedIds.filter(id => !id.startsWith('seed-') || ids.has(id)),
  };
}

export function initialData(): AppData { return { version:1,profile:{id:'me',handle:'my.little.days',bio:'평범한 하루를, 조금 더 오래.'},diaries:[{id:'my-diary',title:'내 작은 날들',cover:'charcoal'},{id:'my-notes',title:'문득 떠오른 생각',cover:'linen'}],drafts:[],published:structuredClone(seedPages),savedIds:[] }; }
