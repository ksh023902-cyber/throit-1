import { useMemo, useRef, useState } from 'react';
import { Bookmark, BookmarkCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../lib/store';
import { recommendPages } from '../lib/domain';
import type { DiaryPage } from '../types';
import { PageCanvas } from '../components/PageCanvas';
import { AuthorProfile, AuthorAvatar } from '../components/AuthorProfile';
import { PageViewer } from '../components/PageViewer';
export function Feed(){const {data,toggleSaved}=useStore();const [visitSaved]=useState(()=>data.savedIds);const pages=useMemo(()=>recommendPages(data.published.filter(p=>!data.hiddenIds?.includes(p.id)),visitSaved),[data.published,data.hiddenIds,visitSaved]);const [viewer,setViewer]=useState<DiaryPage|null>(null);const [author,setAuthor]=useState<string|null>(null);const list=useRef<HTMLDivElement>(null);
 const go=(i:number)=>{const n=Math.max(0,Math.min(pages.length-1,i));list.current?.children[n]?.scrollIntoView({behavior:'smooth',block:'start'});};
 return <section className="feed-screen">
 <div className="feed-scroll" ref={list} aria-label="추천 필렛 목록">{pages.map((p,i)=>{const saved=data.savedIds.includes(p.id);return <article className="feed-slide" key={p.id}><div className="feed-paper-wrap"><PageCanvas page={p} onOpen={()=>setViewer(p)}/></div><div className="feed-overlay"><button className="feed-author" onClick={()=>setAuthor(p.authorId)} aria-label={`${p.authorId===data.profile.id?data.profile.handle:p.authorId} 프로필 보기`}><AuthorAvatar authorId={p.authorId}/><strong>@{p.authorId===data.profile.id?data.profile.handle:p.authorId}</strong></button><button className={`save-button ${saved?'saved':''}`} aria-label={saved?'보관 취소':'마음에 닿았다면, 보관'} aria-pressed={saved} onClick={()=>toggleSaved(p.id)}>{saved?<BookmarkCheck size={23}/>:<Bookmark size={23}/>}</button></div><div className="feed-paging"><button className="icon-btn" disabled={i===0} aria-label="이전 필렛" onClick={()=>go(i-1)}><ChevronUp size={20}/></button><button className="icon-btn" disabled={i===pages.length-1} aria-label="다음 필렛" onClick={()=>go(i+1)}><ChevronDown size={20}/></button></div></article>;})}</div>{!pages.length&&<div className="empty-state"><h2>아직 올라온 필렛이 없어요.</h2></div>}{author&&<AuthorProfile authorId={author} onClose={()=>setAuthor(null)}/>}{viewer&&<PageViewer page={viewer} onClose={()=>setViewer(null)}/>}</section>;
}
