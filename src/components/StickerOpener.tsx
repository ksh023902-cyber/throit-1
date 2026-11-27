import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Attachment } from '../types';
import { useMedia } from '../lib/storage';
/** 보는 사람이 스티커를 누르면 넣어둔 자료만 화면 가운데에 띄워요. 제목·안내 문구 없이, 바깥을 누르거나 Esc로 닫아요. */
export function StickerOpener({attachment,onClose}:{attachment:Attachment;onClose:()=>void}){
 const url=useMedia(attachment.assetId);const ref=useRef<HTMLDivElement>(null);const closeRef=useRef(onClose);closeRef.current=onClose;
 useEffect(()=>{const old=document.activeElement as HTMLElement|null;const el=ref.current;el?.focus();const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeRef.current();}};el?.addEventListener('keydown',key);return()=>{el?.removeEventListener('keydown',key);old?.focus?.();};},[]);
 const content=attachment.kind==='text'?<div className="story-text">{attachment.text}</div>:!url?null:attachment.kind==='photo'?<img className="story-media" src={url} alt="스티커에 연결된 사진"/>:<video className="story-media" src={url} controls autoPlay playsInline/>;
 return createPortal(<div ref={ref} className="story-shade" role="dialog" aria-modal="true" aria-label="스티커 속 이야기" tabIndex={-1} onClick={e=>{e.stopPropagation();if(e.target===e.currentTarget)onClose();}}>
  {content}
  <button type="button" className="sr-only" aria-label="닫기" onClick={onClose}/>
 </div>,document.body);
}
