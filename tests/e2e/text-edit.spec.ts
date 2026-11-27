import { test, expect } from '@playwright/test';
test('tap written text in 글쓰기 mode to edit it',async({page})=>{const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.getByRole('navigation',{name:'하단 메뉴'}).getByRole('button',{name:'＋ 책장'}).click();await page.getByRole('button',{name:'내 작은 날들 열기'}).click();const tiles=page.locator('.page-tile');if(await tiles.count())await tiles.first().click();else await page.getByRole('button',{name:'첫 필렛 쓰기'}).click();const canvas=page.getByTestId('editor-canvas');await expect(canvas).toBeVisible();
 await page.getByRole('button',{name:'글쓰기',exact:true}).click();await page.getByRole('dialog',{name:'글쓰기'}).getByLabel('글 조각 내용').fill('처음 쓴 글');await page.getByRole('button',{name:'추가',exact:true}).click();
 const piece=canvas.getByRole('button',{name:'글 선택: 처음 쓴 글'});await expect(piece).toBeVisible();await piece.click();
 const dialog=page.getByRole('dialog',{name:'글 수정'});await expect(dialog.getByLabel('글 조각 내용')).toHaveValue('처음 쓴 글');await dialog.getByLabel('글 조각 내용').fill('고친 글');await dialog.getByRole('button',{name:'수정',exact:true}).click();
 await expect(canvas.locator('.paper-element.text .handwritten',{hasText:'고친 글'})).toHaveCount(1);await expect(canvas.getByText('처음 쓴 글')).toHaveCount(0);
 const b=(await canvas.getByRole('button',{name:'글 선택: 고친 글'}).boundingBox())!;await page.mouse.move(b.x+10,b.y+10);await page.mouse.down();await page.mouse.move(b.x+60,b.y+40,{steps:6});await page.mouse.up();await expect(page.getByRole('dialog')).toHaveCount(0);
 await page.getByRole('button',{name:'글쓰기',exact:true}).click();await expect(page.getByRole('dialog',{name:'글쓰기'}).getByLabel('글 조각 내용')).toHaveValue('');
 expect(errors).toEqual([]);});
