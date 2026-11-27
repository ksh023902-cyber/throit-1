import type { AppData, DiaryPage, PageElement, PenKind, Stroke } from '../types';

/**
 * 피드에 처음 보이는 다른 사람들의 예시 필렛.
 * 주제(영화·카페·고민·여행·소설·음악·공부)마다 종이 배경, 색, 글꼴, 펜 자국, 스티커를 그 분위기에 맞게 꾸몄어요.
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
/** 물결 밑줄 */
const wave = (x1: number, x2: number, y: number, amp: number, bumps: number): Pt[] =>
  Array.from({ length: bumps * 6 + 1 }, (_, i) => [x1 + (x2 - x1) * i / (bumps * 6), y + Math.sin(i / 6 * Math.PI * 2) * amp]);
/** 살짝 비뚤게 두 바퀴 도는 동그라미 */
const loop = (cx: number, cy: number, rx: number, ry: number, turns = 1.15): Pt[] =>
  Array.from({ length: Math.round(28 * turns) + 1 }, (_, i) => { const a = -2.2 + i / 28 * Math.PI * 2; const k = 1 + i / 260; return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]; });
/** 부드러운 곡선 (2차 베지어) */
const curve = (a: Pt, c: Pt, b: Pt, n = 14): Pt[] =>
  Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t; return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]; });
/** 붓펜·만년필 굵기 변화: 가운데가 굵고 양 끝이 가늘게 */
const swell = (n: number, lo = 0.55, hi = 1.3) => Array.from({ length: n }, (_, i) => r2(lo + (hi - lo) * Math.sin(Math.PI * i / Math.max(1, n - 1))));
/** 곡선을 따라 끊어 그린 점선 */
const dashed = (id: string, color: string, path: Pt[], every = 2): Stroke[] =>
  path.reduce<Stroke[]>((out, p, i) => (i % every === 0 && path[i + 1] ? [...out, ink(`${id}${i}`, 'ballpoint', color, 0.55, [p, path[i + 1]])] : out), []);
/** 반짝이 (+ 모양 두 획) */
const sparkle = (id: string, color: string, x: number, y: number, s: number, pen: PenKind = 'ballpoint', size = 0.5): Stroke[] =>
  [ink(`${id}a`, pen, color, size, [[x, y - s], [x, y + s]]), ink(`${id}b`, pen, color, size, [[x - s * 0.75, y], [x + s * 0.75, y]])];
/** 화살표: 몸통 곡선 + 화살촉 */
const arrow = (id: string, pen: PenKind, color: string, size: number, a: Pt, c: Pt, b: Pt): Stroke[] => {
  const body = curve(a, c, b, 12); const [px, py] = body[body.length - 2]; const ang = Math.atan2(b[1] - py, (b[0] - px) * 0.75); const L = 2.6;
  const wing = (d: number): Pt => [b[0] - Math.cos(ang + d) * L, b[1] - Math.sin(ang + d) * L * 0.75];
  return [ink(id, pen, color, size, body, pen === 'brush' || pen === 'fountain' ? swell(body.length, 0.5, 1.2) : undefined), ink(`${id}h`, pen === 'brush' ? 'ballpoint' : pen, color, size, [wing(0.5), b, wing(-0.5)])];
};

export const seedPages: DiaryPage[] = [
  // 1. 영화 리뷰 — 불 꺼진 상영관: 먹색 바탕, 필름 띠, 스크린 불빛, 금색·빨강 포인트
  { ...base, id: 'seed-movie', authorId: 'midnight.reel', theme: 'white', backgroundAssetId: img('movie-bg'),
    title: '엔딩 크레딧이 끝날 때까지',
    body: '「등대지기의 여름」 심야 상영.\n마지막 장면, 등대 불이 꺼질 때 객석 전체가 숨을 참았다.\n대사보다 침묵이 더 길었던 영화. 엔딩곡까지 완벽해서 N회차 관람 확정.',
    tags: ['영화', '리뷰', '밤', 'OST'],
    elements: [
      text('m1', 10, 5, 70, 'CINEMA DIARY · No.27', { font: 'typewriter', color: '#e9c46a', scale: 0.72 }),
      text('m2', 10, 10, 82, '엔딩 크레딧이\n다 올라갈 때까지\n일어나지 못했다.', { font: 'myeongjo', color: '#f5ecd7', scale: 1.2, rotation: -1 }),
      sticker('m3', 36, 30, 58, -6, 'ticket', '「등대지기의 여름」 ★4.5\n\n좋았던 것\n· 파도 소리만 들리는 3분짜리 롱테이크\n· 등대 불빛이 꺼지는 순간의 정적\n· 주인공이 끝내 편지를 부치지 않는 선택\n\n아쉬웠던 것\n· 중반부가 조금 느리다. 그런데 그 느림까지 이 영화 같았다.'),
      text('m4', 7, 31, 30, '나의 별점\n★★★★½', { font: 'jua', color: '#f2c14e', scale: 0.82, rotation: -5 }),
      text('m5', 10, 55, 80, '「등대지기의 여름」\n\n마지막 장면, 등대 불이 꺼질 때\n객석 전체가 숨을 참았다.\n대사보다 침묵이 더 길었던 영화.', { font: 'batang', color: '#ddd5c4', scale: 0.76 }),
      sticker('m6', 72, 78, 18, 9, 'popcorn'),
      text('m7', 9, 81, 60, '엔딩곡까지 완벽.\nN회차 관람 확정!', { font: 'east-sea', color: '#ef6a55', scale: 0.95, rotation: -3 }),
    ],
    strokes: [
      ink('m-ul', 'brush', '#e9c46a', 1.1, wave(11, 62, 28.5, 0.5, 3), swell(19)),
      ink('m-circle', 'ballpoint', '#ef6a55', 0.45, loop(20.5, 36.5, 15, 6.2)),
      ...sparkle('m-sp1', '#f6dc9a', 87, 9, 2.2), ...sparkle('m-sp2', '#f6dc9a', 80, 16, 1.3),
    ] },

  // 2. 카페 — 체크무늬 식탁보, 따뜻한 크림·브라운, 동글동글한 글씨
  { ...base, id: 'seed-cafe', authorId: 'latte.note', theme: 'cream', backgroundAssetId: img('cafe-bg'),
    title: '비 오는 날, 작은 오븐에서',
    body: '연남동 골목 끝 초록 문 카페 ‘작은 오븐’.\n빗소리 들으면서 바닐라 라떼 한 모금, 얼그레이 스콘 한 입.\n다음엔 바스크 치즈케이크를 먹어봐야지.',
    tags: ['카페', '디저트', '주말', '일상'],
    elements: [
      text('c1', 9, 12, 56, '오늘의 카페,\n‘작은 오븐’', { font: 'cute', color: '#6b4226', scale: 1.25, rotation: -2 }),
      sticker('c2', 63, 11, 31, 7, 'latte', '오늘의 주문\n바닐라 라떼 (얼음 적게) 5,800\n얼그레이 스콘 4,200\n\n사장님이 라떼 위에 하트를 두 번 그려주셨다.'),
      text('c3', 9, 34, 62, '바닐라 라떼  ★★★★★\n얼그레이 스콘 ★★★★☆\n창가 자리   ★★★★★', { font: 'gaegu', color: '#8a5a36', scale: 0.84 }),
      sticker('c4', 69, 41, 25, -9, 'cake'),
      text('c5', 9, 51, 56, 'OPEN 11:00 – 21:00\n연남동 골목 끝, 초록 문', { font: 'typewriter', color: '#a07c5a', scale: 0.6 }),
      text('c6', 9, 62, 82, '빗소리 들으면서 라떼 한 모금.\n오늘 하루는 이걸로\n충분히 달았다.', { font: 'yeon-sung', color: '#5e3a20', scale: 0.9, rotation: -1 }),
      text('c7', 46, 80, 50, '다음엔\n바스크 치즈케이크!', { font: 'pen', color: '#b5835a', scale: 0.95, rotation: 4 }),
    ],
    strokes: [
      ink('c-heart', 'fountain', '#d06c5a', 0.7, [[40, 85], [36.5, 81.5], [36, 79], [37.6, 77.8], [40, 79.6], [42.4, 77.8], [44, 79], [43.5, 81.5], [40, 85]], swell(9, 0.7, 1.2)),
      ...sparkle('c-sp1', '#c99a6e', 93, 36, 1.6), ...sparkle('c-sp2', '#c99a6e', 61, 9, 1.1),
    ] },

  // 3. 개인 고민 — 비 오는 회청색 하늘, 연필 낙서, 끝에는 따뜻한 주황 한 줄
  { ...base, id: 'seed-worry', authorId: 'grey.cloud', theme: 'white', backgroundAssetId: img('worry-bg'),
    title: '요즘 나, 잘 하고 있는 걸까',
    body: '나만 느린 것 같은 기분, 미뤄둔 일과 미뤄둔 연락.\n생각이 많아서 잠이 안 오는 밤이었다.\n그래도 오늘, 산책 20분은 했으니까. 그거면 충분하다고 적어둔다.',
    tags: ['고민', '마음', '기록', '밤'],
    elements: [
      text('w1', 9, 7, 82, '요즘 나,\n잘 하고 있는 걸까?', { font: 'gaegu', color: '#3d4a5c', scale: 1.22, rotation: -2 }),
      text('w2', 9, 24, 64, '머릿속을 맴도는 것들\n· 나만 느린 것 같은 기분\n· 미뤄둔 일, 미뤄둔 연락\n· 내일이 조금 무서운 밤', { font: 'poor-story', color: '#56616f', scale: 0.86 }),
      sticker('w3', 63, 43, 31, 6, 'cloud', '친구가 해준 말\n\n“남의 하이라이트랑\n네 비하인드를 비교하지 마.\n너는 네 속도로 가고 있어.”\n\n이 말을 오래 붙잡고 있고 싶어서 여기 붙여둔다.'),
      text('w4', 11, 47, 50, '생각이 많아서\n잠이 안 오는 밤.', { font: 'hi-melody', color: '#7a8698', scale: 0.92, rotation: -2 }),
      text('w5', 26, 66, 70, '그래도 오늘,\n산책 20분은 했잖아.\n그거면 충분해.', { font: 'single-day', color: '#c0765a', scale: 1.02, rotation: 2 }),
      text('w6', 11, 66, 14, '♡', { font: 'gaegu', color: '#e59a8c', scale: 1.7, rotation: -10 }),
      text('w7', 38, 89, 58, '11.26 — 비, 그리고 조금 갬', { font: 'typewriter', color: '#8e99a8', scale: 0.6 }),
    ],
    strokes: [
      ink('w-tangle', 'pencil', '#6e7a8c', 0.4, Array.from({ length: 90 }, (_, i) => { const a = i / 4.2; const r = 2.6 + Math.sin(i * 0.37) * 1.3; return [82 + Math.cos(a) * r * 1.3 + Math.sin(i * 0.11) * 1.6, 30 + Math.sin(a) * r] as Pt; })),
      ...arrow('w-a1', 'pencil', '#6e7a8c', 0.4, [83, 36], [86, 39], [80, 43]),
      ...arrow('w-a2', 'brush', '#e08b62', 0.9, [72, 61], [64, 64], [58, 66.5]),
    ] },

  // 4. 여행 — 항공우편 테두리, 바다·모래색, 우표와 사진, 점선 경로
  { ...base, id: 'seed-travel', authorId: 'paper.trip', theme: 'white', backgroundAssetId: img('travel-bg'),
    title: '파도 소리로 일어난 아침',
    body: '제주 둘째 날. 숙소 창문을 열자마자 바다가 있었다.\n해안도로 자전거, 귤밭 옆 카페, 그리고 노을.\n아무 계획 없는 오후가 제일 좋았다.',
    tags: ['여행', '바다', '제주', '기록'],
    elements: [
      text('t1', 10, 7, 66, '파도 소리에\n눈을 뜬 아침.', { font: 'single-day', color: '#1f5f7a', scale: 1.18, rotation: -2 }),
      sticker('t2', 71, 6, 21, 8, 'stamp', '여행 준비물 체크\n☑ 필름 카메라\n☑ 좋아하는 책 한 권\n☑ 바다에서 신을 슬리퍼\n☐ 계획 (일부러 안 챙김)'),
      { id: 't3', kind: 'photo', x: 9, y: 24, width: 44, rotation: -4, text: '협재, 오전 7시', assetId: img('sea-photo'), attachment: { kind: 'text', text: '숙소 창문을 열자마자 찍은 사진.\n아직 아무도 없는 바다는\n세상에서 제일 조용한 소리를 냈다.' } },
      text('t4', 59, 29, 38, 'DAY 2\n\n07:00 기상\n10:30 해안 자전거\n15:00 귤밭 카페\n19:20 노을 보기', { font: 'typewriter', color: '#2d4a57', scale: 0.62 }),
      text('t5', 60, 56, 36, 'SEOUL → JEJU', { font: 'typewriter', color: '#c8453d', scale: 0.62, rotation: -4 }),
      text('t6', 12, 76, 80, '아무 계획 없는 오후가\n제일 좋았다.', { font: 'gamja', color: '#355e6e', scale: 0.98, rotation: 1 }),
    ],
    strokes: [
      ...dashed('t-route', '#c8453d', curve([63, 61], [92, 63], [82, 71], 16)),
      ink('t-pin', 'ballpoint', '#c8453d', 0.5, loop(81, 71.6, 1.3, 1, 1.05)),
      ink('t-wave', 'fountain', '#3d8fb0', 0.7, wave(13, 70, 88, 0.8, 4), swell(25, 0.6, 1.2)),
    ] },

  // 5. 소설 — 바랜 줄노트, 세피아 잉크, 명조체 인용문과 만년필 메모
  { ...base, id: 'seed-novel', authorId: 'ink.and.page', theme: 'cream', backgroundAssetId: img('novel-bg'),
    title: '밑줄 긋고 싶은 문장들',
    body: '『겨울 정원의 편지』 완독. 286쪽.\n“기다림은 멈춰 서 있는 게 아니라, 아주 천천히 걸어가는 일이었다.”\n다 읽고 나서 창밖을 한참 봤다. 편지 쓰고 싶은 사람이 생겼다.',
    tags: ['책', '소설', '문장수집', '기록'],
    elements: [
      text('n1', 17, 5, 74, 'READING NOTE · 286p 완독', { font: 'typewriter', color: '#8a6a48', scale: 0.66 }),
      text('n2', 17, 10, 78, '읽는 내내,\n누군가의 오래된 편지를\n몰래 읽는 기분이었다.', { font: 'batang', color: '#3b2a1a', scale: 1.02, rotation: -1 }),
      sticker('n3', 63, 28, 29, 7, 'book', '『겨울 정원의 편지』 줄거리 메모\n\n시골 정원사 할머니에게 매주 도착하는 이름 없는 편지.\n답장을 쓰지 못한 채 계절이 바뀌고,\n마지막 장에서야 보낸 사람이 밝혀진다.\n\n— 3장과 9장은 꼭 다시 읽기.'),
      text('n4', 19, 31, 44, '“기다림은\n멈춰 서 있는 게\n아니라, 아주\n천천히 걸어가는\n일이었다.”', { font: 'myeongjo', color: '#5b3a1e', scale: 0.84 }),
      text('n5', 19, 53, 46, 'p.142, 3장 마지막 문단.\n여기서 울컥했다.', { font: 'pen', color: '#2e4a7d', scale: 0.92, rotation: -3 }),
      sticker('n6', 6, 67, 15, -16, 'leaf'),
      text('n7', 25, 67, 66, '다 읽고 나서\n창밖을 한참 봤다.\n편지 쓰고 싶은\n사람이 생겼다.', { font: 'gamja', color: '#6b4a2e', scale: 0.92 }),
      text('n8', 60, 88, 36, '★★★★★ 인생책', { font: 'typewriter', color: '#a8322d', scale: 0.62, rotation: -2 }),
    ],
    strokes: [
      ink('n-hl', 'highlighter', '#f1c84b', 3, [[16.2, 31], [16.4, 49]]),
      ink('n-bracket', 'fountain', '#2e4a7d', 0.65, [[15, 30.5], [13.6, 31], [13.4, 40], [12.4, 40.4], [13.4, 41], [13.6, 49.5], [15, 50]], [0.6, 0.9, 1.1, 1.2, 1.1, 0.9, 0.6]),
      ...arrow('n-arrow', 'fountain', '#2e4a7d', 0.6, [67, 57], [71, 51], [61, 47.5]),
    ] },

  // 6. 음악 — 새벽의 보라·분홍 그라데이션, 레트로 노을, 카세트테이프
  { ...base, id: 'seed-music', authorId: 'side.b.tape', theme: 'white', backgroundAssetId: img('music-bg'),
    title: '새벽 2시의 플레이리스트',
    body: '잠이 안 와서 만든 새벽 플레이리스트.\n창밖의 비, 막차의 온도, 잠 못 드는 우리, 새벽 세 시, 다시 봄.\n가사 한 줄이 오늘의 나를 대신 말해줄 때가 있다. 좋아하는 영화 OST도 한 곡 넣었다.',
    tags: ['음악', '플레이리스트', 'OST', '밤'],
    elements: [
      text('u1', 9, 6, 70, '새벽 2시의\n플레이리스트', { font: 'jua', color: '#ffd6e8', scale: 1.12 }),
      text('u2', 80, 7, 14, '♫', { font: 'jua', color: '#ff9ec4', scale: 1.5, rotation: 12 }),
      sticker('u3', 50, 21, 44, 5, 'cassette', 'SIDE B · 2AM MIX\n\n이 테이프에 담은 이유\n잠 못 드는 밤마다 같은 노래를 돌려 듣다가\n아예 순서까지 정해버렸다.\n\n마지막 곡이 끝날 즈음엔\n창밖이 조금씩 밝아온다.'),
      text('u4', 9, 21, 42, 'SIDE A\n01 창밖의 비\n02 막차의 온도\n03 잠 못 드는 우리\n\nSIDE B\n04 새벽 세 시 (OST)\n05 다시, 봄', { font: 'typewriter', color: '#f8e9ff', scale: 0.58 }),
      text('u5', 9, 43, 84, '이어폰 한쪽은\n너에게 빌려주고 싶은 밤', { font: 'east-sea', color: '#ffcf6e', scale: 0.9, rotation: -3 }),
      text('u6', 11, 57.5, 80, '가사 한 줄이\n오늘의 나를 대신 말해줄 때.', { font: 'hi-melody', color: '#fbe0ff', scale: 0.98 }),
      text('u7', 80, 50, 14, '♪', { font: 'jua', color: '#ffb3d1', scale: 1.4, rotation: -10 }),
    ],
    strokes: [
      ink('u-wave', 'brush', '#ff8fbf', 0.9, Array.from({ length: 49 }, (_, i) => [10 + i * 1.65, 88 + Math.sin(i * 1.3) * (0.6 + 2.6 * Math.sin(Math.PI * i / 48))] as Pt), swell(49, 0.6, 1.1)),
      ...sparkle('u-sp1', '#ffe08a', 72, 45, 1.4), ...sparkle('u-sp2', '#ffe08a', 93, 44, 1.1), ...sparkle('u-sp3', '#ffe08a', 88, 92, 1.3),
    ] },

  // 7. 공부 — 모눈 노트, 민트·초록 포인트, 반듯한 고딕 체크리스트와 진행 막대
  { ...base, id: 'seed-study', authorId: 'mint.planner', theme: 'mint', backgroundAssetId: img('study-bg'),
    title: '기말고사 D-14 플랜',
    body: '기말고사까지 2주. 통계 3단원 문제풀이, 영어 단어 Day 11–15 끝.\n전공 리포트 초안과 오답노트는 내일로.\n오늘의 집중 시간 4시간 30분. 졸릴 땐 10분만 엎드려 자기.',
    tags: ['공부', '시험', '계획', '기록'],
    elements: [
      text('d1', 10, 6, 58, '기말고사\n2주 플랜!', { font: 'jua', color: '#2f5d50', scale: 1.18 }),
      sticker('d2', 69, 5, 23, 6, 'calendar', '시험 일정\n12.08 (월) 통계학\n12.10 (수) 영어 II\n12.11 (목) 전공 리포트 마감\n\n끝나면 바로 영화 보러 가기!'),
      text('d3', 10, 25, 58, '■ 통계 3단원 문제풀이\n■ 영어 단어 Day 11–15\n□ 전공 리포트 초안\n□ 오답노트 정리\n□ 운동 30분 (중요)', { font: 'gothic', color: '#30302d', scale: 0.72 }),
      sticker('d4', 58, 45, 38, -12, 'pencil'),
      text('d5', 10, 52, 80, '오늘의 집중 시간  4h 30m', { font: 'single-day', color: '#3f7d6b', scale: 0.92 }),
      text('d6', 10, 70, 82, '졸릴 땐 10분만 엎드려 자기.\n미래의 내가 고마워할 거야!', { font: 'gaegu', color: '#d0603f', scale: 0.92, rotation: 2 }),
      text('d7', 10, 88, 70, 'study log · 11.25 (화)', { font: 'typewriter', color: '#6c8b80', scale: 0.6 }),
    ],
    strokes: [
      ink('d-bar', 'ballpoint', '#2f5d50', 0.4, [[10.5, 60], [88, 60.2], [88, 65], [10.4, 64.8], [10.5, 60]]),
      ink('d-fill', 'highlighter', '#9ccf6a', 3.4, [[11.5, 62.5], [60, 62.4]]),
      ink('d-check', 'brush', '#d0603f', 0.9, [[62, 61.5], [64, 64], [68, 58.5]], [0.6, 1.1, 0.5]),
      ink('d-star', 'ballpoint', '#f0a830', 0.5, [[70, 30.5], [71.2, 33.4], [74.2, 33.4], [71.8, 35.2], [72.8, 38], [70, 36.3], [67.2, 38], [68.2, 35.2], [65.8, 33.4], [68.8, 33.4], [70, 30.5]]),
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
