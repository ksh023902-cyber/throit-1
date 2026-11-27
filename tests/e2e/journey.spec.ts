import { test, expect, type Page } from '@playwright/test';

const nav = (page: Page) => page.getByRole('navigation', { name: '하단 메뉴' });
const dialog = (page: Page, name: string) => page.getByRole('dialog', { name });

/** 책장 → '내 작은 날들' → 새 필렛을 열어 편집 화면으로 들어갑니다. */
async function startPage(page: Page) {
  await nav(page).getByRole('button', { name: '＋ 책장' }).click();
  await page.getByRole('button', { name: '내 작은 날들 열기' }).click();
  await page.getByRole('button', { name: '필렛 추가', exact: true }).click();
}

/** 편집 화면에서 '글쓰기'로 글 조각을 추가합니다. */
async function writeText(page: Page, text: string) {
  await page.getByRole('toolbar', { name: '편집 도구' }).getByRole('button', { name: '글쓰기', exact: true }).click();
  const panel = dialog(page, '글쓰기');
  await panel.getByRole('textbox', { name: '글 조각 내용' }).fill(text);
  await panel.getByRole('button', { name: '추가', exact: true }).click();
  await expect(panel).toHaveCount(0);
}

/** '올리기' 창을 열어 제목(과 태그)을 적습니다. */
async function openPublish(page: Page, title: string, tags?: string) {
  await page.getByRole('toolbar', { name: '편집 도구' }).getByRole('button', { name: '올리기', exact: true }).click();
  const panel = dialog(page, '올리기');
  await panel.getByRole('textbox', { name: '필렛 제목', exact: true }).fill(title);
  if (tags !== undefined) await panel.getByRole('textbox', { name: '태그', exact: true }).fill(tags);
  return panel;
}

async function publish(page: Page, title: string, tags?: string) {
  const panel = await openPublish(page, title, tags);
  await panel.getByRole('button', { name: '올리기', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('필렛을 올렸어요');
}

/** 스티커 창에서 기본 스티커를 하나 추가합니다. 추가된 스티커가 선택된 상태가 됩니다. */
async function addSticker(page: Page, symbol: string) {
  await page.getByRole('toolbar', { name: '편집 도구' }).getByRole('button', { name: '스티커', exact: true }).click();
  await dialog(page, '스티커').getByRole('button', { name: `${symbol} 스티커 추가`, exact: true }).click();
  await expect(dialog(page, '스티커')).toHaveCount(0);
}

/** 선택된 조각의 '편집' 창 → '이야기 연결' 창을 엽니다. */
async function openAttach(page: Page) {
  await page.getByRole('toolbar', { name: '편집 도구' }).getByRole('button', { name: '배치', exact: true }).click();
  await dialog(page, '편집').getByRole('button', { name: '이야기 연결' }).click();
  return dialog(page, '스티커에 이야기 연결');
}

async function closeElementPanel(page: Page) {
  await dialog(page, '편집').getByRole('button', { name: '닫기' }).click();
  await expect(dialog(page, '편집')).toHaveCount(0);
}

async function search(page: Page, q: string) {
  await nav(page).getByRole('button', { name: '피드', exact: true }).click();
  await page.getByRole('button', { name: '검색 열기' }).click();
  await page.getByRole('textbox', { name: '제목, 태그, 본문 검색' }).fill(q);
}

test('write → publish → search → save → reload → profile → reopen', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'throit 피드 홈' })).toBeVisible();
  await expect(page.locator('.feed-slide').first()).toBeVisible();

  await startPage(page);
  await writeText(page, '비가 그친 골목에서 발견한 작은 행복.');
  await publish(page, '나의 테스트 산책', '산책, 작은행복');

  await search(page, '나의 테스트');
  await page.getByRole('button', { name: /나의 테스트 산책/ }).click();
  const viewer = dialog(page, '나의 테스트 산책');
  await expect(viewer).toBeVisible();
  await viewer.getByRole('button', { name: '보관하기', exact: true }).click();
  await expect(viewer.getByRole('button', { name: '보관됨' })).toBeVisible();
  await viewer.getByRole('button', { name: '닫기' }).click();

  await page.reload();
  await nav(page).getByRole('button', { name: '프로필', exact: true }).click();
  await expect(page.getByRole('button', { name: /나의 테스트 산책/ })).toBeVisible();
  await page.getByRole('button', { name: '보관한 필렛 보기 (1)' }).click();
  await page.getByRole('button', { name: /나의 테스트 산책/ }).click();
  await expect(page.getByRole('dialog').getByText('비가 그친 골목에서 발견한 작은 행복.', { exact: true }).last()).toBeVisible();
  expect(errors).toEqual([]);
});

test('drafts are private; later draft edits do not change published snapshots', async ({ page }) => {
  await page.goto('/');
  await startPage(page);
  await writeText(page, '처음 게시할 내용');
  // 제목만 적고 올리지 않은 채 창을 닫으면 초안으로만 남습니다.
  const panel = await openPublish(page, '비밀초안');
  await panel.getByRole('button', { name: '닫기' }).click();
  await page.getByRole('button', { name: '책장', exact: true }).click();

  await search(page, '비밀초안');
  await expect(page.getByText('기록 0개')).toBeVisible();
  await nav(page).getByRole('button', { name: '프로필', exact: true }).click();
  await expect(page.getByText('업로드 필렛 없음')).toBeVisible();

  await nav(page).getByRole('button', { name: '＋ 책장' }).click();
  await page.getByRole('button', { name: '내 작은 날들 열기' }).click();
  await page.getByRole('button', { name: /비밀초안/ }).click();
  await publish(page, '비밀초안');

  await page.getByRole('button', { name: '내 작은 날들 열기' }).click();
  await page.getByRole('button', { name: /비밀초안/ }).click();
  await writeText(page, '게시되지 않은 수정본');
  await page.getByRole('button', { name: '책장', exact: true }).click();

  await search(page, '게시되지');
  await expect(page.getByText('기록 0개')).toBeVisible();
  await page.getByRole('textbox', { name: '제목, 태그, 본문 검색' }).fill('처음 게시할');
  await expect(page.getByText('기록 1개')).toBeVisible();
});

test('pen, undo, drag, text sticker attachment and reload', async ({ page }) => {
  await page.goto('/');
  await startPage(page);

  await page.getByRole('button', { name: '펜', exact: true }).click();
  const canvas = page.getByTestId('editor-canvas');
  await canvas.scrollIntoViewIfNeeded();
  const box = (await canvas.boundingBox())!;
  await page.mouse.move(box.x + 30, box.y + 90);
  await page.mouse.down();
  await page.mouse.move(box.x + 130, box.y + 130, { steps: 10 });
  await page.mouse.up();
  await expect(canvas.locator('polyline')).toHaveCount(1);
  await page.getByRole('button', { name: '되돌리기' }).click();
  await expect(canvas.locator('polyline')).toHaveCount(0);

  await addSticker(page, '✿');
  const sticker = page.getByRole('button', { name: '스티커 선택: ✿', exact: true });
  await sticker.scrollIntoViewIfNeeded();
  const a = (await sticker.boundingBox())!;
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(a.x + a.width / 2 + 45, a.y + a.height / 2 + 25, { steps: 8 });
  await page.mouse.up();
  const b = (await sticker.boundingBox())!;
  expect(b.x).toBeGreaterThan(a.x + 20);

  const attach = await openAttach(page);
  await attach.getByRole('textbox', { name: '연결할 글' }).fill('스티커 안에 숨겨둔 오늘의 이야기');
  await attach.getByRole('button', { name: '연결하기', exact: true }).click();
  await closeElementPanel(page);
  await publish(page, '스티커연결테스트');

  await page.reload();
  await search(page, '스티커연결테스트');
  await page.getByRole('button', { name: /스티커연결테스트/ }).click();
  await page.getByRole('button', { name: '스티커 열기: ✿', exact: true }).click();
  await expect(dialog(page, '스티커 속 이야기')).toContainText('스티커 안에 숨겨둔 오늘의 이야기');
});

test('saved tags personalize the next visit and profile edits persist', async ({ page }) => {
  await page.goto('/');
  const first = page.locator('.feed-slide').first();
  await expect(first).toContainText('@midnight.reel');
  await first.getByRole('button', { name: '마음에 닿았다면, 보관' }).click();
  await expect(page.getByRole('status')).toContainText('보관');
  await page.reload();
  // 영화 리뷰 '엔딩 크레딧이 끝날 때까지'를 보관하면 태그(밤, OST)가 가장 많이 겹치는 '새벽 2시의 플레이리스트'(@side.b.tape)가 맨 앞에 옵니다.
  await expect(page.locator('.feed-slide').first()).toContainText('@side.b.tape');
  await expect(page.locator('.feed-slide').first()).toContainText('잠이 안 와서 만든 새벽 플레이리스트.');

  await nav(page).getByRole('button', { name: '프로필', exact: true }).click();
  await page.getByRole('button', { name: '프로필 편집' }).click();
  await page.getByRole('textbox', { name: '프로필 아이디' }).fill('new.diary');
  await page.getByRole('textbox', { name: '한 줄 소개' }).fill('매일 조금씩 쌓이는 나');
  await page.getByLabel('프로필 사진 변경').setInputFiles('public/images/avatar-flower.png');
  await page.getByRole('button', { name: '저장하기', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('프로필을 저장');
  await page.reload();
  await nav(page).getByRole('button', { name: '프로필', exact: true }).click();
  await expect(page.getByRole('heading', { name: '@new.diary' })).toBeVisible();
  await expect(page.getByAltText('내 프로필 사진')).toHaveJSProperty('complete', true);
});

test('background, photo and playable video attachments persist after refresh', async ({ page }) => {
  await page.goto('/');
  await startPage(page);

  // 배경 이미지: 업로드 → 위치 조절 창 → 완료
  await page.getByLabel('배경 이미지 파일', { exact: true }).setInputFiles('public/images/avatar-flower.png');
  const cropper = dialog(page, '배경 조절');
  await expect(cropper.getByRole('button', { name: '완료', exact: true })).toBeEnabled();
  await cropper.getByRole('button', { name: '완료', exact: true }).click();
  await expect(cropper).toHaveCount(0);
  await expect(page.getByTestId('editor-canvas').getByAltText('필렛 배경')).toBeVisible();

  // ✿ 스티커에 사진 연결
  await addSticker(page, '✿');
  let attach = await openAttach(page);
  await attach.getByRole('button', { name: '사진', exact: true }).click();
  await page.getByLabel('연결할 파일', { exact: true }).setInputFiles('public/images/avatar-flower.png');
  await expect(attach).toHaveCount(0);
  await closeElementPanel(page);

  // ★ 스티커에 영상 연결
  await addSticker(page, '★');
  attach = await openAttach(page);
  await attach.getByRole('button', { name: '영상', exact: true }).click();
  const bytes = await page.evaluate(async () => {
    const c = document.createElement('canvas');
    c.width = 80;
    c.height = 80;
    c.getContext('2d')!.fillRect(0, 0, 80, 80);
    const stream = c.captureStream(8);
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks: Blob[] = [];
    const result = new Promise<number[]>(resolve => {
      recorder.ondataavailable = e => chunks.push(e.data);
      recorder.onstop = async () => resolve(Array.from(new Uint8Array(await new Blob(chunks).arrayBuffer())));
    });
    recorder.start();
    await new Promise(r => setTimeout(r, 500));
    recorder.stop();
    return result;
  });
  await page.getByLabel('연결할 파일', { exact: true }).setInputFiles({ name: 'memory.webm', mimeType: 'video/webm', buffer: Buffer.from(bytes) });
  await expect(attach).toHaveCount(0);
  await closeElementPanel(page);
  await publish(page, '사진영상기록');

  await page.reload();
  await search(page, '사진영상기록');
  await page.getByRole('button', { name: /사진영상기록/ }).click();
  const viewer = dialog(page, '사진영상기록');
  await expect(viewer.getByAltText('필렛 배경')).toBeVisible();
  // 두 스티커가 일부 겹쳐 있으므로 ★에 가려지지 않는 ✿의 왼쪽 위를 누릅니다.
  await viewer.getByRole('button', { name: '스티커 열기: ✿', exact: true }).click({ position: { x: 10, y: 10 } });
  await expect(page.getByAltText('스티커에 연결된 사진')).toBeVisible();
  // 자료만 보이고, 바깥을 누르면 닫혀요
  await page.mouse.click(8, 8);
  await expect(dialog(page, '스티커 속 이야기')).toHaveCount(0);
  await expect(viewer).toBeVisible();
  await viewer.getByRole('button', { name: '스티커 열기: ★', exact: true }).click();
  await expect(page.locator('video')).toBeVisible();
  await expect.poll(() => page.locator('video').evaluate((v: HTMLVideoElement) => v.readyState)).toBeGreaterThan(0);
});

test('mobile and desktop layout have no horizontal overflow', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.feed-slide').first()).toBeVisible();
  await page.screenshot({ path: 'test-results/screenshots/throit-mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await nav(page).getByRole('button', { name: '＋ 책장' }).click();
  await page.screenshot({ path: 'test-results/screenshots/throit-bookshelf.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await nav(page).getByRole('button', { name: '피드', exact: true }).click();
  await page.screenshot({ path: 'test-results/screenshots/throit-desktop.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('viewers see only the uploaded story, centred, with no title or labels', async ({ page }) => {
  await page.goto('/');
  await startPage(page);
  await addSticker(page, '♡');
  await page.getByTestId('editor-canvas').getByRole('button', { name: '스티커 속 이야기 넣기' }).click();
  const attach = dialog(page, '스티커에 이야기 연결');
  await attach.getByRole('textbox', { name: '연결할 글' }).fill('오직 이 글만');
  await attach.getByRole('button', { name: '연결하기', exact: true }).click();
  await publish(page, '자료만보기');
  await search(page, '자료만보기');
  await page.getByRole('button', { name: /자료만보기/ }).click();
  await page.getByRole('button', { name: '스티커 열기: ♡', exact: true }).click();
  const story = dialog(page, '스티커 속 이야기');
  await expect(story).toBeVisible();
  // 제목·버튼 글씨 없이 넣어둔 글만, 화면 한가운데에
  expect((await story.innerText()).trim()).toBe('오직 이 글만');
  const box = (await story.locator('.story-text').boundingBox())!;
  const vw = page.viewportSize()!;
  expect(Math.abs(box.x + box.width / 2 - vw.width / 2)).toBeLessThan(3);
  expect(Math.abs(box.y + box.height / 2 - vw.height / 2)).toBeLessThan(3);
  await page.keyboard.press('Escape');
  await expect(story).toHaveCount(0);
  await expect(dialog(page, '자료만보기')).toBeVisible();
});

test('the feed shows no attachment badge on stickers', async ({ page }) => {
  await page.goto('/');
  await startPage(page);
  await addSticker(page, '✳');
  await page.getByTestId('editor-canvas').getByRole('button', { name: '스티커 속 이야기 넣기' }).click();
  const attach = dialog(page, '스티커에 이야기 연결');
  await attach.getByRole('textbox', { name: '연결할 글' }).fill('숨은 글');
  await attach.getByRole('button', { name: '연결하기', exact: true }).click();
  await expect(page.getByTestId('editor-canvas').locator('.clip-badge')).toHaveCount(1);
  await publish(page, '표시없음');
  await search(page, '표시없음');
  await page.getByRole('button', { name: /표시없음/ }).click();
  const viewer = dialog(page, '표시없음');
  await expect(viewer.getByRole('button', { name: '스티커 열기: ✳', exact: true })).toBeVisible();
  await expect(page.locator('.clip-badge')).toHaveCount(0);
});
