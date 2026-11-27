import type { CSSProperties } from 'react';

export type FontGroup = '손글씨' | '붓·마커' | '반듯한 글씨';
export type TextFont = { id: string; label: string; family: string; fallback: string; group: FontGroup; scale: number };

/**
 * 글쓰기에서 고를 수 있는 글꼴. 굿노트처럼 손글씨·마커·고딕·명조·타자기 계열을 고루 담았어요.
 * 모두 Google Fonts에서 무료(OFL)로 쓸 수 있는 한글 글꼴이에요.
 * scale은 글꼴마다 다른 글자 크기를 기본(나눔손글씨 펜)과 비슷하게 맞추는 값이에요.
 */
export const textFonts: TextFont[] = [
  { id: 'pen', label: '나눔손글씨 펜', family: 'Nanum Pen Script', fallback: 'cursive', group: '손글씨', scale: 1 },
  { id: 'gaegu', label: '개구', family: 'Gaegu', fallback: 'cursive', group: '손글씨', scale: 0.8 },
  { id: 'hi-melody', label: '하이멜로디', family: 'Hi Melody', fallback: 'cursive', group: '손글씨', scale: 0.82 },
  { id: 'gamja', label: '감자꽃', family: 'Gamja Flower', fallback: 'cursive', group: '손글씨', scale: 0.82 },
  { id: 'poor-story', label: '푸어스토리', family: 'Poor Story', fallback: 'cursive', group: '손글씨', scale: 0.85 },
  { id: 'single-day', label: '싱글데이', family: 'Single Day', fallback: 'cursive', group: '손글씨', scale: 0.83 },
  { id: 'cute', label: '큐트', family: 'Cute Font', fallback: 'cursive', group: '손글씨', scale: 0.96 },
  { id: 'yeon-sung', label: '연성', family: 'Yeon Sung', fallback: 'cursive', group: '손글씨', scale: 0.85 },
  { id: 'brush', label: '나눔손글씨 붓', family: 'Nanum Brush Script', fallback: 'cursive', group: '붓·마커', scale: 0.96 },
  { id: 'east-sea', label: '동해독도', family: 'East Sea Dokdo', fallback: 'cursive', group: '붓·마커', scale: 1.12 },
  { id: 'jua', label: '주아', family: 'Jua', fallback: 'sans-serif', group: '붓·마커', scale: 0.85 },
  { id: 'gothic', label: '고딕', family: 'Noto Sans KR', fallback: 'sans-serif', group: '반듯한 글씨', scale: 0.78 },
  { id: 'dodum', label: '고운돋움', family: 'Gowun Dodum', fallback: 'sans-serif', group: '반듯한 글씨', scale: 0.79 },
  { id: 'myeongjo', label: '명조', family: 'Noto Serif KR', fallback: 'serif', group: '반듯한 글씨', scale: 0.74 },
  { id: 'batang', label: '고운바탕', family: 'Gowun Batang', fallback: 'serif', group: '반듯한 글씨', scale: 0.77 },
  { id: 'typewriter', label: '타자기', family: 'Nanum Gothic Coding', fallback: 'monospace', group: '반듯한 글씨', scale: 0.75 },
];
export const fontGroups: FontGroup[] = ['손글씨', '붓·마커', '반듯한 글씨'];
export const defaultFont = textFonts[0];

/** 모르는 id나 예전 글(글꼴 없음)은 기본 손글씨로 보여요. */
export function fontOf(id?: string): TextFont {
  return textFonts.find(f => f.id === id) ?? defaultFont;
}
export function fontStack(font: TextFont): string {
  return `'${font.family}','Nanum Pen Script',${font.fallback}`;
}
/** 글 조각에 붙이는 CSS 변수(글꼴과 크기 보정). */
export function fontVars(id?: string): CSSProperties {
  const font = fontOf(id);
  return { '--font': fontStack(font), '--font-scale': font.scale } as CSSProperties;
}
/** 모든 글꼴을 불러오는 Google Fonts 주소. 한글 글꼴은 쓰인 글자 묶음만 내려받아요. */
export function googleFontsUrl(): string {
  const families = textFonts.map(f => `family=${f.family.replace(/ /g, '+')}${f.id === 'myeongjo' ? ':wght@400;500;600' : ''}`);
  return `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`;
}

const KEY = 'throit-text-font';
export function loadTextFont(): string {
  try { return fontOf(localStorage.getItem(KEY) ?? undefined).id; } catch { return defaultFont.id; }
}
export function saveTextFont(id: string) {
  try { localStorage.setItem(KEY, id); } catch { /* 저장이 막혀도 글쓰기는 계속돼요 */ }
}
