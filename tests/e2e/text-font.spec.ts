import { test, expect, type Page } from '@playwright/test';
async function openEditor(page:Page){await page.getByRole('navigation',{name:'하단 메뉴'}).getByRole('button',{name:'＋ 책장'}).click();await page.getByRole('button',{name:'내 작은 날들 열기'}).click();const tiles=page.locator('.page-tile');if(await tiles.count())await tiles.first().click();else await page.getByRole('button',{name:'첫 필렛 쓰기'}).click();}
test('글쓰기에서 글꼴을 골라 쓰고, 고친 글꼴이 새로고침 뒤에도 남는다',async({page})=>{const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await openEditor(page);
 const canvas=page.getByTestId('editor-canvas');await page.getByRole('button',{name:'글쓰기',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'글쓰기'});const picker=dialog.getByRole('group',{name:'글꼴'});
 await expect(picker.getByRole('button',{name:'나눔손글씨 펜'})).toHaveAttribute('aria-pressed','true');await expect(picker.getByRole('button')).toHaveCount(16);
 await picker.getByRole('button',{name:'개구'}).click();await expect(picker.getByRole('button',{name:'개구'})).toHaveAttribute('aria-pressed','true');
 await expect(dialog.getByLabel('글 조각 내용')).toHaveCSS('font-family',/Gaegu/);
 await dialog.getByLabel('글 조각 내용').fill('개구 글씨');await dialog.getByRole('button',{name:'추가',exact:true}).click();
 const text=canvas.locator('.handwritten',{hasText:'개구 글씨'});await expect(text).toHaveAttribute('data-font','gaegu');await expect(text).toHaveCSS('font-family',/Gaegu/);
 // 다음 새 글은 마지막에 고른 글꼴로 시작
 await page.getByRole('button',{name:'글쓰기',exact:true}).click();await expect(page.getByRole('dialog',{name:'글쓰기'}).getByRole('button',{name:'개구'})).toHaveAttribute('aria-pressed','true');await page.getByRole('dialog',{name:'글쓰기'}).getByRole('button',{name:/닫기/}).click();
 // 방금 쓴 글은 이미 골라져 있어서 한 번 탭하면 수정 창이 열린다
 const piece=canvas.getByRole('button',{name:'글 선택: 개구 글씨'});await piece.click();
 const edit=page.getByRole('dialog',{name:'글 수정'});await expect(edit.getByRole('button',{name:'개구'})).toHaveAttribute('aria-pressed','true');await edit.getByRole('button',{name:'명조'}).click();await edit.getByRole('button',{name:'수정',exact:true}).click();
 await expect(text).toHaveAttribute('data-font','myeongjo');await expect(text).toHaveCSS('font-family',/Noto Serif KR/);
 await page.waitForTimeout(600);await page.reload();await openEditor(page);await expect(page.getByTestId('editor-canvas').locator('.handwritten',{hasText:'개구 글씨'}).first()).toHaveAttribute('data-font','myeongjo');
 expect(errors).toEqual([]);});
