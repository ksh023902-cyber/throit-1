import { Bookmark, BookmarkCheck } from 'lucide-react';
import type { DiaryPage } from '../types';
import { useStore } from '../lib/store';
import { Modal } from './Modal';
import { PageCanvas } from './PageCanvas';
export function PageViewer({page,onClose}:{page:DiaryPage;onClose:()=>void}){const {data,toggleSaved}=useStore();const saved=data.savedIds.includes(page.id);return <Modal title={page.title||'제목 없는 필렛'} onClose={onClose} wide><div className="viewer-meta"><span>@{page.authorId===data.profile.id?data.profile.handle:page.authorId}</span>{page.publishedAt&&<button className={`pill ${saved?'filled':''}`} onClick={()=>toggleSaved(page.id)}>{saved?<BookmarkCheck size={17}/>:<Bookmark size={17}/>} {saved?'보관됨':'보관하기'}</button>}</div><PageCanvas page={page}/></Modal>;}
