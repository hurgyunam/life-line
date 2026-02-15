# Life Line

생존/캠프 시뮬레이션 게임

## 프로젝트 구조

| 경로 | 설명 |
|------|------|
| `src/components/` | UI 컴포넌트 (Dashboard, SurvivorList, CampResources 등) |
| `src/stores/` | Zustand 스토어 (survivorStore, gameTimeStore, campResourceStore) |
| `src/constants/gameConfig.ts` | 게임 밸런스 수치 (시간, 보상, 확률 등) |
| `src/types/` | TypeScript 타입 정의 |
| `src/i18n/locales/` | 다국어 번역 (ko.json, en.json) |
| `src/stories/` | Storybook 예제 (게임과 무관) |
| `docs/life-line-journal/` | 기획/디자인 노트 (Obsidian) |

## 기술 스택

- React 18, Vite 6, TypeScript
- Zustand, react-i18next, Tailwind CSS, Lucide Icons

## 개발

```bash
yarn install
yarn dev
```

## Third-party Licenses

이 프로젝트는 다음 오픈소스 라이브러리를 사용합니다. 상세 내용은 [LICENSE](LICENSE) 파일을 참고하세요.

### Production Dependencies

| 라이브러리 | 라이선스 | 저작권 |
|-----------|----------|--------|
| [React](https://react.dev/) | MIT | Meta Platforms, Inc. and affiliates |
| [i18next](https://www.i18next.com/) | MIT | i18next |
| [react-i18next](https://react.i18next.com/) | MIT | 2015-present i18next |
| [i18next-browser-languagedetector](https://github.com/i18next/i18next-browser-languageDetector) | MIT | i18next |
| [Lucide Icons](https://lucide.dev/) | ISC / MIT | Cole Bemis, Lucide Contributors |
| [Zustand](https://zustand.docs.pmnd.rs/) | MIT | Paul Henschel |

### Dev Dependencies

| 라이브러리 | 라이선스 | 저작권 |
|-----------|----------|--------|
| [Vite](https://vitejs.dev/) | MIT | VoidZero Inc., Vite contributors |
| [TypeScript](https://www.typescriptlang.org/) | Apache-2.0 | Microsoft Corporation |
| [Tailwind CSS](https://tailwindcss.com/) | MIT | Tailwind Labs, Inc. |
| [PostCSS](https://postcss.org/) | MIT | Andrey Sitnik |
| [Autoprefixer](https://github.com/postcss/autoprefixer) | MIT | Andrey Sitnik |
| [Storybook](https://storybook.js.org/) | MIT | Storybook contributors |
