import type { AppData, DiaryPage } from '../types';
export const uid = () => crypto.randomUUID();
export const normalize = (s: string) => s.normalize('NFKC').toLocaleLowerCase().replace(/#/g, '').trim();
export const tagsFrom = (s: string) => [...new Set(s.split(/[\s,#]+/).map(normalize).filter(Boolean))].slice(0, 8);
export function searchPages(pages: DiaryPage[], query: string) {
 const terms = normalize(query).split(/\s+/).filter(Boolean);
 if (!terms.length) return [];
 return pages.map(page => {
  const title = normalize(page.title), tags = page.tags.map(normalize), body = normalize(page.body + ' ' + page.elements.map(e => e.text || '').join(' '));
  let score = 0;
  for (const term of terms) { const hit = (title === term ? 20 : title.includes(term) ? 9 : 0) + (tags.includes(term) ? 12 : tags.some(t => t.includes(term)) ? 6 : 0) + (body.includes(term) ? 3 : 0); if (!hit) return { page, score: 0 }; score += hit; }
  return { page, score };
 }).filter(p => p.score > 0).sort((a,b) => b.score-a.score || (b.page.publishedAt || '').localeCompare(a.page.publishedAt || '')).map(p => p.page);
}
export function recommendPages(pages: DiaryPage[], savedIds: string[]) {
 const weights = new Map<string, number>();
 pages.filter(p => savedIds.includes(p.id)).forEach(p => p.tags.forEach(t => weights.set(normalize(t), (weights.get(normalize(t)) || 0) + 1)));
 const score = (p: DiaryPage) => p.tags.reduce((n,t) => n+(weights.get(normalize(t)) || 0), 0);
 return [...pages].sort((a,b) => Number(savedIds.includes(a.id))-Number(savedIds.includes(b.id)) || score(b)-score(a));
}
export function publishPage(data: AppData, page: DiaryPage): AppData {
 if (!page.title.trim()) throw new Error('필렛 제목을 적어주세요.');
 const snapshot = structuredClone({ ...page, publishedAt: new Date().toISOString() });
 return { ...data, drafts: data.drafts.map(p => p.id === page.id ? page : p), published: [snapshot, ...data.published.filter(p => p.id !== page.id)] };
}
export function newPage(diaryId: string, authorId: string): DiaryPage { return { id: uid(), diaryId, authorId, title: '', body: '', tags: [], theme: 'white', elements: [], strokes: [], createdAt: new Date().toISOString() }; }
