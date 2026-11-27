import { test, expect, type Page } from '@playwright/test';
async function openEditor(page:Page){await page.getByRole('navigation',{name:'하단 메뉴'}).getByRole('button',{name:'＋ 책장'}).click();await page.getByRole('button',{name:'내 작은 날들 열기'}).click();const tiles=page.locator('.page-tile');if(await tiles.count())await tiles.first().click();else await page.getByRole('button',{name:'첫 필렛 쓰기'}).click();await expect(page.getByTestId('editor-canvas')).toBeVisible();}
async function scribble(page:Page,y:number){const pad=page.getByTestId('sticker-pad');const box=(await pad.boundingBox())!;await page.mouse.move(box.x+box.width*.2,box.y+box.height*y);await page.mouse.down();for(let k=1;k<=16;k++)await page.mouse.move(box.x+box.width*(.2+.6*k/16),box.y+box.height*y+Math.sin(k/2)*20);await page.mouse.up();}
test('draw a sticker, save it to the library, place it and reuse it after reload',async({page})=>{const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await openEditor(page);const canvas=page.getByTestId('editor-canvas');
 const before=await canvas.locator('.image-sticker').count();
 await page.getByRole('button',{name:'스티커',exact:true}).click();await page.getByRole('button',{name:'직접 그려서 만들기'}).click();
 const dialog=page.getByRole('dialog',{name:'스티커 그리기'});await expect(dialog).toBeVisible();const save=dialog.getByRole('button',{name:'스티커로 저장'});await expect(save).toBeDisabled();
 await scribble(page,.35);const tray=dialog.getByRole('group',{name:'펜 설정'});await tray.getByRole('radio',{name:'붓펜'}).click();await tray.getByRole('radio',{name:'빨강'}).click();await scribble(page,.6);
 const pad=page.getByTestId('sticker-pad');await expect(pad.locator('[data-pen]')).toHaveCount(2);await expect(pad.locator('path[data-pen="brush"]')).toHaveAttribute('fill','#c8453d');
 await dialog.getByRole('button',{name:'그림 되돌리기'}).click();await expect(pad.locator('[data-pen]')).toHaveCount(1);await scribble(page,.6);
 await save.click();await expect(dialog).toBeHidden();
 const stickers=canvas.locator('.image-sticker img');await expect(stickers).toHaveCount(before+1);
 const size=await stickers.last().evaluate(async(img:HTMLImageElement)=>{await img.decode();const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;const x=c.getContext('2d')!;x.drawImage(img,0,0);return {w:img.naturalWidth,h:img.naturalHeight,corner:x.getImageData(0,0,1,1).data[3]};});
 expect(size.w).toBeGreaterThan(50);expect(size.corner).toBe(0);
 await page.waitForTimeout(800);await page.reload();await openEditor(page);await expect(canvas.locator('.image-sticker img')).toHaveCount(before+1);
 await page.getByRole('button',{name:'스티커',exact:true}).click();const saved=page.locator('.sticker-picker img[alt="저장된 이미지 스티커"]');await expect(saved.last()).toBeVisible();await saved.last().click();await expect(canvas.locator('.image-sticker img')).toHaveCount(before+2);
 expect(errors).toEqual([]);});
