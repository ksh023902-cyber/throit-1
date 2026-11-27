import { test, expect, type Page } from '@playwright/test';
async function writeText(page:Page,text:string){await page.goto('/');await page.getByRole('navigation',{name:'하단 메뉴'}).getByRole('button',{name:'＋ 책장'}).click();await page.getByRole('button',{name:'내 작은 날들 열기'}).click();const tiles=page.locator('.page-tile');if(await tiles.count())await tiles.first().click();else await page.getByRole('button',{name:'첫 필렛 쓰기'}).click();const canvas=page.getByTestId('editor-canvas');await expect(canvas).toBeVisible();await page.getByRole('button',{name:'글쓰기',exact:true}).click();await page.getByRole('dialog',{name:'글쓰기'}).getByLabel('글 조각 내용').fill(text);await page.getByRole('button',{name:'추가',exact:true}).click();return canvas;}
test('first tap selects written text, a second tap edits it',async({page})=>{const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));const canvas=await writeText(page,'처음 쓴 글');
 const piece=canvas.getByRole('button',{name:'글 선택: 처음 쓴 글'});await expect(piece).toBeVisible();
 // tapping empty paper clears the selection and hides the size handle
 const box=(await canvas.boundingBox())!;await page.mouse.click(box.x+box.width*.5,box.y+box.height*.08);await expect(canvas.getByRole('button',{name:'글 크기 조절'})).toHaveCount(0);
 await piece.click();await expect(page.getByRole('dialog')).toHaveCount(0);await expect(canvas.getByRole('button',{name:'글 크기 조절'})).toBeVisible();
 await piece.click();const dialog=page.getByRole('dialog',{name:'글 수정'});await expect(dialog.getByLabel('글 조각 내용')).toHaveValue('처음 쓴 글');await dialog.getByLabel('글 조각 내용').fill('고친 글');await dialog.getByRole('button',{name:'수정',exact:true}).click();
 await expect(canvas.locator('.paper-element.text .handwritten',{hasText:'고친 글'})).toHaveCount(1);await expect(canvas.getByText('처음 쓴 글')).toHaveCount(0);
 const b=(await canvas.getByRole('button',{name:'글 선택: 고친 글'}).boundingBox())!;await page.mouse.move(b.x+10,b.y+10);await page.mouse.down();await page.mouse.move(b.x+60,b.y+40,{steps:6});await page.mouse.up();await expect(page.getByRole('dialog')).toHaveCount(0);
 await page.getByRole('button',{name:'글쓰기',exact:true}).click();await expect(page.getByRole('dialog',{name:'글쓰기'}).getByLabel('글 조각 내용')).toHaveValue('');
 expect(errors).toEqual([]);});
test('the size handle on the top right resizes the text box and its letters',async({page})=>{const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));const canvas=await writeText(page,'크기 조절');
 const piece=canvas.getByRole('button',{name:'글 선택: 크기 조절'});const text=piece.locator('.handwritten');const font=()=>text.evaluate(e=>parseFloat(getComputedStyle(e).fontSize));
 const w0=(await piece.boundingBox())!.width;const f0=await font();
 const handle=canvas.getByRole('button',{name:'글 크기 조절'});await expect(handle).toBeVisible();const h=(await handle.boundingBox())!;const pb=(await piece.boundingBox())!;expect(h.x+h.width/2).toBeGreaterThan(pb.x+pb.width-4);expect(h.y+h.height/2).toBeLessThan(pb.y+4);
 // drag the handle in toward the box to shrink it
 await page.mouse.move(h.x+h.width/2,h.y+h.height/2);await page.mouse.down();await page.mouse.move(h.x+h.width/2-70,h.y+h.height/2+30,{steps:8});await page.mouse.up();
 await expect.poll(async()=>(await piece.boundingBox())!.width).toBeLessThan(w0-40);expect(await font()).toBeLessThan(f0);await expect(page.getByRole('dialog')).toHaveCount(0);
 const f1=await font();await page.getByRole('button',{name:'되돌리기'}).click();await expect.poll(font).toBeGreaterThan(f1);
 // still saved after reload
 await canvas.getByRole('button',{name:'글 선택: 크기 조절'}).click();const h2=(await handle.boundingBox())!;await page.mouse.move(h2.x+h2.width/2,h2.y+h2.height/2);await page.mouse.down();await page.mouse.move(h2.x+h2.width/2-50,h2.y+h2.height/2+20,{steps:6});await page.mouse.up();const f2=await font();expect(f2).toBeLessThan(f0);
 await page.waitForTimeout(800);await page.reload();await page.getByRole('navigation',{name:'하단 메뉴'}).getByRole('button',{name:'＋ 책장'}).click();await page.getByRole('button',{name:'내 작은 날들 열기'}).click();await page.locator('.page-tile').first().click();await expect.poll(()=>canvas.getByRole('button',{name:'글 선택: 크기 조절'}).locator('.handwritten').evaluate(e=>parseFloat(getComputedStyle(e).fontSize))).toBeCloseTo(f2,0);
 expect(errors).toEqual([]);});
