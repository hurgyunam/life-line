# Life Line

생존/캠프 시뮬레이션 게임

## 이 프로젝트에 대하여

이 프로젝트는 **AI 보조 개발(바이브코딩)**으로 설계·구현되었습니다. 단순히 코드를 생성받는 수준이 아니라, 아래를 직접 설계하고 유지합니다.

- **아키텍처·규칙**: 절대 경로(`@/`), 상태(Zustand), 밸런스 데이터 중앙화(`gameConfig`), i18n/저장 규칙 등 프로젝트 규칙을 정의하고 AI와 함께 일관되게 적용
- **품질 관리**: 생성된 코드의 리팩터링, 타입·상태 흐름 점검, 번역·활동 로그 등 도메인 로직 정합성 유지
- **도메인 이해**: 기획·UX를 코드와 번역, 스토리지 스키마까지 연결해 “왜 이렇게 구현했는지” 설명 가능

요즘처럼 AI가 개발 파이프라인에 들어온 환경에서, **프롬프트로 의도를 전달하고 결과를 검토·개선하는 역량**을 이 저장소와 산출물로 보여주고자 합니다.

### 제가 한 역할

코드 대부분은 AI가 생성했고, 저는 **방향을 정하고, 규칙을 정해 주고, 결과를 검토·수정**하는 쪽에 가깝게 참여했습니다.

- **규칙 정하기**: "이 경로 써라", "수치는 여기서만 관리", "저장 스키마/번역은 이렇게"처럼 `.cursor/rules`에 기준을 적어 두고, AI가 그걸 따르도록 했습니다.
- **검토·다듬기**: 나온 코드가 타입/상태 흐름에 맞는지, 도메인(예: 행동 지침 ↔ 활동 로그)이 서로 어긋나지 않는지 확인하고 필요하면 고쳤습니다.
- **설명 가능하게 유지**: 기획·UX와 코드/번역/스키마가 어떻게 연결되는지 스스로 이해하고, "왜 이렇게 했는지" 말할 수 있도록 정리해 두었습니다.

그래서 이 저장소는 "AI가 알아서 다 한 결과물"이 아니라, **제가 정한 제약과 검토를 거친 결과**라고 보시면 됩니다.

## 프로젝트 구조

| 경로                          | 설명                                                             |
| ----------------------------- | ---------------------------------------------------------------- |
| `src/components/`             | UI 컴포넌트 (Dashboard, SurvivorList, CampResources 등)          |
| `src/stores/`                 | Zustand 스토어 (survivorStore, gameTimeStore, campResourceStore) |
| `src/constants/gameConfig.ts` | 게임 밸런스 수치 (시간, 보상, 확률 등)                           |
| `src/types/`                  | TypeScript 타입 정의                                             |
| `src/i18n/locales/`           | 다국어 번역 (ko.json, en.json)                                   |
| `src/stories/`                | Storybook 예제 (게임과 무관)                                     |
| `docs/life-line-journal/`     | 기획/디자인 노트 (Obsidian)                                      |

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

| 라이브러리                                                                                      | 라이선스  | 저작권                              |
| ----------------------------------------------------------------------------------------------- | --------- | ----------------------------------- |
| [React](https://react.dev/)                                                                     | MIT       | Meta Platforms, Inc. and affiliates |
| [i18next](https://www.i18next.com/)                                                             | MIT       | i18next                             |
| [react-i18next](https://react.i18next.com/)                                                     | MIT       | 2015-present i18next                |
| [i18next-browser-languagedetector](https://github.com/i18next/i18next-browser-languageDetector) | MIT       | i18next                             |
| [Lucide Icons](https://lucide.dev/)                                                             | ISC / MIT | Cole Bemis, Lucide Contributors     |
| [Zustand](https://zustand.docs.pmnd.rs/)                                                        | MIT       | Paul Henschel                       |

### Dev Dependencies

| 라이브러리                                              | 라이선스   | 저작권                           |
| ------------------------------------------------------- | ---------- | -------------------------------- |
| [Vite](https://vitejs.dev/)                             | MIT        | VoidZero Inc., Vite contributors |
| [TypeScript](https://www.typescriptlang.org/)           | Apache-2.0 | Microsoft Corporation            |
| [Tailwind CSS](https://tailwindcss.com/)                | MIT        | Tailwind Labs, Inc.              |
| [PostCSS](https://postcss.org/)                         | MIT        | Andrey Sitnik                    |
| [Autoprefixer](https://github.com/postcss/autoprefixer) | MIT        | Andrey Sitnik                    |
| [Storybook](https://storybook.js.org/)                  | MIT        | Storybook contributors           |
