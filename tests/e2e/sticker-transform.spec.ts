import { test, expect } from '@playwright/test';
test('stickers get the same size and angle handles as text',async({page})=>{const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.getByRole('navigation',{name:'하단 메뉴'}).getByRole('button',{name:'＋ 책장'}).click();await page.getByRole('button',{name:'내 작은 날들 열기'}).click();const tiles=page.locator('.page-tile');if(await tiles.count())await tiles.first().click();else await page.getByRole('button',{name:'첫 필렛 쓰기'}).click();const canvas=page.getByTestId('editor-canvas');await expect(canvas).toBeVisible();
 await page.getByRole('button',{name:'스티커',exact:true}).click();await page.getByRole('button',{name:'★ 스티커 추가'}).click();
 const piece=canvas.locator('.paper-element.sticker').last();const glyph=piece.locator('.sticker-symbol');const font=()=>glyph.evaluate(e=>parseFloat(getComputedStyle(e).fontSize));const rot=()=>piece.evaluate(e=>parseFloat((e as HTMLElement).style.transform.match(/rotate\((-?[\d.]+)deg\)/)![1]));
 const size=canvas.getByRole('button',{name:'스티커 크기 조절'}),turn=canvas.getByRole('button',{name:'스티커 각도 조절'});await expect(size).toBeVisible();await expect(turn).toBeVisible();
 // grow the sticker by dragging the top-right handle outward
 const w0=(await piece.boundingBox())!.width,f0=await font();const h=(await size.boundingBox())!;await page.mouse.move(h.x+h.width/2,h.y+h.height/2);await page.mouse.down();await page.mouse.move(h.x+h.width/2+60,h.y+h.height/2-30,{steps:8});await page.mouse.up();
 await expect.poll(async()=>(await piece.boundingBox())!.width).toBeGreaterThan(w0+40);expect(await font()).toBeGreaterThan(f0);await expect(page.getByRole('dialog')).toHaveCount(0);
 // swing the top-left handle 30° clockwise
 const pb=(await piece.boundingBox())!;const cx=pb.x+pb.width/2,cy=pb.y+pb.height/2;const t=(await turn.boundingBox())!;const hx=t.x+t.width/2,hy=t.y+t.height/2;const r=Math.hypot(hx-cx,hy-cy),a0=Math.atan2(hy-cy,hx-cx);await page.mouse.move(hx,hy);await page.mouse.down();for(let k=1;k<=10;k++){const a=a0+Math.PI/6*k/10;await page.mouse.move(cx+r*Math.cos(a),cy+r*Math.sin(a));}await page.mouse.up();
 expect(await rot()).toBeGreaterThan(24);expect(await rot()).toBeLessThan(36);
 await page.getByRole('button',{name:'되돌리기'}).click();await expect.poll(rot).toBe(0);
 expect(errors).toEqual([]);});
