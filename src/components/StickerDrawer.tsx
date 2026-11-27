import { useId, useRef, useState, type PointerEvent } from 'react';
import { Check, Trash2, Undo2 } from 'lucide-react';
import type { Stroke } from '../types';
import { isVariable, loadPen, strokeSize, widthFactor, type PenSettings } from '../lib/pens';
import { png, trimTransparent } from '../lib/sticker';
import { InkDefs, StrokeShape } from './PageCanvas';
import { Modal } from './Modal';
import { PenTray } from './PenTray';

/** 스티커 판은 정사각형이라 종이보다 작아요. 붙였을 때 종이 위 펜 굵기와 비슷해 보이도록 굵게 그려요. */
const PAD_SCALE = 3;
const OUTPUT = 640;

/** 정사각형 판에 그린 획을 투명 배경 PNG 스티커로 만들어요. */
export async function renderStickerPng(svg: SVGSVGElement): Promise<File> {
  const copy = svg.cloneNode(true) as SVGSVGElement;
  copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  copy.setAttribute('width', String(OUTPUT));
  copy.setAttribute('height', String(OUTPUT));
  copy.removeAttribute('class');
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(copy)], { type: 'image/svg+xml' }));
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(new Error('그림을 변환하지 못했어요.')); img.src = url; });
    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT; canvas.height = OUTPUT;
    canvas.getContext('2d')!.drawImage(img, 0, 0, OUTPUT, OUTPUT);
    const cropped = trimTransparent(canvas, 10);
    if (!cropped) throw new Error('먼저 스티커를 그려주세요.');
    return new File([await png(cropped)], 'drawn-sticker.png', { type: 'image/png' });
  } finally { URL.revokeObjectURL(url); }
}

export function StickerDrawer({ onCancel, onSave }: { onCancel: () => void; onSave: (file: File) => Promise<void> }) {
  const [settings, setSettings] = useState<PenSettings>(loadPen);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [live, setLive] = useState<[number, number][]>([]);
  const [widths, setWidths] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const last = useRef<{ x: number; y: number; t: number; w: number | null } | null>(null);
  const lastDraw = useRef(0);
  const svg = useRef<SVGSVGElement>(null);
  const grain = `sgrain${useId().replace(/:/g, '')}`;

  const point = (e: PointerEvent<HTMLDivElement>): [number, number] => {
    const b = e.currentTarget.getBoundingClientRect();
    return [Math.max(0, Math.min(100, (e.clientX - b.left) / b.width * 100)), Math.max(0, Math.min(100, (e.clientY - b.top) / b.height * 100))];
  };
  const pressureOf = (e: PointerEvent<HTMLDivElement>) => e.pointerType === 'pen' && e.pressure > 0 ? e.pressure : null;
  const down = (e: PointerEvent<HTMLDivElement>) => {
    if (saving) return;
    e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId);
    const p = point(e); const w = widthFactor(settings.pen, 0, pressureOf(e), null);
    last.current = { x: p[0], y: p[1], t: e.timeStamp, w }; setLive([p]); setWidths([w]); setError('');
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (!live.length) return;
    const p = point(e); const l = last.current; const dt = Math.max(1, e.timeStamp - (l?.t ?? e.timeStamp));
    const speed = l ? Math.hypot(p[0] - l.x, p[1] - l.y) / dt : 0;
    const w = widthFactor(settings.pen, speed, pressureOf(e), l?.w ?? null);
    last.current = { x: p[0], y: p[1], t: e.timeStamp, w }; setLive(ps => [...ps, p]); setWidths(ws => [...ws, w]);
  };
  const liveStroke = (): Stroke => {
    const single = live.length === 1;
    return { id: 'live', points: single ? [live[0], [live[0][0] + .1, live[0][1] + .1]] : live, color: settings.color, size: +(strokeSize(settings) * PAD_SCALE).toFixed(3), pen: settings.pen, ...(isVariable(settings.pen) ? { widths: (single ? [widths[0], widths[0]] : widths).map(w => +w.toFixed(2)) } : {}) };
  };
  const reset = () => { setLive([]); setWidths([]); last.current = null; };
  const up = () => { if (live.length) { setStrokes(s => [...s, { ...liveStroke(), id: crypto.randomUUID() }]); reset(); lastDraw.current = Date.now(); } };
  const save = async () => {
    if (!svg.current || !strokes.length) return;
    setSaving(true); setError('');
    try { await onSave(await renderStickerPng(svg.current)); }
    catch (err) { console.error('Drawn sticker failed', err); setError((err as Error).message || '스티커를 저장하지 못했어요.'); setSaving(false); }
  };
  // 판 밖에서 손을 떼도 그림이 닫히지 않도록, 방금 그린 직후의 바깥 클릭은 무시해요.
  const close = () => { if (!saving && Date.now() - lastDraw.current > 400) onCancel(); };

  return <Modal title="스티커 그리기" onClose={close}>
    <div className="sticker-pad" data-testid="sticker-pad" role="img" aria-label="스티커 그림판" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={reset}>
      <svg ref={svg} className="sticker-pad-ink" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <InkDefs grain={grain} />
        {strokes.map(s => <StrokeShape key={s.id} stroke={s} grain={grain} ratio={1} />)}
        {!!live.length && <StrokeShape stroke={liveStroke()} grain={grain} ratio={1} />}
      </svg>
      {!strokes.length && !live.length && <span className="sticker-pad-hint">여기에 그려보세요</span>}
    </div>
    <PenTray inline value={settings} onChange={setSettings} />
    {error && <div role="alert" className="sticker-error">{error}</div>}
    <div className="sticker-draw-actions">
      <button className="icon-btn bordered" aria-label="그림 되돌리기" title="되돌리기" disabled={!strokes.length || saving} onClick={() => setStrokes(s => s.slice(0, -1))}><Undo2 size={18} /></button>
      <button className="icon-btn bordered" aria-label="그림 모두 지우기" title="모두 지우기" disabled={!strokes.length || saving} onClick={() => setStrokes([])}><Trash2 size={18} /></button>
      <button className="primary" disabled={!strokes.length || saving} onClick={() => void save()}><Check size={18} />{saving ? '저장 중…' : '스티커로 저장'}</button>
    </div>
  </Modal>;
}
