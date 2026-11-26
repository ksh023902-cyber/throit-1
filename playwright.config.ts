import { defineConfig } from '@playwright/test';

// 기본으로 Playwright가 설치한 Chromium을 사용합니다 (`npx playwright install chromium`).
// 다른 Chrome을 쓰고 싶다면 CHROME_PATH 환경 변수에 실행 파일 경로를 넣으세요.
// 예) macOS: CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
const chromePath = process.env.CHROME_PATH;
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  use: {
    baseURL: 'http://127.0.0.1:5173',
    viewport: { width: 390, height: 844 },
    ...(chromePath ? { launchOptions: { executablePath: chromePath } } : {}),
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  reporter: isCI ? [['list'], ['html', { open: 'never' }], ['github']] : [['list'], ['html', { open: 'never' }]],
  webServer: {
    command: 'npm run dev -- --port 5173',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !isCI,
    timeout: 120000,
  },
});
