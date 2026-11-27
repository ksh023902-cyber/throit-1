import { useEffect, useState } from 'react';
import type { AppData } from '../types';
let dbPromise: Promise<IDBDatabase>;
export function db() { return dbPromise ||= new Promise((resolve,reject) => { const r = indexedDB.open('throit-v1',1); r.onupgradeneeded = () => { r.result.createObjectStore('state'); r.result.createObjectStore('media'); }; r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); }); }
export async function readState(): Promise<AppData | undefined> { const database=await db(); return new Promise((resolve,reject)=> { const r=database.transaction('state').objectStore('state').get('app'); r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error); }); }
export async function writeState(data:AppData) { const database=await db();return new Promise<void>((resolve,reject)=>{const tx=database.transaction('state','readwrite');tx.objectStore('state').put(data,'app');tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);}); }
export async function storeMedia(file:File) { if(!/^(image|video)\//.test(file.type)) throw new Error('사진 또는 영상 파일을 선택해주세요.');if(file.size>20*1024*1024)throw new Error('20MB 이하의 파일을 선택해주세요.');await ensureSpace(file.size);const id=crypto.randomUUID(),database=await db();await new Promise<void>((resolve,reject)=>{const tx=database.transaction('media','readwrite');tx.objectStore('media').put(file,id);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});return id; }
export function useMedia(id?:string) {const [url,setUrl]=useState(id?.startsWith('/')?id:'');useEffect(()=>{let dead=false,objectURL='';setUrl(id?.startsWith('/')?id:'');if(id&&!id.startsWith('/')){void db().then(database=>new Promise<Blob|undefined>((resolve,reject)=>{const r=database.transaction('media').objectStore('media').get(id);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);})).then(blob=>{if(blob&&!dead){objectURL=URL.createObjectURL(blob);setUrl(objectURL);}}).catch(()=>setUrl(''));}return()=>{dead=true;if(objectURL)URL.revokeObjectURL(objectURL);};},[id]);return url;}

/** 브라우저 저장 공간이 모자라면 미리 알려줘요. 추정치를 못 얻으면 그냥 저장해 봐요. */
export async function ensureSpace(bytes:number){
 try{const est=await navigator.storage?.estimate?.();if(est?.quota&&est.usage!==undefined&&est.usage+bytes*1.2>est.quota)throw new Error('저장 공간이 부족해요. 오래된 사진이나 영상을 지운 뒤 다시 시도해주세요.');}
 catch(err){if((err as Error).message.startsWith('저장 공간'))throw err;}
 try{void navigator.storage?.persist?.();}catch{/* 무시 */}
}
/** 스티커에 넣을 큰 사진은 긴 변 1600px로 줄여서 저장 공간을 아껴요. GIF·영상은 그대로 둬요. */
export async function shrinkPhoto(file:File,max=1600):Promise<File>{
 if(!file.type.startsWith('image/')||file.type==='image/gif')return file;
 let bitmap:ImageBitmap;try{bitmap=await createImageBitmap(file);}catch{throw new Error('읽을 수 없는 이미지예요. 다른 사진을 선택해주세요.');}
 const scale=Math.min(1,max/Math.max(bitmap.width,bitmap.height));
 if(scale===1&&file.size<=1.5*1024*1024){bitmap.close();return file;}
 const c=document.createElement('canvas');c.width=Math.max(1,Math.round(bitmap.width*scale));c.height=Math.max(1,Math.round(bitmap.height*scale));
 const ctx=c.getContext('2d')!;const keepAlpha=file.type==='image/png'||file.type==='image/webp';if(!keepAlpha){ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);}ctx.drawImage(bitmap,0,0,c.width,c.height);bitmap.close();
 const type=keepAlpha?'image/webp':'image/jpeg';
 const blob=await new Promise<Blob|null>(r=>c.toBlob(r,type,.85));
 if(!blob||blob.size>=file.size)return file;
 return new File([blob],file.name.replace(/\.[^.]+$/,'')+(type==='image/webp'?'.webp':'.jpg'),{type});
}
