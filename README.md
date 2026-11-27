# throit — 모바일 웹 프로토타입

React + TypeScript + Vite. 흑백 앱 UI와 종이 질감의 다이어리 페이지.

## 실행

Node.js 24 이상에서:

```sh
npm ci
npm run dev
```

빌드: `npm run build`
도메인 테스트: `npm test`
브라우저 전체 흐름: `npm run test:e2e`

브라우저 테스트는 기본적으로 macOS의 Google Chrome을 사용합니다. 다른 환경에서는 `playwright.config.ts`의 `launchOptions.executablePath`를 해당 Chrome 경로로 바꾸거나, 설치된 Playwright Chromium을 사용하도록 제거하세요.

## 구조

- `src/screens/Feed.tsx`: 세로 스냅 피드와 보관
- `src/screens/Search.tsx`: 제목·태그·본문·글 조각 검색, 관련도 정렬
- `src/screens/Bookshelf.tsx`: 다이어리 생성, 표지, 페이지 목록
- `src/screens/Editor.tsx`: 작성, 펜, 사진, 스티커, 드래그, 크기·회전, 50단계 되돌리기, 게시
- `src/screens/Profile.tsx`: 사진·아이디·소개 편집, 내 게시/보관 목록
- `src/components/PageCanvas.tsx`: 읽기·편집·썸네일 공통 페이지 렌더러
- `src/components/PenTray.tsx`: 펜 종류·색상·굵기 선반
- `src/lib/fonts.ts`: 글쓰기 글꼴 16종(손글씨·붓/마커·고딕/명조/타자기, 모두 Google Fonts 무료 한글 글꼴), 글꼴별 크기 보정, 마지막에 고른 글꼴 기억
- `src/lib/pens.ts`: 펜 5종(볼펜·만년필·붓펜·연필·형광펜), 기본 팔레트, 속도·필압에 따른 굵기 계산
- `src/components/PageViewer.tsx`: 공통 큰 페이지 뷰어
- `src/components/StickerOpener.tsx`: 글·사진·영상 공통 첨부 뷰어
- `src/lib/domain.ts`: 검색·추천·게시 스냅샷 로직
- `src/lib/storage.ts`: IndexedDB 상태와 미디어 Blob 저장
- `src/lib/store.tsx`: 저장 큐, 오류 표시, 저장 재시도

## 저장과 게시

기록·프로필·보관 상태는 브라우저 IndexedDB `throit-v1`에 저장합니다. 사진과 영상은 별도 `media` 저장소에 Blob으로 보관합니다. 파일당 20MB 제한이 있습니다. 자료를 원격 서버에 업로드하지 않습니다.

초안(`drafts`)과 게시본(`published`)은 독립된 데이터입니다. ‘올리기’가 게시용 스냅샷을 생성하고, 다시 편집한 초안은 ‘다시 올리기’를 눌러야 게시 화면에 반영됩니다. 검색·피드·프로필의 올린 페이지는 게시본만 읽습니다. 올린 페이지는 현재 사용자의 authorId로, 보관한 페이지는 savedIds로 각각 필터링합니다.

보관 태그는 다음 피드 진입 또는 새로고침 때 추천 순서에 반영합니다. 현재 보고 있는 피드에서 보관을 눌러도 화면이 갑자기 바뀌지 않도록 방문 시점의 취향을 유지합니다.

이 버전은 기기 내 프로토타입입니다. 실제 사용자 간 게시/동기화나 계정 인증 백엔드는 없습니다. 첫 화면의 타 사용자 기록은 샘플 데이터입니다. 브라우저 데이터를 지우면 기록도 지워집니다. 로컬 주소와 배포 주소는 서로 다른 저장소를 사용합니다.

## 시안과 소재

기존 앱 화면 시안 파일/링크는 이번 작업에 제공되지 않았습니다. 요청된 하단 탭, 책장 표지와 하단 편집 도구를 기준으로 구성했습니다. 기존 `throit` 폴더의 다이어리 이미지를 샘플 페이지에 사용했습니다. 정확한 이전 시안과의 일치 여부는 미검증입니다.

## 검증 범위

`tests/e2e/journey.spec.ts`에서 작성 → 올리기 → 검색 → 보관 → 새로고침 → 프로필 다시 열기, 초안 노출 방지, 게시본 독립성, 펜·되돌리기·드래그, 글/사진/영상 첨부 복원, 프로필 사진·아이디 저장, 태그 추천, 모바일·데스크톱 가로 넘침을 확인합니다.

## 이미지 스티커 배경 제거

`@imgly/background-removal` 1.7.0으로 브라우저 내에서 배경을 제거합니다. 첫 사용 시 IMG.LY CDN에서 모델을 다운로드합니다. 원본 이미지는 서버에 전송하지 않습니다. 결과를 투명 PNG로 변환하고 피사체 주위 여백을 잘라 IndexedDB에 저장합니다. 해당 라이브러리는 AGPL-3.0 라이선스입니다. 공식 안내: https://github.com/imgly/background-removal-js
