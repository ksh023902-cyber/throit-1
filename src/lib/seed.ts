import type { AppData, DiaryPage, PageElement, PenKind, Stroke } from '../types';

/**
 * 피드에 처음 보이는 다른 사람들의 예시 필렛.
 * 주제마다 서로 다른 사람이 만든 것처럼 화풍과 구성을 완전히 다르게 했어요:
 * 영화 포스터, 카페 콜라주, 여백 많은 미니멀 고민, 수채화 여행, 타자기 독서 원고, 픽셀아트 음악, 불렛저널 공부.
 * 배경과 스티커 그림은 public/images/seeds 에 있는 SVG예요.
 */
const BASE = import.meta.env?.BASE_URL ?? '/';
const img = (name: string) => `${BASE}images/seeds/${name}.svg`;
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
/** 부드러운 곡선 (2차 베지어) */
const curve = (a: Pt, c: Pt, b: Pt, n = 14): Pt[] =>
  Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t; return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]; });
/** 붓펜·만년필 굵기 변화: 가운데가 굵고 양 끝이 가늘게 */
const swell = (n: number, lo = 0.55, hi = 1.3) => Array.from({ length: n }, (_, i) => r2(lo + (hi - lo) * Math.sin(Math.PI * i / Math.max(1, n - 1))));
/** 화살표: 몸통 곡선 + 화살촉 */
const arrow = (id: string, pen: PenKind, color: string, size: number, a: Pt, c: Pt, b: Pt): Stroke[] => {
  const body = curve(a, c, b, 12); const [px, py] = body[body.length - 2]; const ang = Math.atan2(b[1] - py, (b[0] - px) * 0.75); const L = 2.6;
  const wing = (d: number): Pt => [b[0] - Math.cos(ang + d) * L, b[1] - Math.sin(ang + d) * L * 0.75];
  return [ink(id, pen, color, size, body, pen === 'brush' || pen === 'fountain' ? swell(body.length, 0.5, 1.2) : undefined), ink(`${id}h`, pen === 'brush' ? 'ballpoint' : pen, color, size, [wing(0.5), b, wing(-0.5)])];
};

export const seedPages: DiaryPage[] = [
  // 1. 영화 — 한 장짜리 영화 포스터. 청록·주황 보색, 평면 그래픽, 큰 붓글씨 제목, 펜 자국 없이 깔끔하게
  { ...base, id: 'seed-movie', authorId: 'midnight.reel', theme: 'white', backgroundAssetId: img('movie-poster'),
    title: '엔딩 크레딧이 끝날 때까지',
    body: '「등대지기의 여름」 심야 상영.\n마지막 장면, 등대 불이 꺼질 때 객석 전체가 숨을 참았다.\n대사보다 침묵이 더 길었던 영화. 엔딩곡까지 완벽해서 N회차 관람 확정.',
    tags: ['영화', '리뷰', '밤', 'OST'],
    elements: [
      text('m1', 13, 4.5, 76, 'A FILM BY HAN YEOREUM · SUMMER 2026', { font: 'gothic', color: '#f4e3c3', scale: 0.5 }),
      sticker('m2', 73, 9, 19, 12, 'rating-stamp', '「등대지기의 여름」 ★4.5\n\n좋았던 것\n· 파도 소리만 들리는 3분짜리 롱테이크\n· 등대 불빛이 꺼지는 순간의 정적\n· 주인공이 끝내 편지를 부치지 않는 선택\n\n아쉬웠던 것\n· 중반부가 조금 느리다. 그런데 그 느림까지 이 영화 같았다.'),
      text('m3', 8, 73, 88, '등대지기의 여름', { font: 'brush', color: '#f7ead2', scale: 1.75 }),
      text('m4', 9, 85, 84, '침묵이 대사보다 길었던 120분', { font: 'myeongjo', color: '#f2a65a', scale: 0.62 }),
      text('m5', 9, 90.5, 84, '감독 한여름   주연 윤서해 · 도진   음악 새벽세시\n11.24 심야 상영 · 7관 H-12', { font: 'gothic', color: '#c9bba0', scale: 0.42 }),
    ],
    strokes: [] },

  // 2. 카페 — 크라프트지 위 잡지 콜라주. 흐릿한 필름 사진 두 장, 오려 붙인 글자, 영수증, 마스킹 테이프
  { ...base, id: 'seed-cafe', authorId: 'latte.note', theme: 'cream', backgroundAssetId: img('cafe-kraft'),
    title: '비 오는 날, 작은 오븐에서',
    body: '연남동 골목 끝 초록 문 카페 ‘작은 오븐’.\n빗소리 들으면서 바닐라 라떼 한 모금, 얼그레이 스콘 한 입.\n다음엔 바스크 치즈케이크를 먹어봐야지.',
    tags: ['카페', '디저트', '주말', '일상'],
    elements: [
      { id: 'c1', kind: 'photo', x: 5, y: 3, width: 43, rotation: -6, text: '11:20 am, 바닐라 라떼', assetId: img('latte-photo') },
      { id: 'c2', kind: 'photo', x: 49, y: 17, width: 42, rotation: 7, text: '창가 자리, 비', assetId: img('rain-photo'), attachment: { kind: 'text', text: '창문에 빗방울이 맺히는 걸 한참 봤다.\n카페 이름은 ‘작은 오븐’.\n연남동 골목 끝, 초록 문.\nOPEN 11:00 – 21:00' } },
      sticker('c3', 5, 54, 58, -4, 'cutout-letters'),
      sticker('c4', 62, 57, 32, 4, 'receipt'),
      text('c5', 65.5, 61, 27, 'SMALL OVEN\n연남동 골목 끝\n- - - - - - -\n바닐라라떼 5.8\n얼그레이스콘 4.2\n- - - - - - -\nTOTAL   10.0\n\nTHANK YOU ♥', { font: 'typewriter', color: '#3b3a36', scale: 0.44, rotation: 4 }),
      sticker('c6', 68, 55, 20, -8, 'tape'),
      text('c7', 6, 67, 56, '비 오는 날엔\n역시 라떼지.', { font: 'pen', color: '#2e1d12', scale: 1.3, rotation: -6 }),
      text('c8', 7, 86, 54, '다음엔 바스크 치즈케이크!', { font: 'gaegu', color: '#4a2f1d', scale: 0.72, rotation: -2 }),
    ],
    strokes: [
      ...arrow('c-arrow', 'ballpoint', '#fbf3e4', 0.5, [44, 70], [50, 62], [44, 56]),
    ] },

  // 3. 개인 고민 — 여백이 대부분인 미니멀. 무채색 종이, 작은 바탕체 몇 줄, 연필로 지운 줄과 작은 새싹 하나
  { ...base, id: 'seed-worry', authorId: 'grey.cloud', theme: 'white', backgroundAssetId: img('plain-paper'),
    title: '요즘 나, 잘 하고 있는 걸까',
    body: '나만 느린 것 같은 기분, 미뤄둔 일과 미뤄둔 연락.\n생각이 많아서 잠이 안 오는 밤이었다.\n그래도 오늘, 산책 20분은 했으니까. 그거면 충분하다고 적어둔다.',
    tags: ['고민', '마음', '기록', '밤'],
    elements: [
      text('w1', 12, 8, 60, '2026. 11. 26.  비', { font: 'typewriter', color: '#a3a09a', scale: 0.5 }),
      text('w2', 12, 36, 78, '요즘 나, 잘 하고 있는 걸까.', { font: 'batang', color: '#2b2b2b', scale: 0.9 }),
      text('w3', 12, 44, 78, '남들보다 늦은 것 같아\n해야 할 일은 쌓여만 가고\n연락은 미뤄두기만 했다', { font: 'batang', color: '#8c8a84', scale: 0.62 }),
      text('w4', 12, 61, 78, '그래도 오늘은 산책 20분.\n그걸로 충분해.', { font: 'hi-melody', color: '#5f7fa3', scale: 0.82 }),
    ],
    strokes: [
      ink('w-strike', 'pencil', '#55534e', 0.35, [[11.5, 45.6], [26, 45.2], [40, 45.5], [47.5, 45.1]]),
      ink('w-sprout', 'pencil', '#6b7a6a', 0.4, curve([82, 90], [81, 86], [82.5, 82], 8)),
      ink('w-leaf1', 'pencil', '#6b7a6a', 0.4, [[82.3, 84], [79.5, 82.6], [78.2, 83.6], [80.4, 84.6], [82.3, 84]]),
      ink('w-leaf2', 'pencil', '#6b7a6a', 0.4, [[82.6, 83], [85.2, 81.2], [86.8, 82], [84.8, 83.4], [82.6, 83]]),
    ] },

  // 4. 여행 — 수채화 스케치북. 번지는 물감 풍경, 붓글씨 제목, 오늘의 색 팔레트
  { ...base, id: 'seed-travel', authorId: 'paper.trip', theme: 'white', backgroundAssetId: img('watercolor'),
    title: '파도 소리로 일어난 아침',
    body: '제주 둘째 날. 숙소 창문을 열자마자 바다가 있었다.\n해안도로 자전거, 귤밭 옆 카페, 그리고 노을.\n아무 계획 없는 오후가 제일 좋았다.',
    tags: ['여행', '바다', '제주', '기록'],
    elements: [
      text('t1', 11, 56, 80, '파도 소리로\n깬 아침', { font: 'brush', color: '#2f5f73', scale: 1.3, rotation: -2 }),
      text('t2', 12, 72, 42, '07:00 기상\n10:30 해안 자전거\n15:00 귤밭 옆 카페\n19:20 노을', { font: 'gamja', color: '#4b6b78', scale: 0.76 }),
      text('t3', 57, 70, 36, '오늘의 색', { font: 'pen', color: '#7a8b8f', scale: 0.7 }),
      sticker('t4', 56, 75, 36, -3, 'paint-swatches', '여행 준비물 체크\n☑ 수채 물감과 작은 붓\n☑ 좋아하는 책 한 권\n☑ 바다에서 신을 슬리퍼\n☐ 계획 (일부러 안 챙김)'),
      text('t5', 10, 90, 84, '아무 계획 없는 오후가 제일 좋았다.', { font: 'pen', color: '#2f5f73', scale: 0.74 }),
    ],
    strokes: [] },

  // 5. 소설 — 타자기로 친 독서 원고. 빽빽한 고정폭 글씨, 명조 인용문, 빨간 교정 펜, 압화 한 송이
  { ...base, id: 'seed-novel', authorId: 'ink.and.page', theme: 'cream', backgroundAssetId: img('typed-paper'),
    title: '밑줄 긋고 싶은 문장들',
    body: '『겨울 정원의 편지』 완독. 286쪽.\n“기다림은 멈춰 서 있는 게 아니라, 아주 천천히 걸어가는 일이었다.”\n다 읽고 나서 창밖을 한참 봤다. 편지 쓰고 싶은 사람이 생겼다.',
    tags: ['책', '소설', '문장수집', '기록'],
    elements: [
      text('n1', 10, 8, 80, '『겨울 정원의 편지』\n독서 메모 #12 — 286p 완독', { font: 'typewriter', color: '#1f1f1f', scale: 0.62 }),
      text('n2', 10, 18, 80, '시골 정원사 할머니에게 매주 이름 없는\n편지가 도착한다. 할머니는 답장을 쓰지\n못한 채 계절을 보낸다. 읽는 내내\n누군가의 오래된 편지를 몰래 읽는\n기분이었다. 문장이 조용해서, 나도\n조용히 읽게 되는 책.', { font: 'typewriter', color: '#3a3a38', scale: 0.5 }),
      text('n3', 15, 38, 72, '“기다림은 멈춰 서 있는 게\n아니라, 아주 천천히\n걸어가는 일이었다.”', { font: 'myeongjo', color: '#111111', scale: 0.95 }),
      text('n4', 52, 52, 40, 'p.142 ← 울컥', { font: 'pen', color: '#c0392b', scale: 0.9, rotation: -4 }),
      text('n5', 10, 61, 60, '— 3장과 9장은 다시 읽을 것.\n— 다 읽고 창밖을 한참 봤다.\n— 편지 쓰고 싶은 사람이 생겼다.', { font: 'typewriter', color: '#3a3a38', scale: 0.5 }),
      sticker('n6', 68, 62, 22, 10, 'pressed-flower', '책 사이에 끼워 말린 제비꽃.\n이 책을 처음 펼친 날 산책길에서 주웠다.\n\n다음에 다시 읽을 때도 여기서 만나자.'),
      text('n7', 10, 84, 50, 'RATING ★★★★★\n(인생책)', { font: 'typewriter', color: '#b3261e', scale: 0.55 }),
    ],
    strokes: [
      ink('n-bar1', 'ballpoint', '#c0392b', 0.45, [[11.5, 38], [11.6, 50.5]]),
      ink('n-bar2', 'ballpoint', '#c0392b', 0.45, [[12.6, 38.3], [12.7, 50.2]]),
    ] },

  // 6. 음악 — 픽셀아트 레트로 컴퓨터 화면. 남색 화면에 형광 민트·분홍, 플레이어 창과 이퀄라이저
  { ...base, id: 'seed-music', authorId: 'side.b.tape', theme: 'white', backgroundAssetId: img('pixel-night'),
    title: '새벽 2시의 플레이리스트',
    body: '잠이 안 와서 만든 새벽 플레이리스트.\n창밖의 비, 막차의 온도, 잠 못 드는 우리, 새벽 세 시, 다시 봄.\n가사 한 줄이 오늘의 나를 대신 말해줄 때가 있다. 좋아하는 영화 OST도 한 곡 넣었다.',
    tags: ['음악', '플레이리스트', 'OST', '밤'],
    elements: [
      text('u1', 12, 19, 76, '새벽 2시의 플레이리스트', { font: 'jua', color: '#7cf2c4', scale: 1.02 }),
      text('u2', 12, 27, 76, '▶ 01 창밖의 비\n  02 막차의 온도\n  03 잠 못 드는 우리\n  04 새벽 세 시 (OST)\n  05 다시, 봄', { font: 'typewriter', color: '#c9c3ff', scale: 0.6 }),
      sticker('u3', 62, 42, 25, 0, 'pixel-headphones'),
      text('u4', 12, 45, 50, '이어폰 한쪽은\n너에게 빌려주고\n싶은 밤', { font: 'cute', color: '#ffe66d', scale: 0.95 }),
      sticker('u5', 77, 58, 9, 0, 'pixel-heart', 'SIDE B · 2AM MIX\n\n잠 못 드는 밤마다 같은 노래를 돌려 듣다가\n아예 순서까지 정해버렸다.\n\n마지막 곡이 끝날 즈음엔\n창밖이 조금씩 밝아온다.'),
      text('u6', 12, 64, 76, '> 가사 한 줄이 오늘의 나를 대신 말해줄 때_', { font: 'typewriter', color: '#ff77c8', scale: 0.5 }),
    ],
    strokes: [] },

  // 7. 공부 — 불렛저널. 점 모눈, 파스텔 마스킹 테이프, 습관 트래커 표, 노란 포스트잇
  { ...base, id: 'seed-study', authorId: 'mint.planner', theme: 'mint', backgroundAssetId: img('dot-grid'),
    title: '기말고사 D-14 플랜',
    body: '기말고사까지 2주. 통계 3단원 문제풀이, 영어 단어 Day 11–15 끝.\n전공 리포트 초안과 오답노트는 내일로.\n오늘의 집중 시간 4시간 30분. 졸릴 땐 10분만 엎드려 자기.',
    tags: ['공부', '시험', '계획', '기록'],
    elements: [
      sticker('d1', 4, 2.5, 38, -4, 'washi-stripe'),
      sticker('d2', 60, 2, 34, 5, 'washi-dot'),
      text('d3', 10, 9, 80, '기말고사 D-14', { font: 'dodum', color: '#2c2c2a', scale: 1.1 }),
      text('d4', 10, 16, 80, 'WEEK 48 · 11.24 – 11.30', { font: 'gothic', color: '#9a978e', scale: 0.52 }),
      sticker('d5', 10, 22, 80, 0, 'habit-tracker'),
      text('d6', 10, 58, 47, '• 통계 3단원 ✓\n• 영어 Day 11–15 ✓\n• 전공 리포트 초안\n• 오답노트 정리', { font: 'dodum', color: '#3a3a36', scale: 0.64 }),
      sticker('d7', 58, 57, 34, 4, 'sticky-note', '시험 일정\n12.08 (월) 통계학\n12.10 (수) 영어 II\n12.11 (목) 전공 리포트 마감\n\n끝나면 바로 영화 보러 가기!'),
      text('d8', 61, 61, 28, '졸릴 땐\n10분만\n엎드려 자기!', { font: 'gaegu', color: '#6b5a1e', scale: 0.78, rotation: 4 }),
      text('d9', 10, 76, 46, '오늘의 집중 4h 30m', { font: 'single-day', color: '#5aa58a', scale: 0.82 }),
      text('d10', 10, 90, 60, 'study log · mint.planner', { font: 'gothic', color: '#b0ada4', scale: 0.48 }),
    ],
    strokes: [
      ink('d-hl', 'highlighter', '#ffe27a', 2.8, [[9.5, 13.4], [58, 13.2]]),
      ink('d-star', 'ballpoint', '#f7a6b8', 0.5, [[50, 74], [51.2, 76.9], [54.2, 76.9], [51.8, 78.7], [52.8, 81.5], [50, 79.8], [47.2, 81.5], [48.2, 78.7], [45.8, 76.9], [48.8, 76.9], [50, 74]]),
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
