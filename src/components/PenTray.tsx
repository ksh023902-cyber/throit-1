import { Brush, Highlighter, Pen, PenTool, Pencil, Plus } from 'lucide-react';
import type { PenKind } from '../types';
import { palette, penSizes, pens, type PenSettings } from '../lib/pens';

const icons: Record<PenKind, typeof Pen> = { ballpoint: Pen, fountain: PenTool, brush: Brush, pencil: Pencil, highlighter: Highlighter };

/** 펜을 고르면 아래 도구 막대 위에 나타나는 펜·색·굵기 선반. */
export function PenTray({ value, onChange }: { value: PenSettings; onChange: (next: PenSettings) => void }) {
  const set = (changes: Partial<PenSettings>) => onChange({ ...value, ...changes });
  const custom = !palette.some(p => p.color === value.color);
  return <div className="pen-tray" role="group" aria-label="펜 설정">
    <div className="pen-row" role="radiogroup" aria-label="펜 종류">
      {pens.map(p => { const Icon = icons[p.kind]; return <button key={p.kind} role="radio" aria-checked={value.pen === p.kind} aria-label={p.label} title={`${p.label}: ${p.hint}`} className={value.pen === p.kind ? 'active' : ''} onClick={() => set({ pen: p.kind })}><Icon size={20} /></button>; })}
    </div>
    <div className="pen-row pen-colors" role="radiogroup" aria-label="펜 색상">
      {palette.map(c => <button key={c.color} role="radio" aria-checked={value.color === c.color} aria-label={c.label} className={`pen-swatch ${value.color === c.color ? 'active' : ''}`} style={{ background: c.color }} onClick={() => set({ color: c.color })} />)}
      <label className={`pen-swatch pen-custom ${custom ? 'active' : ''}`} style={custom ? { background: value.color } : undefined} title="색 직접 고르기">
        {!custom && <Plus size={14} />}
        <input type="color" aria-label="색 직접 고르기" value={value.color} onChange={e => set({ color: e.target.value })} />
      </label>
    </div>
    <div className="pen-row pen-sizes" role="radiogroup" aria-label="펜 굵기">
      {penSizes.map(s => <button key={s.size} role="radio" aria-checked={value.size === s.size} aria-label={s.label} className={value.size === s.size ? 'active' : ''} onClick={() => set({ size: s.size })}><i style={{ width: 2 + s.scale * 7, height: 2 + s.scale * 7, background: value.color, opacity: value.pen === 'highlighter' ? .45 : 1 }} /></button>)}
    </div>
  </div>;
}
