import { X } from 'lucide-react';
import { useMedia } from '../lib/storage';
import type { LibrarySticker } from '../types';
export function StickerLibraryItem({sticker,disabled,editing,onAdd,onRemove}:{sticker:LibrarySticker;disabled:boolean;editing:boolean;onAdd:()=>void;onRemove:()=>void}) {
 const image=useMedia(sticker.assetId);
 const name=sticker.text||'이미지';
 return <div className="sticker-library-item"><button className="sticker-library-add" disabled={disabled||editing} aria-label={`${name} 스티커 추가`} onClick={onAdd}>{sticker.assetId?<img src={image||undefined} alt="저장된 이미지 스티커"/>:sticker.text}</button>{editing&&<button className="sticker-library-remove" disabled={disabled} aria-label={`${name} 스티커 삭제`} onClick={onRemove}><X size={12}/></button>}</div>;
}
