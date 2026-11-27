import type { AppData, DiaryPage, PageElement, PenKind, Stroke } from '../types';

/**
 * 피드에 처음 보이는 다른 사람들의 예시 필렛.
 * 손으로 꾸민 다이어리처럼 손글씨, 사진 인화, 손그림 스티커, 테이프, 겹침을 쓰되
 * 페이지마다 구도·소재·색을 따로 잡아 서로 다른 사람이 만든 것처럼 보이게 했어요:
 * 검은 종이 영화 기록, 쿠폰 카드가 있는 카페 기록, 걱정 유리병, 포토스트립 제주 여행,
 * 보라 잉크 필사, 겨자색 종이 위 레코드 플레이리스트, 24시간 원형 시간표.
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
/** 부드러운 곡선 (2차 베지어) */
const curve = (a: Pt, c: Pt, b: Pt, n = 14): Pt[] =>
  Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t; return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]; });
/** 물결선 */
const wave = (x1: number, x2: number, y: number, amp: number, bumps: number): Pt[] =>
  Array.from({ length: bumps * 6 + 1 }, (_, i) => [x1 + (x2 - x1) * i / (bumps * 6), y + Math.sin(i / 6 * Math.PI * 2) * amp]);
/** 작은 별 낙서 */
const starDoodle = (cx: number, cy: number, r: number): Pt[] =>
  Array.from({ length: 11 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5; const k = i % 2 ? 0.45 : 1; return [cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k * 0.75]; });

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

  // 2. 카페 — 분홍 종이에 사진 두 장, 곰돌이·딸기 스티커, 도장 7개 찍힌 쿠폰 카드
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
      text('c7', 9, 62, 50, '카페 ‘작은 오븐’', { font: 'cute', color: '#6b3f2a', scale: 1.02, rotation: -2 }),
      text('c8', 9, 70, 48, '비 오는 날엔 역시\n바닐라 라떼.\n딸기 케이크도\n최고였어!', { font: 'pen', color: '#6b3f2a', scale: 0.82 }),
      sticker('c9', 56, 71, 38, 4, 'stamp-card', '쿠폰 도장 7 / 10\n\n세 번만 더 오면 라떼 한 잔이 무료!\n다음엔 바스크 치즈케이크를 먹어봐야지.'),
      text('c10', 60, 92, 36, '세 번만 더!', { font: 'pen', color: '#c86b84', scale: 0.78, rotation: 3 }),
    ],
    strokes: [
      ink('c-h', 'ballpoint', '#e8798f', 0.5, [[93, 26], [90.5, 23.6], [90.6, 22], [92, 21.6], [93, 22.8], [94, 21.6], [95.4, 22], [95.5, 23.6], [93, 26]]),
    ] },
  // 3. 개인 고민 — 연한 푸른 줄종이. 찢은 종이에 걱정을 적어 손그림 유리병에 넣는 구성, 회청색 연필 톤
  { ...base, id: 'seed-worry', authorId: 'grey.cloud', theme: 'white', backgroundAssetId: img('paper-blue'),
    title: '요즘 나, 잘 하고 있는 걸까',
    body: '나만 느린 것 같은 기분, 미뤄둔 일과 미뤄둔 연락.\n생각이 많아서 잠이 안 오는 밤이었다.\n그래도 오늘, 산책 20분은 했으니까. 그거면 충분하다고 적어둔다.',
    tags: ['고민', '마음', '기록', '밤'],
    elements: [
      text('w1', 10, 6, 82, '걱정은 유리병에\n넣어두기로 했다', { font: 'batang', color: '#3d4a5c', scale: 0.95 }),
      sticker('w-s0', 6, 20, 48, -4, 'paper-strip'),
      text('w-t0', 10, 21.6, 42, '나만 느린 것 같은 기분', { font: 'gamja', color: '#55606e', scale: 0.8, rotation: -4 }),
      sticker('w-s1', 6, 31, 48, 3, 'paper-strip'),
      text('w-t1', 10, 32.6, 42, '미뤄둔 연락', { font: 'gamja', color: '#55606e', scale: 0.8, rotation: 3 }),
      sticker('w-s2', 6, 42, 48, -2, 'paper-strip'),
      text('w-t2', 10, 43.6, 42, '이력서 한 줄', { font: 'gamja', color: '#55606e', scale: 0.8, rotation: -2 }),
      sticker('w-s3', 6, 53, 48, 4, 'paper-strip'),
      text('w-t3', 10, 54.6, 42, '내일이 조금 무서운 밤', { font: 'gamja', color: '#55606e', scale: 0.8, rotation: 4 }),
      sticker('w-jar', 58, 21, 34, 4, 'worry-jar', '친구가 해준 말\n\n“남의 하이라이트랑\n네 비하인드를 비교하지 마.\n너는 네 속도로 가고 있어.”'),
      text('w2', 10, 68, 82, '병뚜껑을 꼭 닫고 나니\n조금 가벼워졌다.\n오늘은 산책 20분. 그걸로 충분해.', { font: 'hi-melody', color: '#4f6b8a', scale: 0.9 }),
      text('w3', 10, 90, 60, '11.26 비 온 뒤', { font: 'typewriter', color: '#8e99a8', scale: 0.5 }),
    ],
    strokes: [
      ink('w-a1', 'pencil', '#6e7a8c', 0.4, curve([52, 25], [60, 22], [63, 28], 10)),
      ink('w-a1h', 'pencil', '#6e7a8c', 0.4, [[60.5, 26.6], [63, 28], [63.4, 25.4]]),
      ink('w-a2', 'pencil', '#6e7a8c', 0.4, curve([52, 58], [58, 62], [63, 56], 10)),
      ink('w-a2h', 'pencil', '#6e7a8c', 0.4, [[60.6, 56.4], [63, 56], [62.8, 58.6]]),
    ] },
  // 4. 여행 — 모래빛 종이에 세로 포토스트립, 원형 고무도장, 배표, 손그림 귤, 청록 점선 경로
  { ...base, id: 'seed-travel', authorId: 'paper.trip', theme: 'white', backgroundAssetId: img('paper-sand'),
    title: '파도 소리로 일어난 아침',
    body: '제주 둘째 날. 숙소 창문을 열자마자 바다가 있었다.\n해안도로 자전거, 귤밭 옆 카페, 그리고 노을.\n아무 계획 없는 오후가 제일 좋았다.',
    tags: ['여행', '바다', '제주', '기록'],
    elements: [
      sticker('t1', 6, 4, 26, -4, 'photo-strip.jpg', '아침 바다, 귤밭, 노을.\n하루를 세 장으로 남겼다.\n\n숙소 창문을 열자마자 바다가 있었다.'),
      sticker('t2', 10, 2, 18, 8, 'tape-clear'),
      text('t3', 38, 6, 58, '귤 냄새 나는\n바닷바람', { font: 'yeon-sung', color: '#2b6f8e', scale: 1.25 }),
      sticker('t4', 72, 19, 22, -12, 'place-stamp'),
      text('t5', 38, 37, 58, '목포에서 밤배를 타고\n아침에 도착했다.\n해안도로를 자전거로\n달리다가 귤밭 앞에서\n한참 멈춰 섰다.\n노을은 생각보다\n빨리 졌다.', { font: 'poor-story', color: '#5a4632', scale: 0.78 }),
      sticker('t6', 40, 68, 52, 4, 'ferry-ticket', '여행 준비물 체크\n☑ 필름 카메라\n☑ 좋아하는 책 한 권\n☑ 바다에서 신을 슬리퍼\n☐ 계획 (일부러 안 챙김)'),
      sticker('t7', 7, 70, 15, -10, 'tangerine'),
      sticker('t8', 22, 77, 10, 18, 'tangerine'),
      text('t9', 8, 90, 86, '다음엔 귤 따기 체험도 꼭!', { font: 'pen', color: '#2b6f8e', scale: 0.86, rotation: -1 }),
    ],
    strokes: [ink('t-r0', 'ballpoint', '#2b6f8e', 0.5, [[20.0, 66.00], [21.6, 66.23]]), ink('t-r1', 'ballpoint', '#2b6f8e', 0.5, [[23.0, 66.12], [24.6, 66.47]]), ink('t-r2', 'ballpoint', '#2b6f8e', 0.5, [[26.0, 66.48], [27.6, 66.95]]), ink('t-r3', 'ballpoint', '#2b6f8e', 0.5, [[29.0, 67.08], [30.6, 67.67]]), ink('t-r4', 'ballpoint', '#2b6f8e', 0.5, [[32.0, 67.92], [33.6, 68.63]]), ink('t-r5', 'ballpoint', '#2b6f8e', 0.5, [[35.0, 69.00], [36.6, 69.83]]), ] },
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

  // 6. 음악 — 겨자색 종이에 반쯤 꺼낸 레코드판, 굵은 붓글씨 제목, 코발트 펜 가사, 물결 낙서
  { ...base, id: 'seed-music', authorId: 'side.b.tape', theme: 'white', backgroundAssetId: img('paper-mustard'),
    title: '새벽 2시의 플레이리스트',
    body: '잠이 안 와서 만든 새벽 플레이리스트.\n창밖의 비, 막차의 온도, 잠 못 드는 우리, 새벽 세 시, 다시 봄.\n가사 한 줄이 오늘의 나를 대신 말해줄 때가 있다. 좋아하는 영화 OST도 한 곡 넣었다.',
    tags: ['음악', '플레이리스트', 'OST', '밤'],
    elements: [
      sticker('u1', 30, 4, 66, 6, 'record-sleeve', '이 판에 담은 이유\n\n잠 못 드는 밤마다 같은 노래를 돌려 듣다가\n아예 순서까지 정해버렸다.\n\n마지막 곡이 끝날 즈음엔\n창밖이 조금씩 밝아온다.'),
      text('u2', 6, 44, 90, '새벽 2시의\n플레이리스트', { font: 'brush', color: '#1b1b1b', scale: 1.4 }),
      text('u3', 8, 62, 50, '01 창밖의 비\n02 막차의 온도\n03 잠 못 드는 우리\n04 새벽 세 시 (OST)\n05 다시, 봄', { font: 'single-day', color: '#1b1b1b', scale: 0.78 }),
      text('u4', 57, 64, 40, '“이어폰 한쪽은\n너에게 빌려줄게”', { font: 'pen', color: '#2546a8', scale: 1, rotation: -4 }),
      text('u5', 8, 89, 86, '가사 한 줄이 나를 대신 말해줄 때.', { font: 'pen', color: '#1b1b1b', scale: 0.78 }),
    ],
    strokes: [
      ink('u-wave', 'ballpoint', '#1b1b1b', 0.5, wave(8, 92, 85, 1, 7)),
    ] },
  // 7. 공부 — 크림 종이 위 손그림 24시간 원형 시간표, 색 인덱스 탭, 커피 낙서, 시간대별 메모
  { ...base, id: 'seed-study', authorId: 'mint.planner', theme: 'mint', backgroundAssetId: img('paper-cream'),
    title: '기말고사 D-14 플랜',
    body: '기말고사까지 2주. 통계 3단원 문제풀이, 영어 단어 Day 11–15 끝.\n전공 리포트 초안과 오답노트는 내일로.\n오늘의 집중 시간 4시간 30분. 졸릴 땐 10분만 엎드려 자기.',
    tags: ['공부', '시험', '계획', '기록'],
    elements: [
      sticker('d1', 92, 20, 8, 0, 'index-tabs'),
      text('d2', 8, 5, 80, '오늘의 24시간', { font: 'jua', color: '#3d3a35', scale: 1.15 }),
      text('d3', 8, 12.5, 80, '기말까지 D-14 · 11.25 화', { font: 'pen', color: '#8a8378', scale: 0.75 }),
      sticker('d4', 6, 19, 58, 0, 'pie-clock', '시험 일정\n12.08 (월) 통계학\n12.10 (수) 영어 II\n12.11 (목) 전공 리포트 마감\n\n끝나면 바로 영화 보러 가기!'),
      text('d-k0', 68, 23, 8, '●', { font: 'gothic', color: '#9fd3b3', scale: 0.7 }),
      text('d-l0', 73, 22.6, 22, '공부 10h', { font: 'pen', color: '#3d3a35', scale: 0.72 }),
      text('d-k1', 68, 29, 8, '●', { font: 'gothic', color: '#f6d38b', scale: 0.7 }),
      text('d-l1', 73, 28.6, 22, '밥·간식', { font: 'pen', color: '#3d3a35', scale: 0.72 }),
      text('d-k2', 68, 35, 8, '●', { font: 'gothic', color: '#f4a99a', scale: 0.7 }),
      text('d-l2', 73, 34.6, 22, '운동 1h', { font: 'pen', color: '#3d3a35', scale: 0.72 }),
      text('d-k3', 68, 41, 8, '●', { font: 'gothic', color: '#e3d6f2', scale: 0.7 }),
      text('d-l3', 73, 40.6, 22, '쉬는 시간', { font: 'pen', color: '#3d3a35', scale: 0.72 }),
      text('d-k4', 68, 47, 8, '●', { font: 'gothic', color: '#c9d6ea', scale: 0.7 }),
      text('d-l4', 73, 46.6, 22, '잠 7h', { font: 'pen', color: '#3d3a35', scale: 0.72 }),
      sticker('d5', 72, 54, 16, 8, 'coffee-doodle'),
      text('d6', 8, 66, 86, '08–12 통계 3단원 끝!\n13–17 영어 단어 Day 11–15\n17시 운동은… 내일의 나에게\n19–21 오답노트 반만', { font: 'pen', color: '#3d3a35', scale: 0.74 }),
      text('d7', 8, 87, 86, '집중 4h 30m. 졸리면 10분만 엎드려 자기!', { font: 'gaegu', color: '#e07a5f', scale: 0.74 }),
    ],
    strokes: [
      ink('d-ul', 'highlighter', '#f6d38b', 3, [[8, 10.2], [52, 10]]),
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
