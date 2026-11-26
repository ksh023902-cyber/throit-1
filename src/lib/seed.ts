import type { AppData, DiaryPage } from '../types';
const base = { diaryId: 'community', strokes: [], createdAt: '2026-11-20T09:00:00Z', publishedAt: '2026-11-20T09:00:00Z' };
export const seedPages: DiaryPage[] = [
 { ...base, id: 'seed-tea', authorId: 'slow.sunday', title: '별일 없어서 더 좋았던 하루', body: '늦은 오후, 조금 식은 차 한 잔.\n창가에 앉아 아무것도 하지 않았다.\n\n이런 날도 오래 기억하고 싶어.\n별일 없는 하루가 주는 다정함을.', tags: ['일상', '작은행복', '기록'], theme: 'cream', elements: [
 { id:'s1',kind:'text',x:8,y:8,width:81,rotation:-2,text:'별일 없어서\n더 좋았던 하루.' },
 { id:'s2',kind:'photo',x:42,y:34,width:48,rotation:6,assetId:'/images/diary-memory.png',attachment:{kind:'text',text:'말없이 건네는 따뜻한 차.\n같이 걷는 평범한 하루가 오래도록 함께하는 사랑이 되기를.'}},
 { id:'s3',kind:'text',x:8,y:39,width:32,rotation:-3,text:'따뜻한 차,\n느린 오후.\n\n오늘의 행복은\n생각보다\n가까이에 있었다.'},
 { id:'s4',kind:'sticker',x:12,y:72,width:19,rotation:-12,text:'✿',attachment:{kind:'text',text:'오늘의 작은 행복\n☑ 창문을 열고 햇빛 쐬기\n☑ 따뜻한 차 마시기\n☑ 다정한 말 한마디 건네기'}},
 { id:'s5',kind:'text',x:39,y:82,width:50,rotation:2,text:'nothing special,\nbut everything I needed.' }
 ]},
 { ...base,id:'seed-walk',authorId:'on.my.way',title:'돌아가는 길에 만난 초록',body:'늘 걷던 길에서 새로운 잎을 발견했다.\n천천히 걸으면 보이는 것들.\n오늘은 한 정거장 먼저 내리길 잘했어.',tags:['산책','일상','초록'],theme:'mint',elements:[{id:'w1',kind:'text',x:9,y:10,width:83,rotation:1,text:'조금 돌아가도\n괜찮은 날.'},{id:'w2',kind:'sticker',x:27,y:35,width:45,rotation:-10,text:'❋',attachment:{kind:'text',text:'산책 메모\n늘 가던 길의 옆 골목. 오래된 나무 한 그루.\n휴대폰은 주머니에 넣어두기.'}},{id:'w3',kind:'text',x:13,y:72,width:75,rotation:-2,text:'서두르지 않아도,\n우리는 조금씩 자라고 있으니까.'}]},
 { ...base,id:'seed-night',authorId:'dear.moon',title:'잠들기 전, 마음 정리',body:'잘하지 못한 일보다 잘 버틴 순간을 세어본다.\n작은행복을 잊지 않으려고 오늘도 한 줄.\n내일의 나에게, 괜찮아.',tags:['기록','밤','작은행복'],theme:'lavender',elements:[{id:'n1',kind:'text',x:10,y:10,width:85,rotation:-1,text:'오늘의 나에게,\n수고했다고.'},{id:'n2',kind:'sticker',x:55,y:35,width:26,rotation:12,text:'☾',attachment:{kind:'text',text:'모든 걸 끝내지 않아도 괜찮아.\n쉬는 것도 오늘 해야 할 일 중 하나.'}},{id:'n3',kind:'text',x:12,y:55,width:72,rotation:2,text:'마음에 남은 것들\n\n좋아하는 노래 한 곡\n집으로 가는 길의 달\n잘 도착했냐는 짧은 메시지'}]},
 { ...base,id:'seed-travel',authorId:'paper.trip',title:'다음 여행의 첫 페이지',body:'기차표 대신 마음부터 챙겼다.\n여행 계획: 바다를 보고, 낯선 골목을 걷고, 느리게 아침 먹기.',tags:['여행','계획','바다'],theme:'white',elements:[{id:'t1',kind:'text',x:10,y:10,width:85,rotation:-2,text:'어디로든,\n나를 데리고.'},{id:'t2',kind:'sticker',x:27,y:37,width:45,rotation:7,text:'✈',attachment:{kind:'text',text:'여행 준비\n노트, 펜, 좋아하는 책.\n그리고 조금의 용기.'}},{id:'t3',kind:'text',x:14,y:73,width:76,rotation:0,text:'아직 떠나지 않았지만\n이미 시작된 이야기.'}]}
];
export function initialData(): AppData { return { version:1,profile:{id:'me',handle:'my.little.days',bio:'평범한 하루를, 조금 더 오래.'},diaries:[{id:'my-diary',title:'내 작은 날들',cover:'charcoal'},{id:'my-notes',title:'문득 떠오른 생각',cover:'linen'}],drafts:[],published:structuredClone(seedPages),savedIds:[] }; }
