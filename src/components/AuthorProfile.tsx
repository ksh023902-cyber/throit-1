import { useState } from 'react';
import { useStore } from '../lib/store';
import { useMedia } from '../lib/storage';
import type { DiaryPage } from '../types';
import { Modal } from './Modal';
import { PageCanvas } from './PageCanvas';
import { PageViewer } from './PageViewer';
export function AuthorAvatar({authorId}:{authorId:string}) {
 const {data}=useStore();
 const url=useMedia(authorId===data.profile.id?data.profile.photo:undefined);
 return <img className="author-photo" src={url||`${import.meta.env.BASE_URL}images/avatar-flower.png`} alt="작성자 프로필 사진"/>;
}
export function AuthorProfile({authorId,onClose}:{authorId:string;onClose:()=>void}) {
 const {data}=useStore();const [page,setPage]=useState<DiaryPage|null>(null);
 const own=authorId===data.profile.id;
 const handle=own?data.profile.handle:authorId;
 const pages=data.published.filter(p=>p.authorId===authorId&&!data.hiddenIds?.includes(p.id));
 return <Modal title={`@${handle} 프로필`} onClose={onClose} wide><div className="profile-header"><div className="profile-avatar"><AuthorAvatar authorId={authorId}/></div><h1>@{handle}</h1><span>올린 필렛 {pages.length}개</span></div><div className="page-grid">{pages.map(p=><button className="page-tile" key={p.id} onClick={()=>setPage(p)}><PageCanvas page={p} mini/><h3>{p.title}</h3></button>)}</div>{!pages.length&&<p>아직 올린 필렛이 없어요.</p>}{page&&<PageViewer page={page} onClose={()=>setPage(null)}/>}</Modal>;
}
