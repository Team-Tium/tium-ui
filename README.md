# Tium — 프론트엔드

낯선 사람과 대화를 연습하고 AI 피드백으로 화술을 개선하는 서비스.

## 시작하기

```bash
git clone https://github.com/Team-Tium/tium-ui.git && cd tium-ui
npm ci          # npm install 이 아니다. 락파일 그대로 설치해야 6개월 뒤에도 같은 빌드가 나온다
npm run dev     # 개발 서버
npm run build   # 프로덕션 빌드 (tsc -b && vite build)
```

Node 버전은 `.nvmrc`에 있다. `nvm use` 하면 맞춰진다.

## 환경변수

`.env.example`에 필요한 키 목록이 있다. 소셜 client_id 는 각자 `.env.local`에 채운다.

```bash
cp .env.example .env.local
```

`VITE_` 가 붙은 값은 **빌드 결과에 그대로 박혀 브라우저에서 다 보인다.** 비밀 값을 넣지 마라.
소셜 client_id 는 공개돼도 되는 값이고, client secret 은 백엔드에만 있다.

운영 환경변수는 Vercel 대시보드에서 넣는다. `.env.production` 파일은 만들지 않는다.

## 폴더

```
src/
  app/        providers/ (Query·Auth·ErrorBoundary), router/ (라우트 정의, 가드)
  features/   도메인별. auth chat call random feed feedback my
              각 도메인 안은 api/ components/ pages/ types.ts 로 같은 모양
  shared/     두 도메인 이상이 쓰는 것. api/ components/ lib/ constants/ hooks/
  layouts/    탭바 레이아웃
  index.css   디자인 토큰 (CSS 변수)
```

몇 가지 규칙:

- `features/` 끼리 직접 import 하지 않는다. 둘 이상이 쓰면 `shared/` 로 올린다.
- API 는 전부 `shared/api` 의 인스턴스를 쓴다. 컴포넌트에서 `fetch`/`axios` 를 직접 부르지 않는다.
- 서버 데이터는 TanStack Query 로 가져온다. `useState` + `useEffect` 로 API 를 부르지 않는다.
- 색과 간격은 `index.css` 의 토큰만 쓴다. 색상 값을 하드코딩하지 않는다.
- **Tailwind v4 다.** 토큰은 `@theme` 블록으로 연결한다. `tailwind.config.js` 를 만들지 마라.
- 다크모드는 없다. 폰트는 Pretendard, 아이콘은 lucide-react 만 쓴다.

## 스택

React 19 · Vite 8 · TypeScript 6 · Tailwind v4 · shadcn(Base UI, `base-nova`) · React Router 7 ·
TanStack Query · axios · react-hook-form + zod · oxlint (`npm run lint`) · 배포 Vercel
