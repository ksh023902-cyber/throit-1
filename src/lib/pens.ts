import type { PenKind, Stroke } from '../types';

export type PenSize = 'fine' | 'medium' | 'bold';
export type PenSettings = { pen: PenKind; color: string; size: PenSize };

/** 펜마다 기본 굵기(종이 폭 기준 %)와 성질. */
export const pens: { kind: PenKind; label: string; base: number; opacity: number; hint: string }[] = [
  { kind: 'ballpoint', label: '볼펜', base: 0.5, opacity: 1, hint: '굵기가 일정한 펜' },
  { kind: 'fountain', label: '만년필', base: 0.7, opacity: 1, hint: '천천히 그으면 굵고, 빨리 그으면 가늘어져요' },
  { kind: 'brush', label: '붓펜', base: 1.3, opacity: 1, hint: '끝이 뾰족하게 빠지는 붓 느낌' },
  { kind: 'pencil', label: '연필', base: 0.45, opacity: 0.8, hint: '얇고 반투명해서 겹치면 진해져요' },
  { kind: 'highlighter', label: '형광펜', base: 3.2, opacity: 0.32, hint: '투명하게 글씨 위에 칠할 수 있어요' },
];

export const penSizes: { size: PenSize; label: string; scale: number }[] = [
  { size: 'fine', label: '가늘게', scale: 0.6 },
  { size: 'medium', label: '보통', scale: 1 },
  { size: 'bold', label: '굵게', scale: 1.8 },
];

/** 종이 색과 잘 어울리도록 고른 기본 팔레트. */
export const palette: { color: string; label: string }[] = [
  { color: '#292722', label: '먹색' },
  { color: '#7a776e', label: '회색' },
  { color: '#2e4a7d', label: '남색' },
  { color: '#5a8ec4', label: '하늘색' },
  { color: '#4c7a55', label: '초록' },
  { color: '#c9a227', label: '겨자색' },
  { color: '#d9822b', label: '주황' },
  { color: '#c8453d', label: '빨강' },
  { color: '#d98aa6', label: '분홍' },
  { color: '#7e5aa6', label: '보라' },
];

export const defaultPen: PenSettings = { pen: 'ballpoint', color: palette[0].color, size: 'medium' };
const KEY = 'throit-pen';

export function loadPen(): PenSettings {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (raw && pens.some(p => p.kind === raw.pen) && penSizes.some(s => s.size === raw.size) && /^#[0-9a-f]{6}$/i.test(raw.color)) return raw;
  } catch { /* 저장소를 못 쓰면 기본 펜 */ }
  return defaultPen;
}
export function savePen(settings: PenSettings) {
  try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch { /* 무시 */ }
}

export const penInfo = (kind: PenKind) => pens.find(p => p.kind === kind)!;
export const strokeSize = (s: PenSettings) => +(penInfo(s.pen).base * penSizes.find(x => x.size === s.size)!.scale).toFixed(3);
export const penOpacity = (kind?: PenKind) => (kind ? penInfo(kind).opacity : 1);
/** 굵기가 변하는 펜. 선 대신 윤곽선을 채워서 그려요. */
export const isVariable = (kind?: PenKind) => kind === 'fountain' || kind === 'brush';

/**
 * 한 점의 굵기 배율(0~1.5)을 정해요.
 * 스타일러스의 누르는 힘이 있으면 그 값을, 없으면(손가락·마우스) 그리는 속도를 써요.
 * speed는 종이 폭 %/ms 단위.
 */
export function widthFactor(kind: PenKind, speed: number, pressure: number | null, prev: number | null) {
  let target: number;
  if (pressure !== null) target = kind === 'brush' ? 0.2 + pressure * 1.5 : 0.45 + pressure * 0.9;
  else {
    const range = kind === 'brush' ? [0.25, 1.5] : [0.4, 1.25];
    const k = kind === 'brush' ? 9 : 6;
    target = Math.max(range[0], Math.min(range[1], range[1] - speed * k));
  }
  // 갑자기 굵기가 튀지 않도록 부드럽게 따라가요
  return prev === null ? target : prev + (target - prev) * 0.35;
}

// 종이는 가로:세로 = 3:4라서, 실제 모양대로 계산하려고 세로를 4/3배로 바꿨다가 되돌려요.
const RATIO = 4 / 3;

/** 굵기가 변하는 선의 윤곽을 SVG path로 만들어요. */
/** ratio는 그리는 곳의 세로÷가로 (종이는 4/3, 정사각형 스티커 판은 1). */
export function variablePath(stroke: Stroke, ratio = RATIO) {
  const pts = stroke.points.map(([x, y]) => [x, y * ratio] as [number, number]);
  const n = pts.length;
  const w = (i: number) => {
    let f = stroke.widths?.[i] ?? 1;
    if (stroke.pen === 'brush') {
      // 붓펜은 시작과 끝이 뾰족하게
      const taper = Math.min(4, Math.floor(n / 3));
      if (taper > 0) {
        if (i < taper) f *= 0.3 + 0.7 * (i / taper);
        if (n - 1 - i < taper) f *= 0.15 + 0.85 * ((n - 1 - i) / taper);
      }
    }
    return (stroke.size * f) / 2;
  };
  const left: [number, number][] = [], right: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    dx /= len; dy /= len;
    const r = w(i);
    left.push([pts[i][0] - dy * r, pts[i][1] + dx * r]);
    right.push([pts[i][0] + dy * r, pts[i][1] - dx * r]);
  }
  const f = (p: [number, number]) => `${+p[0].toFixed(2)},${+(p[1] / ratio).toFixed(2)}`;
  const smooth = (line: [number, number][]) => line.slice(1).map((p, i) => {
    const prev = line[i];
    return `Q${f(prev)} ${f([(prev[0] + p[0]) / 2, (prev[1] + p[1]) / 2])}`;
  }).join(' ') + ` L${f(line[line.length - 1])}`;
  const back = right.reverse();
  return `M${f(left[0])} ${smooth(left)} L${f(back[0])} ${smooth(back)} Z`;
}
