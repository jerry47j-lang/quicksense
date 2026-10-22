# QuickSense · 快懂

[English](README.md) · [繁體中文](README.zh-TW.md) · [한국어](README.ko.md) · [日本語](README.ja.md)

**빠르게 이해하고, 매일 조금씩 배우세요.**

[무료 앱 열기](https://jerry47j-lang.github.io/quicksense/) · [데스크톱 개발 미리 보기](https://github.com/jerry47j-lang/quicksense/releases) · [검증 기록](docs/VALIDATION.md)

Windows와 macOS 브라우저에서 설치·계정·API 키·유료 백엔드 없이 시작합니다. 현재 UI와 학습 설명은 번체 중국어입니다. 네 언어 README는 UI 전체 현지화를 뜻하지 않습니다.

![실제 공개 앱](docs/images/free-web-app.png)

## 첫 1분

1. **先試一次：deadline**을 눌러 중국어 뜻을 보세요. 이름은 나중에 정해도 됩니다.
2. **查詢文字**에 단어나 문장을 붙여 넣고 **快懂一下**를 누르세요. 중국어 입력은 영어, 다른 입력은 번체 중국어가 기본 대상이며 직접 바꿀 수 있습니다.
3. 임의 문장은 **在 Google 翻譯開啟**를 누르면 입력과 선택 언어를 담은 공식 Google 번역이 새 탭에서 열립니다. 원문은 유지됩니다. 내장 무료 AI나 비공식 API가 아닌 외부 사이트 연결입니다. 클릭할 때만 Google에 전달되므로 허가 없는 기밀을 보내지 마세요.
4. 단어를 저장하거나 **把確認過的翻譯存回來**에서 확인한 번역을 붙여 넣으세요. **我的單字庫**에서 복습하고 **學習小徑**에서 학습합니다.

붙여넣기 권한이 없으면 Ctrl+V / Cmd+V를 사용하세요. 로딩 실패 시 입력을 유지하며 재시도와 외부 번역을 제공합니다. 결제를 요구하지 않습니다.

## 무료 기능과 제한

- ECDICT 영중 사전 **140,390 표제어 / 177,494 검색 형태, 19.2 MiB**. WordNet 2025 영어 사전 **127,311 표제어, 32.9 MiB**. 첫 글자별로 로드하며 **偏好設定**에서 전체 오프라인 자료 약 **52.1 MiB**를 저장합니다. 첫 접속/다운로드는 온라인이어야 하고 브라우저가 캐시를 지울 수 있습니다. 네이티브 패키지는 사전을 포함합니다.
- 여러 나라의 지역 표현 **62개**, 어감·자체 예문·출처. 역사적 사전과 입문 자료이며 모든 최신 유행어의 실시간 목록은 아닙니다.
- A1–B1 직장 영어 순차 수업 8개, 로컬 저장·간격 복습·JSON 백업/가져오기, 이름과 픽셀 캐릭터. 계정 동기화는 없습니다. 기기/주소 변경이나 데이터 삭제 전에 백업하세요.
- 지원 브라우저의 PWA 설치. 네이티브 트레이·전역 단축키는 포함하지 않습니다.

대상 선택은 외부 번역에 적용되며 기존 중국어 메모는 바꾸지 않습니다. 임의 문장의 문법 교정과 AI 답장 생성은 무료 오프라인 엔진에 없습니다. 공개 앱은 서비스 비밀번호를 받거나 유료 서비스를 호출하지 않습니다. 고급 네이티브 사용자는 [선택 AI 서비스](docs/TRANSLATION_SERVICE.md)를 배포할 수 있지만 키와 비용이 필요할 수 있습니다.

## 데스크톱 상태

Windows x64, Mac Apple Silicon, Mac Intel은 개발 미리 보기입니다. CI 빌드와 실제 기기 단축키·트레이·키 저장소 검증은 별개이며 후자는 미완료입니다. Windows 서명과 Apple 공증이 미완료라 차단될 수 있습니다. OS 보호를 유지하고 무료 웹 앱을 쓰세요.

## 개발과 배포

Node.js 22.12+가 필요하며 네이티브는 Rust 1.90+와 [Tauri 환경](https://v2.tauri.app/start/prerequisites/)도 필요합니다.

```sh
npm ci
npm run check
npm run dev
npm run build
node scripts/verify-dist.mjs
node scripts/verify-offline.mjs
npm run desktop
npm run desktop:build
```

Pages 소스를 GitHub Actions로 선택하고 '.github/workflows/pages.yml'로 배포합니다. 저장소 이름이 다르면 'vite.config.ts'의 base를 바꾸세요. 사전은 포함되어 있고 재생성은 'npm run dictionary:build', 'npm run dictionary:bilingual'입니다. 무료 공개 Pages에도 [사용량 제한](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)이 있으며 Google 가용성은 본 프로젝트가 제어하지 않습니다.

## 전 과정에서 Codex 사용

Jerry가 방향을 정하고 결과를 검토하며 Codex와 조사·인터랙션 디자인·개발·테스트·문서를 진행합니다. [BUILD_LOG](docs/BUILD_LOG.md), [VALIDATION](docs/VALIDATION.md)에 근거와 남은 검증을 기록합니다. 하지 않은 초보자/실기기 테스트를 완료했다고 주장하지 않습니다.

## 도움과 라이선스

[문제 해결](docs/GETTING_STARTED.md) · [FAQ 및 개인정보](docs/FAQ_PRIVACY.md) · [문제 신고](https://github.com/jerry47j-lang/quicksense/issues/new/choose). 버전·브라우저·재현 절차를 쓰고 기밀은 빼주세요. 지역 기여에는 지역·어감·출처·날짜가 있는 자체 예문이 필요합니다.

코드 MIT, ECDICT MIT, WordNet CC BY 4.0 및 Princeton 조건. [고지](THIRD_PARTY_NOTICES.md)를 확인하세요. 개인 검색은 커밋하지 않습니다.
