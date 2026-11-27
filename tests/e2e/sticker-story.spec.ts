import { test, expect } from '@playwright/test';
test('a sticker handle opens its hidden story; big photos are shrunk and shown as a preview',async({page})=>{const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.getByRole('navigation',{name:'하단 메뉴'}).getByRole('button',{name:'＋ 책장'}).click();await page.getByRole('button',{name:'내 작은 날들 열기'}).click();const tiles=page.locator('.page-tile');if(await tiles.count())await tiles.first().click();else await page.getByRole('button',{name:'첫 필렛 쓰기'}).click();const canvas=page.getByTestId('editor-canvas');await expect(canvas).toBeVisible();
 await page.getByRole('button',{name:'스티커',exact:true}).click();await page.getByRole('button',{name:'☾ 스티커 추가'}).click();
 // the paperclip handle on the selected sticker opens the story dialog directly
 await canvas.getByRole('button',{name:'스티커 속 이야기 넣기'}).click();const dialog=page.getByRole('dialog',{name:'스티커에 이야기 연결'});await expect(dialog).toBeVisible();
 await dialog.getByRole('button',{name:'사진',exact:true}).click();await expect(dialog.getByRole('button',{name:'사진 고르기'})).toBeVisible();
 const big=await page.evaluate(async()=>{const c=document.createElement('canvas');c.width=3200;c.height=2400;const x=c.getContext('2d')!;for(let i=0;i<400;i++){x.fillStyle=`hsl(${i*37%360} 70% 60%)`;x.fillRect(Math.random()*3200,Math.random()*2400,300,200);}const b:Blob=await new Promise(r=>c.toBlob(b=>r(b!),'image/jpeg',.95));return Array.from(new Uint8Array(await b.arrayBuffer()));});
 await page.getByLabel('연결할 파일',{exact:true}).setInputFiles({name:'trip.jpg',mimeType:'image/jpeg',buffer:Buffer.from(big)});await expect(dialog).toHaveCount(0);
 // second tap on the selected sticker reopens it with a preview of the shrunk photo
 const sticker=canvas.getByRole('button',{name:/스티커 선택: ☾/});await expect(sticker.locator('.clip-badge')).toHaveCount(1);await sticker.click();await expect(dialog).toBeVisible();
 const preview=dialog.getByRole('img',{name:'지금 연결된 사진'});await expect(preview).toBeVisible();const w=await preview.evaluate(async(i:HTMLImageElement)=>{await i.decode();return Math.max(i.naturalWidth,i.naturalHeight);});expect(w).toBe(1600);
 await expect(dialog.getByRole('button',{name:'다른 사진으로 바꾸기'})).toBeVisible();
 // switch to a written story
 await dialog.getByRole('button',{name:'글',exact:true}).click();await dialog.getByRole('textbox',{name:'연결할 글'}).fill('달 스티커 속 비밀');await dialog.getByRole('button',{name:'연결하기',exact:true}).click();await expect(dialog).toHaveCount(0);
 await canvas.getByRole('button',{name:'스티커 속 이야기 바꾸기'}).click();await expect(dialog.getByRole('textbox',{name:'연결할 글'})).toHaveValue('달 스티커 속 비밀');
 expect(errors).toEqual([]);});
