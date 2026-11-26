import type { AppData, LibrarySticker } from '../types';
export function stickerLibrary(data: AppData): LibrarySticker[] {
 if (data.stickers) return data.stickers;
 const defaults = ['✿','✳','♡','☾','★','✈','☁','❋'].map((text,i)=>({id:`default-${i}`,text}));
 const assets = [...new Set([...data.drafts,...data.published].flatMap(p=>p.elements.filter(e=>e.kind==='sticker'&&e.assetId).map(e=>e.assetId!)))];
 return [...defaults,...assets.map(assetId=>({id:assetId,assetId}))];
}
