import { useState } from 'react';
import { BookOpen, Home, Plus, Search as SearchIcon, UserRound } from 'lucide-react';
import type { DiaryPage } from './types';
import { StoreProvider, useStore } from './lib/store';
import { Feed } from './screens/Feed';
import { Search } from './screens/Search';
import { Bookshelf } from './screens/Bookshelf';
import { Editor } from './screens/Editor';
import { Profile } from './screens/Profile';
function AppShell(){const {ready,error,retry,notice}=useStore();const [screen,setScreen]=useState<'feed'|'search'|'bookshelf'|'profile'|'editor'>('feed'),[editing,setEditing]=useState<DiaryPage|null>(null);const navigate=(s:typeof screen)=>{setScreen(s);window.scrollTo(0,0);};
 if(!ready)return <div className="loading"><span className="wordmark">throit<span>✳</span></span></div>;
 return <div className={`app-shell ${screen==='editor'?'is-editor':screen==='feed'?'is-feed':''}`}><header className="site-header"><button className="wordmark" aria-label="throit 피드 홈" onClick={()=>navigate('feed')}>throit<span>✳</span></button><div className="header-right">{screen==='feed'&&<button className="icon-btn search-trigger" aria-label="검색 열기" onClick={()=>navigate('search')}><SearchIcon size={23}/></button>}</div></header>{error&&<div className="storage-error" role="alert">{error}<button onClick={retry}>다시 저장</button></div>}<main>{screen==='feed'?<Feed/>:screen==='search'?<Search onBack={()=>navigate('feed')}/>:screen==='bookshelf'?<Bookshelf onEdit={p=>{setEditing(p);navigate('editor');}}/>:screen==='profile'?<Profile/>:editing?<Editor initial={editing} onExit={()=>navigate('bookshelf')}/>:null}</main>{screen!=='editor'&&<nav className="bottom-nav" aria-label="하단 메뉴"><button className={screen==='feed'||screen==='search'?'active':''} aria-current={screen==='feed'?'page':undefined} onClick={()=>navigate('feed')} aria-label="피드" title="피드"><Home size={21}/></button><button className={screen==='bookshelf'?'active':''} aria-current={screen==='bookshelf'?'page':undefined} onClick={()=>navigate('bookshelf')} aria-label="＋ 책장" title="책장"><span className="book-nav-icon"><BookOpen size={22}/><Plus size={10}/></span></button><button className={screen==='profile'?'active':''} aria-current={screen==='profile'?'page':undefined} onClick={()=>navigate('profile')} aria-label="프로필" title="프로필"><UserRound size={21}/></button></nav>}{notice&&<div className="toast" role="status">{notice}</div>}</div>;
}
export default function App(){return <StoreProvider><AppShell/></StoreProvider>;}
